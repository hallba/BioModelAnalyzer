using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Text;
using Microsoft.WindowsAzure.Storage;
using Microsoft.WindowsAzure.Storage.Blob;
using Microsoft.WindowsAzure.Storage.Table;
using Newtonsoft.Json;

namespace BackendUtilities
{
    public class FailureAzureLogger : IFailureLogger
    {
        private CloudTableClient tableClient;
        private CloudTable failuresTable;
        private CloudBlobClient blobClient;
        private CloudBlobContainer failuresContainer;

        public FailureAzureLogger(CloudStorageAccount account)
        {
            if (account == null) throw new ArgumentNullException("account");
            tableClient = account.CreateCloudTableClient();
            blobClient = account.CreateCloudBlobClient();
            failuresContainer = blobClient.GetContainerReference("failures");
            failuresContainer.CreateIfNotExistsAsync().Wait();
            failuresTable = tableClient.GetTableReference("ServiceFailures");
            failuresTable.CreateIfNotExistsAsync().Wait();
        }

        public FailureAzureLogger(string connectionString) : this(CloudStorageAccount.Parse(connectionString))
        {
        }

        public void Add(DateTime dateTime, string backEndVersion, object request, ILogContents log)
        {
            var uniqueName = Guid.NewGuid().ToString();

            string inputBlobName = String.Concat(uniqueName, "_request");
            try
            {
                var inputBlob = failuresContainer.GetBlockBlobReference(inputBlobName);
                inputBlob.UploadTextAsync(JsonConvert.SerializeObject(request, Formatting.Indented)).Wait();
            }
            catch (Exception exc)
            {
                Trace.WriteLine("Error writing blob: " + exc.Message);
                inputBlobName = null;
            }

            string outputBlobName = String.Concat(uniqueName, "_result");
            try
            {
                var outputBlob = failuresContainer.GetBlockBlobReference(outputBlobName);
                using (var stream = outputBlob.OpenWriteAsync().Result)
                {
                    var writer = new StreamWriter(stream);
                    if (log.ErrorMessages != null && log.ErrorMessages.Length > 0)
                        writer.WriteLine("Error messages:\n{0}\n\n", String.Join("\n", log.ErrorMessages));
                    if (log.DebugMessages != null && log.DebugMessages.Length > 0)
                        writer.WriteLine("Debug messages:\n{0}\n", String.Join("\n", log.DebugMessages));
                    writer.Flush();
                }
            }
            catch (Exception exc)
            {
                Trace.WriteLine("Error writing blob: " + exc.Message);
                outputBlobName = null;
            }

            failuresTable.ExecuteAsync(TableOperation.Insert(new FailureEntity(uniqueName, backEndVersion)
            {
                DateTime = dateTime
            })).Wait();
        }
    }
}

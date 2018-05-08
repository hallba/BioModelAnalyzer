using Microsoft.WindowsAzure.Storage;
using Microsoft.WindowsAzure.Storage.Table;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BackendUtilities
{
    public class ActivityAzureLogger : IActivityLogger
    {
        private CloudTableClient tableClient;
        private CloudTable activityTable;

        public ActivityAzureLogger(CloudStorageAccount account)
        {
            tableClient = account.CreateCloudTableClient();
            activityTable = tableClient.GetTableReference("ClientActivity");
            activityTable.CreateIfNotExistsAsync().Wait();
        }

        public ActivityAzureLogger(string connectionString) : this(CloudStorageAccount.Parse(connectionString))
        {
        }

        public void Add(ActivityEntity entity)
        {
            activityTable.ExecuteAsync(TableOperation.Insert(entity)).Wait();
        }
    }
}

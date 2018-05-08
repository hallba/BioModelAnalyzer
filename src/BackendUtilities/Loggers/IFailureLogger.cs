using Microsoft.WindowsAzure.Storage;
using Microsoft.WindowsAzure.Storage.Blob;
using Microsoft.WindowsAzure.Storage.Table;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Text;

namespace BackendUtilities
{
    public class FailureEntity : TableEntity
    {
        public FailureEntity(string key, string backEndVersion)
        {
            this.RowKey = key;
            this.PartitionKey = backEndVersion;
        }

        public string BackEndVersion
        {
            get { return PartitionKey; }
        }

        public DateTime DateTime { get; set; }
    }

    public interface ILogContents
    {
        string[] ErrorMessages { get; }
        string[] DebugMessages { get; }
    }

    public interface IFailureLogger
    {
        void Add(DateTime dateTime, string backEndVersion, object request, ILogContents contents);
    }

    
}

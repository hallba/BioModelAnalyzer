using Microsoft.WindowsAzure.Storage.Table;
using System;
using System.Collections.Generic;
using System.Text;

namespace BackendUtilities
{
    public interface IActivityLogger
    {
        void Add(ActivityEntity entity);
    }

    public class ActivityEntity : TableEntity
    {
        public ActivityEntity(string sessionID, string userID)
        {
            this.RowKey = sessionID;
            this.PartitionKey = userID;
        }

        public string SessionID
        {
            get { return RowKey; }
        }

        public string UserID
        {
            get { return PartitionKey; }
        }

        public DateTime LogInTime { get; set; }

        public DateTime LogOutTime { get; set; }

        public Int32 RunProofCount { get; set; }

        public Int32 RunSimulationCount { get; set; }

        public Int32 NewModelCount { get; set; }

        public Int32 ImportModelCount { get; set; }

        public Int32 SaveModelCount { get; set; }

        public Int32 FurtherTestingCount { get; set; }

        public string ClientVersion { get; set; }

        public int SimulationErrorCount { get; set; }

        public int FurtherTestingErrorCount { get; set; }

        public int ProofErrorCount { get; set; }

        public int AnalyzeLTLCount { get; set; }

        public int AnalyzeLTLErrorCount { get; set; }
    }
}

using Newtonsoft.Json;
using Newtonsoft.Json.Converters;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BackendUtilities
{
    public class ActivityRecord
    {
        public string SessionID { get; set; }

        public string UserID { get; set; }

        [JsonConverter(typeof(IsoDateTimeConverter))]
        public DateTime LogInTime { get; set; }

        [JsonConverter(typeof(IsoDateTimeConverter))]
        public DateTime LogOutTime { get; set; }

        public Int32 RunProofCount { get; set; }

        public Int32 ProofErrorCount { get; set; }

        public Int32 RunSimulationCount { get; set; }

        public Int32 SimulationErrorCount { get; set; }

        public Int32 NewModelCount { get; set; }

        public Int32 ImportModelCount { get; set; }

        public Int32 SaveModelCount { get; set; }

        public Int32 FurtherTestingCount { get; set; }

        public Int32 FurtherTestingErrorCount { get; set; }

        public Int32 AnalyzeLTLCount { get; set; }

        public Int32 AnalyzeLTLErrorCount { get; set; }

        public string ClientVersion { get; set; }
    }
}

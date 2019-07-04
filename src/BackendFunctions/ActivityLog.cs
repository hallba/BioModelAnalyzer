using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.Azure.WebJobs.Host;
using Newtonsoft.Json;
using bma.BioCheck;
using BackendUtilities;
using System;

namespace BackendFunctions2
{
    public static class ActivityLog
    {
        [FunctionName("ActivityLog")]
        public static async void Run([HttpTrigger(AuthorizationLevel.Anonymous, "get", "post", Route = null)]ActivityRecord req, TraceWriter log)
        {
            var connectionString = System.Configuration.ConfigurationManager.ConnectionStrings["ClientActivity"].ConnectionString;
            var logger = new ActivityAzureLogger(connectionString);

            var entity = new ActivityEntity(req.SessionID, req.UserID)
            {
                LogInTime = req.LogInTime,
                LogOutTime = req.LogOutTime,
                FurtherTestingCount = req.FurtherTestingCount,
                ClientVersion = req.ClientVersion,
                ImportModelCount = req.ImportModelCount,
                NewModelCount = req.NewModelCount,
                RunProofCount = req.RunProofCount,
                RunSimulationCount = req.RunSimulationCount,
                SaveModelCount = req.SaveModelCount,
                ProofErrorCount = req.ProofErrorCount,
                SimulationErrorCount = req.SimulationErrorCount,
                FurtherTestingErrorCount = req.FurtherTestingErrorCount,
                AnalyzeLTLCount = req.AnalyzeLTLCount,
                AnalyzeLTLErrorCount = req.AnalyzeLTLErrorCount
            };
            logger.Add(entity);
        }
    }
}

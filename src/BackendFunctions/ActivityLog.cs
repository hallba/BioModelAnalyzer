using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
//using bma.BioCheck;
using BackendUtilities;
using System.IO;
using Microsoft.Extensions.Configuration;

namespace BackendFunctions
{
    public static class ActivityLog
    {
        [FunctionName("ActivityLog")]
        public static async Task Run([HttpTrigger(AuthorizationLevel.Anonymous, "get", "post", Route = null)] HttpRequest req, ILogger log, ExecutionContext context)
        {
            try
            {
                var config = new ConfigurationBuilder().SetBasePath(context.FunctionAppDirectory).AddJsonFile("local.settings.json", optional: true, reloadOnChange: true).AddEnvironmentVariables().Build();
                var connectionString = config.GetConnectionString("ClientActivity");
                var logger = new ActivityAzureLogger(connectionString);

                var content = await new StreamReader(req.Body).ReadToEndAsync();
                var input = JsonConvert.DeserializeObject<ActivityRecord>(content);

                var entity = new ActivityEntity(input.SessionID, input.UserID)
                {
                    LogInTime = input.LogInTime,
                    LogOutTime = input.LogOutTime,
                    FurtherTestingCount = input.FurtherTestingCount,
                    ClientVersion = input.ClientVersion,
                    ImportModelCount = input.ImportModelCount,
                    NewModelCount = input.NewModelCount,
                    RunProofCount = input.RunProofCount,
                    RunSimulationCount = input.RunSimulationCount,
                    SaveModelCount = input.SaveModelCount,
                    ProofErrorCount = input.ProofErrorCount,
                    SimulationErrorCount = input.SimulationErrorCount,
                    FurtherTestingErrorCount = input.FurtherTestingErrorCount,
                    AnalyzeLTLCount = input.AnalyzeLTLCount,
                    AnalyzeLTLErrorCount = input.AnalyzeLTLErrorCount
                };

                logger.Add(entity);
            }
            catch (Exception exc)
            {
                log.LogError(exc.Message, exc);
                throw exc;
            }
        }
    }
}

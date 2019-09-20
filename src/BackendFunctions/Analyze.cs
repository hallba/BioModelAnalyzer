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
    public static class Analyze
    {
        [FunctionName("Analyze")]
        public static AnalysisOutput Run([HttpTrigger(AuthorizationLevel.Anonymous, "get", "post", Route = null)]AnalysisInput req, TraceWriter log)
        {
            var defaultTimeLimit = TimeSpan.FromMinutes(2);

            try
            {
                var output = Utilities.RunWithTimeLimit(() => Analysis.Analyze(req), defaultTimeLimit);
                return output;
            }
            catch (BackendUtilities.TimeoutException ex)
            {
                return new AnalysisOutput
                {
                    Error = "Operation was not completed in " + defaultTimeLimit.ToString(),
                    Status = BioModelAnalyzer.StatusType.Error
                };
            }
        }
    }
}

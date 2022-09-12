using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using BackendUtilities;
using bma.BioCheck;

using System.IO;

namespace BackendFunctions
{
    public static class Analyze
    {
        [FunctionName("Analyze")]
        public static async Task<string> Run([HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = null)] HttpRequest req, ILogger log)
        {
            var defaultTimeLimit = TimeSpan.FromMinutes(2);

            var content = await new StreamReader(req.Body).ReadToEndAsync();
            var input = JsonConvert.DeserializeObject<AnalysisInput>(content);

            try
            {
                var output = Utilities.RunWithTimeLimit(() => Analysis.Analyze(input), defaultTimeLimit);
                return JsonConvert.SerializeObject(output);                
            }
            catch (BackendUtilities.TimeoutException ex)
            {
                var result = new AnalysisOutput
                {
                    Error = "Operation was not completed in " + defaultTimeLimit.ToString(),
                    Status = BioModelAnalyzer.StatusType.Error
                };

                return JsonConvert.SerializeObject(result);
            }
        }
    }
}

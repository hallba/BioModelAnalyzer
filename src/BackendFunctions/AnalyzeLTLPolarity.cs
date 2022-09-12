using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
//using BackendUtilities;
using System.IO;
using bma.LTL;

namespace BackendFunctions
{
    public static class AnalyzeLTLPolarity
    {
        [FunctionName("AnalyzeLTLPolarity")]
        public static async Task<string> Run([HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = null)] HttpRequest req, ILogger log)
        {
            var content = await new StreamReader(req.Body).ReadToEndAsync();
            var input = JsonConvert.DeserializeObject<LTLPolarityAnalysisInputDTO>(content);

            return JsonConvert.SerializeObject(Analysis.Polarity(input));
        }
    }
}

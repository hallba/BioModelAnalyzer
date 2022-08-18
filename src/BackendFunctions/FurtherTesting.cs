using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using bma.BioCheck;
//using BackendUtilities;
using System.IO;

namespace BackendFunctions
{
    public static class FurtherTesting
    {
        [FunctionName("FurtherTesting")]
        public static async Task<string> Run([HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = null)] HttpRequest req, ILogger log)
        {
            var content = await new StreamReader(req.Body).ReadToEndAsync();
            var input = JsonConvert.DeserializeObject<FurtherTestingInput>(content);

            return JsonConvert.SerializeObject(Analysis.FindCounterExamples(input));
        }
    }
}

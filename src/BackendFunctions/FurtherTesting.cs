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
    public static class FurtherTesting
    {
        [FunctionName("FurtherTesting")]
        public static async Task<FurtherTestingOutput> Run([HttpTrigger(AuthorizationLevel.Anonymous, "get", "post", Route = null)]FurtherTestingInput req, TraceWriter log)
        {
            return Analysis.FindCounterExamples(req);
        }
    }
}

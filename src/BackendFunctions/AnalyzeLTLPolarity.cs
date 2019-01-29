using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.Azure.WebJobs.Host;
using Newtonsoft.Json;
using BackendUtilities;
using System;
using bma.LTL;

namespace BackendFunctions2
{
    public static class AnalyzeLTLPolarity
    {
        [FunctionName("AnalyzeLTLPolarity")]
        public static async Task<System.Tuple<LTLAnalysisResult, LTLAnalysisResult>> Run([HttpTrigger(AuthorizationLevel.Anonymous, "get", "post", Route = null)]LTLPolarityAnalysisInputDTO req, TraceWriter log)
        {
            return bma.LTL.Analysis.Polarity(req);
        }
    }
}

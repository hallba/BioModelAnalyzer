using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.Azure.WebJobs.Host;
using Newtonsoft.Json;
using BackendUtilities;
using bma.LTL;

namespace BackendFunctions2
{
    public static class AnalyzeLTLSimulation
    {
        [FunctionName("AnalyzeLTLSimulation")]
        public static LTLAnalysisResult Run([HttpTrigger(AuthorizationLevel.Anonymous, "get", "post", Route = null)]LTLSimulationAnalysisInputDTO req, TraceWriter log)
        {
            return Analysis.Simulate(req);
        }
    }
}

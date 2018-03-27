
using System.IO;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.AspNetCore.Http;
using Microsoft.Azure.WebJobs.Host;
using Newtonsoft.Json;
using bma.BioCheck;

namespace BackendFunctions
{
    public static class Analyze
    {
        [FunctionName("Analyze")]
        public static string Run([HttpTrigger(AuthorizationLevel.Function, "post", Route = null)]AnalysisInput req, TraceWriter log)
        {
            //string requestBody = new StreamReader(req.Body).ReadToEnd();
            //AnalysisInput input = (AnalysisInput)JsonConvert.DeserializeObject(requestBody);
            var input = req;

            var output = Analysis.Analyze(input); // Utilities.RunWithTimeLimit(() => Analysis.Analyze(input), Utilities.GetTimeLimitFromConfig());

            //if (output.ErrorMessages != null && output.ErrorMessages.Length > 0)
            //{
            //    var contents = new LogContents(output.DebugMessages, output.ErrorMessages);
            //    faultLogger.Add(DateTime.Now, typeof(JobController).Assembly.GetName().Version.ToString(), input, contents);
            //}

            return JsonConvert.SerializeObject(output); // (ActionResult)new OkObjectResult(output);
        }
    }
}

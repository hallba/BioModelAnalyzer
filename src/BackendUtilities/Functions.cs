using System;
using System.Threading.Tasks;
using System.Net;
using bma.BioCheck;
using bma.LTL;
using System.IO;


namespace BackendUtilities
{
    public class ExeFunctionRunner
    {
        private string basePath;

        private readonly string executableName;
        private readonly IFailureLogger faultLogger;

        public ExeFunctionRunner(string basePath, string executableName, IFailureLogger logger)
        {
            if (basePath == null) throw new ArgumentNullException("basePath");
            if (executableName == null) throw new ArgumentNullException("executableName");
            if (logger == null) throw new ArgumentNullException("logger");
            this.basePath = basePath;
            this.executableName = executableName;
            this.faultLogger = logger;
        }

        public string Execute(string input, int timeoutMs)
        {
            var log = new DefaultLogService();

            JobsRunner.JobResult result = JobsRunner.Job.RunToCompletion(Path.Combine(basePath, executableName), input, timeoutMs);

            if (result.Errors.Length > 0)
            {
                var contents = new LogContents(null, result.Errors);
                faultLogger.Add(DateTime.Now, typeof(ExeFunctionRunner).Assembly.GetName().Version.ToString(), input, contents);
            }
            return result.Content;
        }
    }

    public static class AzureFunctions
    {
        public static void RunActivityRecord(ActivityRecord req, string connectionString)
        {
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

        public static AnalysisOutput Analyze(AnalysisInput req)
        {
            var defaultTimeLimit = TimeSpan.FromMinutes(2);

            try
            {
                var output = Utilities.RunWithTimeLimit(() => bma.BioCheck.Analysis.Analyze(req), defaultTimeLimit);
                return output;
            }
            catch (TimeoutException)
            {
                return new AnalysisOutput
                {
                    Error = "Operation was not completed in " + defaultTimeLimit.ToString(),
                    Status = BioModelAnalyzer.StatusType.Error
                };
            }
        }

        public static System.Tuple<LTLAnalysisResult, LTLAnalysisResult> AnalyzeLTLPolarity(LTLPolarityAnalysisInputDTO req)
        {
            var output = bma.LTL.Analysis.Polarity(req);
            return output;
        }
    }
}

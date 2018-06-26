#r "..\bin\BackendUtilities.dll"
#r "..\bin\Microsoft.WindowsAzure.Storage.dll"
#r "Newtonsoft.Json"

using System.Net;
using Newtonsoft.Json;
using BackendUtilities;

public static void Run(ActivityRecord req, TraceWriter log)
{
    var logger = new ActivityAzureLogger("DefaultEndpointsProtocol=https;AccountName=bmacomputefunc;AccountKey=dbq1YoM+WvZXTGOgrwwZm9Xg3uDNYh1Yh3/J0DmhChrgx2tC7Yt0s2FMma9c8Jot39B8VBnUKGkQFK3rv3XM7w==;EndpointSuffix=core.windows.net");

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
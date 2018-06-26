#r "..\bin\BioCheckAnalyzer.dll"
#r "..\bin\BioCheckAnalyzerCommon.dll"
#r "..\bin\BmaBioCheckAnalyzer.dll"
#r "..\bin\BackendUtilities.dll"
#r "Newtonsoft.Json"

using System.Net;
using Newtonsoft.Json;
using bma.BioCheck;
using BackendUtilities;

public static AnalysisOutput Run(AnalysisInput req, TraceWriter log)
{
    var defaultTimeLimit = TimeSpan.FromMinutes(2);

    try {
        var output = Utilities.RunWithTimeLimit(() => Analysis.Analyze(req), defaultTimeLimit); 
        return output;
    } catch (TimeoutException ex) {
        return new AnalysisOutput { 
            Error = "Operation was not completed in " + defaultTimeLimit.ToString(), 
            Status = BioModelAnalyzer.StatusType.Error };
    }
}
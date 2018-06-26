#r "..\bin\BioCheckAnalyzer.dll"
#r "..\bin\BioCheckAnalyzerCommon.dll"
#r "..\bin\BmaBioCheckAnalyzer.dll"
#r "..\bin\BackendUtilities.dll"
#r "Newtonsoft.Json"

using System.Net;
using Newtonsoft.Json;
using bma.LTL;
using BackendUtilities;

public static System.Tuple<LTLAnalysisResult,LTLAnalysisResult> Run(LTLPolarityAnalysisInputDTO req, TraceWriter log)
{
    var output = Analysis.Polarity(req);
    return output;
}
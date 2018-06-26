#r "..\bin\BioCheckAnalyzer.dll"
#r "..\bin\BioCheckAnalyzerCommon.dll"
#r "..\bin\BmaBioCheckAnalyzer.dll"
#r "Newtonsoft.Json"

using System.Net;
using Newtonsoft.Json;
using bma.LTL;

public static LTLAnalysisResult Run(LTLSimulationAnalysisInputDTO req, TraceWriter log)
{
    var output = Analysis.Simulate(req);
    return output;
}
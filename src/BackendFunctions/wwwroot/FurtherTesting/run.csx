#r "..\bin\BioCheckAnalyzer.dll"
#r "..\bin\BioCheckAnalyzerCommon.dll"
#r "..\bin\BmaBioCheckAnalyzer.dll"
#r "Newtonsoft.Json"

using System.Net;
using Newtonsoft.Json;
using bma.BioCheck;

public static FurtherTestingOutput Run(FurtherTestingInput req, TraceWriter log)
{
    var output = Analysis.FindCounterExamples(req);
    return output;
}
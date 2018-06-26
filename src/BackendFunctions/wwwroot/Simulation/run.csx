#r "..\bin\BioCheckAnalyzer.dll"
#r "..\bin\BioCheckAnalyzerCommon.dll"
#r "..\bin\BmaBioCheckAnalyzer.dll"
#r "Newtonsoft.Json"

using System.Net;
using Newtonsoft.Json;
using bma.BioCheck;

public static SimulationOutput Run(SimulationInput req, TraceWriter log)
{
    return Simulation.Simulate(req);
}

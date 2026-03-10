namespace BmaLinuxApi.Services;

using BmaLinuxApi.Models;
using BioCheckAnalyzerCommon;
using Microsoft.FSharp.Core;
using FSharp = BioModelAnalyzer;

public class FurtherTestingService : IFurtherTestingService
{
    private readonly IAnalyzer _analyzer;
    private readonly ILogger<FurtherTestingService> _logger;

    public FurtherTestingService(IAnalyzer analyzer, ILogger<FurtherTestingService> logger)
    {
        _analyzer = analyzer;
        _logger = logger;
    }

    public async Task<FurtherTestingResult> FindCounterExamplesAsync(
        Models.Model model,
        Models.AnalysisResult analysis,
        CancellationToken ct = default)
    {
        try
        {
            var fsharpModel = AnalysisService.ConvertToFSharpModel(model);
            var fsharpResult = ConvertToFSharpAnalysisResult(analysis);

            var counterExamples = new List<CounterExample>();

            // IAnalyzer.findCEx* methods are synchronous; offload to thread pool
            var bifurcation = await Task.Run(
                () => _analyzer.findCExBifurcates(fsharpModel, fsharpResult), ct);
            if (FSharpOption<FSharp.BifurcationCounterExample>.get_IsSome(bifurcation))
                counterExamples.Add(ConvertBifurcation(bifurcation.Value));

            var cycle = await Task.Run(
                () => _analyzer.findCExCycles(fsharpModel, fsharpResult), ct);
            if (FSharpOption<FSharp.CycleCounterExample>.get_IsSome(cycle))
                counterExamples.Add(ConvertCycle(cycle.Value));

            var fixpoint = await Task.Run(
                () => _analyzer.findCExFixpoint(fsharpModel, fsharpResult), ct);
            if (FSharpOption<FSharp.FixPointCounterExample>.get_IsSome(fixpoint))
                counterExamples.Add(ConvertFixpoint(fixpoint.Value));

            return new FurtherTestingResult(
                CounterExamples: counterExamples.ToArray(),
                Error: null,
                ErrorMessages: null,
                DebugMessages: null
            );
        }
        catch (OperationCanceledException)
        {
            throw;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "FurtherTesting failed for model {ModelName}", model.Name);
            return new FurtherTestingResult(
                CounterExamples: null,
                Error: ex.Message,
                ErrorMessages: [ex.Message],
                DebugMessages: null
            );
        }
    }

    internal static FSharp.AnalysisResult ConvertToFSharpAnalysisResult(Models.AnalysisResult result)
    {
        return new FSharp.AnalysisResult
        {
            Status = result.Status != null
                ? Enum.Parse<FSharp.StatusType>(result.Status)
                : FSharp.StatusType.Default,
            Error = result.Error,
            Ticks = result.Ticks?.Select(t => new FSharp.Tick
            {
                Time = t.Time,
                Variables = t.Variables?.Select(v => new FSharp.Tick.Variable
                {
                    Id = v.Id,
                    Lo = v.Lo,
                    Hi = v.Hi
                }).ToArray()
            }).ToArray()
        };
    }

    private static CounterExample ConvertBifurcation(FSharp.BifurcationCounterExample bif)
    {
        return new CounterExample(
            Status: bif.Status.ToString(),
            Variables: bif.Variables?.Select(v => new CounterExampleVariable(
                Id: v.Id,
                Value: null,
                Fix1: v.Fix1,
                Fix2: v.Fix2
            )).ToArray()
        );
    }

    private static CounterExample ConvertCycle(FSharp.CycleCounterExample cyc)
    {
        return new CounterExample(
            Status: cyc.Status.ToString(),
            Variables: cyc.Variables?.Select(v => new CounterExampleVariable(
                Id: v.Id,
                Value: v.Value,
                Fix1: null,
                Fix2: null
            )).ToArray()
        );
    }

    private static CounterExample ConvertFixpoint(FSharp.FixPointCounterExample fix)
    {
        return new CounterExample(
            Status: fix.Status.ToString(),
            Variables: fix.Variables?.Select(v => new CounterExampleVariable(
                Id: v.Id,
                Value: v.Value,
                Fix1: null,
                Fix2: null
            )).ToArray()
        );
    }
}

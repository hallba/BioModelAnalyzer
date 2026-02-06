namespace BmaLinuxApi.Services;

using BmaLinuxApi.Models;
using BioCheckAnalyzerCommon;
using Microsoft.FSharp.Core;
using FSharp = BioModelAnalyzer;

public class LtlService : ILtlService
{
    private readonly IAnalyzer _analyzer;
    private readonly ILogger<LtlService> _logger;

    public LtlService(IAnalyzer analyzer, ILogger<LtlService> logger)
    {
        _analyzer = analyzer;
        _logger = logger;
    }

    public async Task<LtlSimulationResult> CheckSimulationAsync(
        LtlSimulationInput input,
        CancellationToken ct = default)
    {
        try
        {
            var fsharpModel = AnalysisService.ConvertToFSharpModel(
                new Model(input.Name, input.Variables, input.Relationships));

            // IAnalyzer.checkLTLSimulation is synchronous; offload to thread pool
            var result = await Task.Run(
                () => _analyzer.checkLTLSimulation(
                    fsharpModel,
                    input.Formula,
                    input.Number_of_steps.ToString()),
                ct);

            if (FSharpOption<FSharp.LTLAnalysisResultDTO>.get_IsNone(result))
            {
                return new LtlSimulationResult(
                    Status: 0,
                    Loop: null,
                    Ticks: null,
                    Error: null,
                    ErrorMessages: null,
                    DebugMessages: null
                );
            }

            return ConvertLtlResult(result.Value);
        }
        catch (OperationCanceledException)
        {
            throw;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "LTL simulation failed for model {ModelName}", input.Name);
            return new LtlSimulationResult(
                Status: 0,
                Loop: null,
                Ticks: null,
                Error: ex.Message,
                ErrorMessages: [ex.Message],
                DebugMessages: null
            );
        }
    }

    public async Task<LtlPolarityResult> CheckPolarityAsync(
        LtlPolarityInput input,
        CancellationToken ct = default)
    {
        try
        {
            var fsharpModel = AnalysisService.ConvertToFSharpModel(
                new Model(input.Name, input.Variables, input.Relationships));

            var polarity = input.Polarity.HasValue
                ? FSharpOption<bool>.Some(input.Polarity.Value != 0)
                : FSharpOption<bool>.None;

            // IAnalyzer.checkLTLPolarity is synchronous; offload to thread pool
            var result = await Task.Run(
                () => _analyzer.checkLTLPolarity(
                    fsharpModel,
                    input.Formula,
                    input.Number_of_steps.ToString(),
                    polarity),
                ct);

            var item1 = ConvertLtlResult(result.Item1);
            LtlSimulationResult? item2 = null;
            if (FSharpOption<FSharp.LTLAnalysisResultDTO>.get_IsSome(result.Item2))
            {
                item2 = ConvertLtlResult(result.Item2.Value);
            }

            return new LtlPolarityResult(Item1: item1, Item2: item2);
        }
        catch (OperationCanceledException)
        {
            throw;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "LTL polarity check failed for model {ModelName}", input.Name);
            return new LtlPolarityResult(
                Item1: new LtlSimulationResult(
                    Status: 0,
                    Loop: null,
                    Ticks: null,
                    Error: ex.Message,
                    ErrorMessages: [ex.Message],
                    DebugMessages: null
                ),
                Item2: null
            );
        }
    }

    private static LtlSimulationResult ConvertLtlResult(FSharp.LTLAnalysisResultDTO dto)
    {
        return new LtlSimulationResult(
            Status: dto.Status ? 1 : 0,
            Loop: dto.Loop,
            Ticks: dto.Ticks?.Select(t => new Tick(
                Time: t.Time,
                Variables: t.Variables?.Select(v => new TickVariable(
                    Id: v.Id,
                    Lo: v.Lo,
                    Hi: v.Hi
                )).ToArray()
            )).ToArray(),
            Error: dto.Error,
            ErrorMessages: dto.Error != null ? [dto.Error] : null,
            DebugMessages: null
        );
    }
}

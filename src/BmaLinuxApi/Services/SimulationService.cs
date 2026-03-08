namespace BmaLinuxApi.Services;

using BmaLinuxApi.Models;
using BioCheckAnalyzerCommon;
using FSharp = BioModelAnalyzer;

public class SimulationService : ISimulationService
{
    private readonly IAnalyzer _analyzer;
    private readonly ILogger<SimulationService> _logger;

    public SimulationService(IAnalyzer analyzer, ILogger<SimulationService> logger)
    {
        _analyzer = analyzer;
        _logger = logger;
    }

    public async Task<SimulationResult> SimulateTickAsync(
        Model model,
        VariableValue[] variables,
        CancellationToken ct = default)
    {
        try
        {
            var fsharpModel = AnalysisService.ConvertToFSharpModel(model);
            var fsharpEnv = variables.Select(v => new FSharp.SimulationVariable
            {
                Id = v.Id,
                Value = v.Value
            }).ToArray();

            // IAnalyzer.simulate_tick is synchronous; offload to thread pool
            var result = await Task.Run(
                () => _analyzer.simulate_tick(fsharpModel, fsharpEnv), ct);

            var outputVars = result.Select(sv => new VariableValue(
                Id: sv.Id,
                Value: sv.Value
            )).ToArray();

            return new SimulationResult(
                Variables: outputVars,
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
            _logger.LogError(ex, "Simulation failed for model {ModelName}", model.Name);
            return new SimulationResult(
                Variables: null,
                ErrorMessages: [ex.Message],
                DebugMessages: null
            );
        }
    }
}

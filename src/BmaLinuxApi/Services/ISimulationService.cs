namespace BmaLinuxApi.Services;

using BmaLinuxApi.Models;

public interface ISimulationService
{
    Task<SimulationResult> SimulateTickAsync(Model model, VariableValue[] variables, CancellationToken ct = default);
}

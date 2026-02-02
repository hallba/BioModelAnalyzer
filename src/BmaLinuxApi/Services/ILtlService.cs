namespace BmaLinuxApi.Services;

using BmaLinuxApi.Models;

public interface ILtlService
{
    Task<LtlSimulationResult> CheckSimulationAsync(LtlSimulationInput input, CancellationToken ct = default);
    Task<LtlPolarityResult> CheckPolarityAsync(LtlPolarityInput input, CancellationToken ct = default);
}

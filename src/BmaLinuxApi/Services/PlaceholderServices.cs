namespace BmaLinuxApi.Services;

using BmaLinuxApi.Models;

// Placeholder implementations - to be replaced in Phase 4-7

public class PlaceholderFurtherTestingService : IFurtherTestingService
{
    public Task<FurtherTestingResult> FindCounterExamplesAsync(Model model, AnalysisResult analysis, CancellationToken ct = default)
        => throw new NotImplementedException("Implement in T020");
}

public class PlaceholderLtlService : ILtlService
{
    public Task<LtlSimulationResult> CheckSimulationAsync(LtlSimulationInput input, CancellationToken ct = default)
        => throw new NotImplementedException("Implement in T026");

    public Task<LtlPolarityResult> CheckPolarityAsync(LtlPolarityInput input, CancellationToken ct = default)
        => throw new NotImplementedException("Implement in T026");
}


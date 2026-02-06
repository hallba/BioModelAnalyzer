namespace BmaLinuxApi.Services;

using BmaLinuxApi.Models;

// Placeholder implementations - to be replaced in Phase 4-7

public class PlaceholderSimulationService : ISimulationService
{
    public Task<SimulationResult> SimulateTickAsync(Model model, VariableValue[] variables, CancellationToken ct = default)
        => throw new NotImplementedException("Implement in T023");
}

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

public class PlaceholderScheduler : IScheduler
{
    public Guid ScheduleJob(Guid appId, Func<CancellationToken, Task<object?>> work)
        => throw new NotImplementedException("Implement in T038");

    public JobInfo? GetJobStatus(Guid appId, Guid jobId)
        => throw new NotImplementedException("Implement in T038");

    public object? GetJobResult(Guid appId, Guid jobId)
        => throw new NotImplementedException("Implement in T038");

    public bool DeleteJob(Guid appId, Guid jobId)
        => throw new NotImplementedException("Implement in T038");
}

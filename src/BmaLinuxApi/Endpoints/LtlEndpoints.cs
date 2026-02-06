namespace BmaLinuxApi.Endpoints;

using BmaLinuxApi.Models;
using BmaLinuxApi.Services;

public static class LtlEndpoints
{
    public static void MapLtlEndpoints(this WebApplication app)
    {
        app.MapPost("/api/AnalyzeLTLSimulation", async (
            LtlSimulationInput input,
            ILtlService service,
            IConfiguration config,
            CancellationToken ct) =>
        {
            var timeoutSeconds = config.GetValue<int>("Analysis:TimeoutSeconds", 120);
            using var cts = CancellationTokenSource.CreateLinkedTokenSource(ct);
            cts.CancelAfter(TimeSpan.FromSeconds(timeoutSeconds));

            try
            {
                var result = await service.CheckSimulationAsync(input, cts.Token);
                return Results.Ok(result);
            }
            catch (OperationCanceledException)
            {
                return Results.NoContent(); // 204 for timeout per API spec
            }
        });

        app.MapPost("/api/AnalyzeLTLPolarity", async (
            LtlPolarityInput input,
            ILtlService service,
            IConfiguration config,
            CancellationToken ct) =>
        {
            var timeoutSeconds = config.GetValue<int>("Analysis:TimeoutSeconds", 120);
            using var cts = CancellationTokenSource.CreateLinkedTokenSource(ct);
            cts.CancelAfter(TimeSpan.FromSeconds(timeoutSeconds));

            try
            {
                var result = await service.CheckPolarityAsync(input, cts.Token);
                return Results.Ok(result);
            }
            catch (OperationCanceledException)
            {
                return Results.NoContent(); // 204 for timeout per API spec
            }
        });
    }
}

namespace BmaLinuxApi.Endpoints;

using BmaLinuxApi.Models;
using BmaLinuxApi.Services;

public static class SimulateEndpoint
{
    public static void MapSimulateEndpoints(this WebApplication app)
    {
        app.MapPost("/api/Simulate", async (
            SimulationInput input,
            ISimulationService simulationService,
            IConfiguration config,
            CancellationToken ct) =>
        {
            var timeoutSeconds = config.GetValue<int>("Simulation:TimeoutSeconds", 120);
            using var cts = CancellationTokenSource.CreateLinkedTokenSource(ct);
            cts.CancelAfter(TimeSpan.FromSeconds(timeoutSeconds));

            try
            {
                var result = await simulationService.SimulateTickAsync(
                    input.Model, input.Variables, cts.Token);
                return Results.Ok(result);
            }
            catch (OperationCanceledException)
            {
                return Results.NoContent(); // 204 for timeout per API spec
            }
        });
    }
}

namespace BmaLinuxApi.Endpoints;

using BmaLinuxApi.Models;
using BmaLinuxApi.Services;

public static class FurtherTestingEndpoint
{
    public static void MapFurtherTestingEndpoints(this WebApplication app)
    {
        app.MapPost("/api/FurtherTesting", async (
            FurtherTestingInput input,
            IFurtherTestingService service,
            CancellationToken ct) =>
        {
            var result = await service.FindCounterExamplesAsync(input.Model, input.Analysis, ct);
            return Results.Ok(result);
        });
    }
}

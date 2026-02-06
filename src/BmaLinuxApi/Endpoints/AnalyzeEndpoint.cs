namespace BmaLinuxApi.Endpoints;

using BmaLinuxApi.Models;
using BmaLinuxApi.Services;

public static class AnalyzeEndpoint
{
    public static void MapAnalyzeEndpoints(this WebApplication app)
    {
        app.MapPost("/api/Analyze", async (
            AnalysisInput input,
            IAnalysisService analysisService,
            CancellationToken ct) =>
        {
            var result = await analysisService.AnalyzeAsync(input.Model, ct);
            return Results.Ok(result);
        });
    }
}

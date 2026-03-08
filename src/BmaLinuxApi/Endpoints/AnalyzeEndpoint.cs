namespace BmaLinuxApi.Endpoints;

using BmaLinuxApi.Models;
using BmaLinuxApi.Services;

public static class AnalyzeEndpoint
{
    public static void MapAnalyzeEndpoints(this WebApplication app)
    {
        app.MapPost("/api/Analyze", async (
            Model model,
            IAnalysisService analysisService,
            IConfiguration config,
            CancellationToken ct) =>
        {
            var timeoutSeconds = config.GetValue<int>("Analysis:TimeoutSeconds", 120);
            using var cts = CancellationTokenSource.CreateLinkedTokenSource(ct);
            cts.CancelAfter(TimeSpan.FromSeconds(timeoutSeconds));

            try
            {
                var result = await analysisService.AnalyzeAsync(model, cts.Token);
                return Results.Ok(result);
            }
            catch (OperationCanceledException)
            {
                return Results.NoContent(); // 204 for timeout per API spec
            }
        });
    }
}

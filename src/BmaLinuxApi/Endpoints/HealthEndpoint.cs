namespace BmaLinuxApi.Endpoints;

public static class HealthEndpoint
{
    private static readonly DateTime StartTime = DateTime.UtcNow;

    public static void MapHealthEndpoints(this WebApplication app)
    {
        app.MapGet("/api/health", () => Results.Ok(new
        {
            Status = "Healthy",
            Version = "1.14.0",
            Timestamp = DateTime.UtcNow,
            UptimeSeconds = (DateTime.UtcNow - StartTime).TotalSeconds
        }));

        // Version endpoint consumed by the frontend to discover the backend URL.
        // Legacy Global.asax.cs reads version.txt and adds computeServiceUrl from config.
        // With same-origin hosting, computeServiceUrl is empty (relative API calls).
        app.MapGet("/api/version", () => Results.Text(
            """{"major":"1","minor":"15","build":"0001","computeServiceUrl":""}""",
            "application/json"));
    }
}

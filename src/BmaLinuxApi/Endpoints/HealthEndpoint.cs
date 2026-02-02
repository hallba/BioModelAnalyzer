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
    }
}

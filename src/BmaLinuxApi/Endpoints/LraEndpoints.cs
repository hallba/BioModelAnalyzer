namespace BmaLinuxApi.Endpoints;

using BmaLinuxApi.Models;
using BmaLinuxApi.Services;

public static class LraEndpoints
{
    public static void MapLraEndpoints(this WebApplication app)
    {
        // T039: POST /api/lra/{appId} - Schedule a long-running analysis job
        app.MapPost("/api/lra/{appId:guid}", (
            Guid appId,
            LtlPolarityInput input,
            IScheduler scheduler,
            ILtlService ltlService) =>
        {
            var jobId = scheduler.ScheduleJob(appId, async ct =>
            {
                return await ltlService.CheckPolarityAsync(input, ct);
            });

            return Results.Ok(jobId.ToString());
        });

        // T040: GET /api/lra/{appId} - Get job status
        app.MapGet("/api/lra/{appId:guid}", (
            Guid appId,
            Guid jobId,
            IScheduler scheduler) =>
        {
            var job = scheduler.GetJobStatus(appId, jobId);
            if (job == null)
                return Results.NotFound();

            return job.State switch
            {
                JobState.Pending => Results.Json(0, statusCode: 201),       // Queued
                JobState.Running => Results.Json(
                    new JobExecutingStatus(
                        Elapsed: (long)(DateTime.UtcNow - job.Started!.Value).TotalMilliseconds,
                        Started: job.Started.Value),
                    statusCode: 202),                                        // Executing
                JobState.Completed => Results.Ok(),                          // Succeeded
                JobState.Failed => Results.Text(job.Error ?? "Unknown error",
                    statusCode: 203),                                        // Failed
                _ => Results.StatusCode(501)                                 // Unknown
            };
        });

        // T041: DELETE /api/lra/{appId} - Delete/cancel a job
        app.MapDelete("/api/lra/{appId:guid}", (
            Guid appId,
            Guid jobId,
            IScheduler scheduler) =>
        {
            return scheduler.DeleteJob(appId, jobId)
                ? Results.Ok()
                : Results.NotFound();
        });

        // T042: GET /api/lra/{appId}/result - Get completed job result
        app.MapGet("/api/lra/{appId:guid}/result", (
            Guid appId,
            Guid jobId,
            IScheduler scheduler) =>
        {
            var result = scheduler.GetJobResult(appId, jobId);
            return result != null
                ? Results.Ok(result)
                : Results.NotFound();
        });
    }
}

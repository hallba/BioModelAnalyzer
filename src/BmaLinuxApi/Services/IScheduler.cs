namespace BmaLinuxApi.Services;

public interface IScheduler
{
    Guid ScheduleJob(Guid appId, Func<CancellationToken, Task<object?>> work);
    JobInfo? GetJobStatus(Guid appId, Guid jobId);
    object? GetJobResult(Guid appId, Guid jobId);
    bool DeleteJob(Guid appId, Guid jobId);
}

public record JobInfo(
    Guid JobId,
    JobState State,
    DateTime Created,
    DateTime? Started,
    DateTime? Completed,
    string? Error
);

public enum JobState
{
    Pending,
    Running,
    Completed,
    Failed,
    Cancelled
}

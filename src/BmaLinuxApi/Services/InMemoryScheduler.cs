namespace BmaLinuxApi.Services;

using System.Collections.Concurrent;

public class InMemoryScheduler : IScheduler, IDisposable
{
    private readonly ConcurrentDictionary<(Guid AppId, Guid JobId), JobInfo> _jobs = new();
    private readonly SemaphoreSlim _semaphore;
    private readonly ILogger<InMemoryScheduler> _logger;

    public InMemoryScheduler(IConfiguration config, ILogger<InMemoryScheduler> logger)
    {
        var maxConcurrent = config.GetValue<int>("Analysis:MaxConcurrentJobs", 4);
        _semaphore = new SemaphoreSlim(maxConcurrent);
        _logger = logger;
    }

    public Guid ScheduleJob(Guid appId, Func<CancellationToken, Task<object?>> work)
    {
        var jobId = Guid.NewGuid();
        var job = new JobInfo(jobId, appId, JobState.Pending, DateTime.UtcNow, null, null, null, null);
        _jobs[(appId, jobId)] = job;

        _ = ExecuteJobAsync(appId, jobId, work);

        return jobId;
    }

    private async Task ExecuteJobAsync(Guid appId, Guid jobId, Func<CancellationToken, Task<object?>> work)
    {
        await _semaphore.WaitAsync();
        try
        {
            _jobs[(appId, jobId)] = _jobs[(appId, jobId)] with
            {
                State = JobState.Running,
                Started = DateTime.UtcNow
            };

            _logger.LogInformation("Job {JobId} for app {AppId} started executing", jobId, appId);

            var result = await work(CancellationToken.None);

            _jobs[(appId, jobId)] = _jobs[(appId, jobId)] with
            {
                State = JobState.Completed,
                Completed = DateTime.UtcNow,
                Result = result
            };

            _logger.LogInformation("Job {JobId} for app {AppId} completed successfully", jobId, appId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Job {JobId} for app {AppId} failed", jobId, appId);

            _jobs[(appId, jobId)] = _jobs[(appId, jobId)] with
            {
                State = JobState.Failed,
                Completed = DateTime.UtcNow,
                Error = ex.Message
            };
        }
        finally
        {
            _semaphore.Release();
        }
    }

    public JobInfo? GetJobStatus(Guid appId, Guid jobId) =>
        _jobs.TryGetValue((appId, jobId), out var job) ? job : null;

    public object? GetJobResult(Guid appId, Guid jobId) =>
        _jobs.TryGetValue((appId, jobId), out var job) && job.State == JobState.Completed ? job.Result : null;

    public bool DeleteJob(Guid appId, Guid jobId) =>
        _jobs.TryRemove((appId, jobId), out _);

    public void Dispose() => _semaphore?.Dispose();
}

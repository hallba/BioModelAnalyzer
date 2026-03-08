# Task T038: Implement InMemoryScheduler

**Status:** [ ] Pending | [ ] In Progress | [ ] Complete
**Effort:** 2h
**Dependencies:** T037
**Phase:** Phase 10 - US8 (Long-Running Analysis Jobs)

---

## Context Setup Prompt

```
Read: .specify/specs/001-linux-modernization/tasks/T038-implement-memory-scheduler.md
      .specify/specs/001-linux-modernization/research.md (scheduler design)

## Goal

Implement in-memory job scheduler (replaces Azure FairShareScheduler).
```

---

## Implementation

Create `src/BmaLinuxApi/Services/InMemoryScheduler.cs`:

```csharp
namespace BmaLinuxApi.Services;

using System.Collections.Concurrent;
using BmaLinuxApi.Models;

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
        var job = new JobInfo(jobId, appId, JobState.Queued, DateTime.UtcNow, null, null, null, null);
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
                State = JobState.Executing, 
                StartedAt = DateTime.UtcNow 
            };
            
            var result = await work(CancellationToken.None);
            
            _jobs[(appId, jobId)] = _jobs[(appId, jobId)] with 
            { 
                State = JobState.Completed, 
                CompletedAt = DateTime.UtcNow,
                Result = result 
            };
        }
        catch (Exception ex)
        {
            _jobs[(appId, jobId)] = _jobs[(appId, jobId)] with 
            { 
                State = JobState.Failed, 
                CompletedAt = DateTime.UtcNow,
                ErrorMessage = ex.Message 
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
        _jobs.TryGetValue((appId, jobId), out var job) ? job.Result : null;

    public bool DeleteJob(Guid appId, Guid jobId) =>
        _jobs.TryRemove((appId, jobId), out _);

    public void Dispose() => _semaphore?.Dispose();
}
```

- [ ] Implement scheduler
- [ ] Register as Singleton in DI
- [ ] Test job lifecycle

---

**Created:** 2026-01-29

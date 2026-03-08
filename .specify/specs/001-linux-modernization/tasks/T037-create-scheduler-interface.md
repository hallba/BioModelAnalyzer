# Task T037: Create IScheduler Interface

**Status:** [ ] Pending | [ ] In Progress | [ ] Complete
**Effort:** 15m
**Dependencies:** T007
**Phase:** Phase 10 - US8 (Long-Running Analysis Jobs)

---

## Implementation

Verify `src/BmaLinuxApi/Services/IScheduler.cs` exists from T007.

```csharp
public interface IScheduler
{
    Guid ScheduleJob(Guid appId, Func<CancellationToken, Task<object?>> work);
    JobInfo? GetJobStatus(Guid appId, Guid jobId);
    object? GetJobResult(Guid appId, Guid jobId);
    bool DeleteJob(Guid appId, Guid jobId);
}
```

- [ ] Interface defined

---

**Created:** 2026-01-29

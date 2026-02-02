namespace BmaLinuxApi.Services;

using BmaLinuxApi.Models;

public interface IAnalysisService
{
    Task<AnalysisResult> AnalyzeAsync(Model model, CancellationToken ct = default);
}

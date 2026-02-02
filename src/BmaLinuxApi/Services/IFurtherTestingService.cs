namespace BmaLinuxApi.Services;

using BmaLinuxApi.Models;

public interface IFurtherTestingService
{
    Task<FurtherTestingResult> FindCounterExamplesAsync(Model model, AnalysisResult analysis, CancellationToken ct = default);
}

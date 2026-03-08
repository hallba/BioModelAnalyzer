namespace BmaLinuxApi.Services;

using BmaLinuxApi.Models;
using FSharp = BioModelAnalyzer;
using BioCheckAnalyzerCommon;

public class AnalysisService : IAnalysisService
{
    private readonly IAnalyzer _analyzer;
    private readonly ILogger<AnalysisService> _logger;

    public AnalysisService(IAnalyzer analyzer, ILogger<AnalysisService> logger)
    {
        _analyzer = analyzer;
        _logger = logger;
    }

    public async Task<AnalysisResult> AnalyzeAsync(Models.Model model, CancellationToken ct = default)
    {
        try
        {
            var fsharpModel = ConvertToFSharpModel(model);

            // IAnalyzer.checkStability is synchronous; offload to thread pool
            var result = await Task.Run(() => _analyzer.checkStability(fsharpModel), ct);

            return ConvertToResult(result);
        }
        catch (OperationCanceledException)
        {
            throw;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Analysis failed for model {ModelName}", model.Name);
            return new AnalysisResult(
                Status: null,
                Time: 0,
                Ticks: null,
                Error: ex.Message,
                ErrorMessages: [ex.Message],
                DebugMessages: null
            );
        }
    }

    internal static FSharp.Model ConvertToFSharpModel(Models.Model model)
    {
        return new FSharp.Model
        {
            ModelName = model.Name,
            Variables = model.Variables.Select(v => new FSharp.Model.Variable
            {
                Id = v.Id,
                Name = v.Name,
                RangeFrom = v.RangeFrom,
                RangeTo = v.RangeTo,
                Formula = v.Formula
            }).ToArray(),
            Relationships = model.Relationships.Select(r => new FSharp.Model.Relationship
            {
                Id = r.Id,
                FromVariable = r.FromVariable,
                ToVariable = r.ToVariable,
                Type = Enum.Parse<FSharp.Model.RelationshipType>(r.Type)
            }).ToArray()
        };
    }

    internal static AnalysisResult ConvertToResult(FSharp.AnalysisResult result)
    {
        return new AnalysisResult(
            Status: result.Status.ToString(),
            Time: result.Ticks?.Length ?? 0,
            Ticks: result.Ticks?.Select(t => new Tick(
                Time: t.Time,
                Variables: t.Variables?.Select(v => new TickVariable(
                    Id: v.Id,
                    Lo: v.Lo,
                    Hi: v.Hi
                )).ToArray()
            )).ToArray(),
            Error: result.Error,
            ErrorMessages: result.Error != null ? [result.Error] : null,
            DebugMessages: null
        );
    }
}

/// <summary>
/// Adapts ASP.NET Core ILogger to the F# analyzer's ILogService interface.
/// </summary>
internal class LogServiceAdapter : ILogService
{
    private readonly ILogger _logger;

    public LogServiceAdapter(ILogger logger)
    {
        _logger = logger;
    }

    public void LogDebug(string message) => _logger.LogDebug("{Message}", message);
    public void LogError(string message) => _logger.LogError("{Message}", message);
}

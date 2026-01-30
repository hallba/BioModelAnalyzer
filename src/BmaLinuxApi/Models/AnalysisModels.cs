namespace BmaLinuxApi.Models;

public record AnalysisInput(
    Model Model
);

public record TickVariable(
    int Id,
    int Lo,
    int Hi
);

public record Tick(
    int Time,
    TickVariable[]? Variables
);

public record AnalysisResult(
    string? Status,
    int Time,
    Tick[]? Ticks,
    string? Error,
    string[]? ErrorMessages,
    string[]? DebugMessages
);

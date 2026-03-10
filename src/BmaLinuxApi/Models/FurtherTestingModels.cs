namespace BmaLinuxApi.Models;

public record FurtherTestingInput(
    Model Model,
    AnalysisResult Analysis
);

public record CounterExampleVariable(
    string Id,
    int? Value,
    int? Fix1,
    int? Fix2
);

public record CounterExample(
    string? Status,
    CounterExampleVariable[]? Variables
);

public record FurtherTestingResult(
    CounterExample[]? CounterExamples,
    string? Error,
    string[]? ErrorMessages,
    string[]? DebugMessages
);

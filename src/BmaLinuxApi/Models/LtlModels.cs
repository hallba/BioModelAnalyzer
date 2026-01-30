namespace BmaLinuxApi.Models;

public record LtlSimulationInput(
    string Name,
    Variable[] Variables,
    Relationship[] Relationships,
    string Formula,
    int Number_of_steps,
    bool? EnableLogging
);

public record LtlSimulationResult(
    int Status,
    int? Loop,
    Tick[]? Ticks,
    string? Error,
    string[]? ErrorMessages,
    string[]? DebugMessages
);

public record LtlPolarityInput(
    string Name,
    Variable[] Variables,
    Relationship[] Relationships,
    string Formula,
    int Number_of_steps,
    bool? EnableLogging,
    int? Polarity
);

public record LtlPolarityResult(
    LtlSimulationResult? Item1,
    LtlSimulationResult? Item2
);

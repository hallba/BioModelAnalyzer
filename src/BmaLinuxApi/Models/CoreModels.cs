namespace BmaLinuxApi.Models;

public record Variable(
    int Id,
    string Name,
    int RangeFrom,
    int RangeTo,
    string Formula
);

public record Relationship(
    int Id,
    string? Name,
    int FromVariable,
    int ToVariable,
    string Type
);

public record Model(
    string Name,
    Variable[] Variables,
    Relationship[] Relationships
);

public record VariableValue(
    int Id,
    int Value
);

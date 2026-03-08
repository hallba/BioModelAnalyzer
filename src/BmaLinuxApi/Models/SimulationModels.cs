namespace BmaLinuxApi.Models;

public record SimulationInput(
    Model Model,
    VariableValue[] Variables
);

public record SimulationResult(
    VariableValue[]? Variables,
    string[]? ErrorMessages,
    string[]? DebugMessages
);

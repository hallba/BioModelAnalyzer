using System.Text.Json.Serialization;

namespace BmaLinuxApi.Models;

public record JobExecutingStatus(
    [property: JsonPropertyName("elapsed")] long Elapsed,
    [property: JsonPropertyName("started")] DateTime Started
);

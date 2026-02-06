namespace BmaLinuxApi.Endpoints;

using BmaLinuxApi.Models;
using BmaLinuxApi.Services;

public static class ExportEndpoint
{
    public static void MapExportEndpoints(this WebApplication app)
    {
        app.MapPost("/api/Export", (
            ExportRequest request,
            IExportService exportService) =>
        {
            var bytes = exportService.ExportToExcel(request.Model, request.Results);
            return Results.File(
                bytes,
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                "export.xlsx"
            );
        });
    }
}

public record ExportRequest(Model Model, SimulationResult[] Results);

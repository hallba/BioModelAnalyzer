namespace BmaLinuxApi.Services;

using BmaLinuxApi.Models;

public interface IExportService
{
    byte[] ExportToExcel(Model model, SimulationResult[] results);
}

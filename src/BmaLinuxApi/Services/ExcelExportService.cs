namespace BmaLinuxApi.Services;

using BmaLinuxApi.Models;
using ClosedXML.Excel;

public class ExcelExportService : IExportService
{
    public byte[] ExportToExcel(Model model, SimulationResult[]? results)
    {
        using var workbook = new XLWorkbook();

        // Model sheet
        var modelSheet = workbook.AddWorksheet("Model");
        modelSheet.Cell(1, 1).Value = "Name";
        modelSheet.Cell(1, 2).Value = model.Name;

        // Variables sheet
        var varsSheet = workbook.AddWorksheet("Variables");
        varsSheet.Cell(1, 1).Value = "Id";
        varsSheet.Cell(1, 2).Value = "Name";
        varsSheet.Cell(1, 3).Value = "RangeFrom";
        varsSheet.Cell(1, 4).Value = "RangeTo";
        varsSheet.Cell(1, 5).Value = "Formula";

        for (int i = 0; i < model.Variables.Length; i++)
        {
            var v = model.Variables[i];
            varsSheet.Cell(i + 2, 1).Value = v.Id;
            varsSheet.Cell(i + 2, 2).Value = v.Name;
            varsSheet.Cell(i + 2, 3).Value = v.RangeFrom;
            varsSheet.Cell(i + 2, 4).Value = v.RangeTo;
            varsSheet.Cell(i + 2, 5).Value = v.Formula;
        }

        // Relationships sheet
        var relsSheet = workbook.AddWorksheet("Relationships");
        relsSheet.Cell(1, 1).Value = "Id";
        relsSheet.Cell(1, 2).Value = "FromVariable";
        relsSheet.Cell(1, 3).Value = "ToVariable";
        relsSheet.Cell(1, 4).Value = "Type";

        for (int i = 0; i < model.Relationships.Length; i++)
        {
            var r = model.Relationships[i];
            relsSheet.Cell(i + 2, 1).Value = r.Id;
            relsSheet.Cell(i + 2, 2).Value = r.FromVariable;
            relsSheet.Cell(i + 2, 3).Value = r.ToVariable;
            relsSheet.Cell(i + 2, 4).Value = r.Type;
        }

        // Simulation results sheet (if provided)
        if (results is { Length: > 0 })
        {
            var simSheet = workbook.AddWorksheet("Simulation");
            simSheet.Cell(1, 1).Value = "Step";

            // Header row with variable IDs
            var firstResult = results[0];
            if (firstResult.Variables != null)
            {
                for (int j = 0; j < firstResult.Variables.Length; j++)
                    simSheet.Cell(1, j + 2).Value = $"Var {firstResult.Variables[j].Id}";
            }

            // Data rows
            for (int i = 0; i < results.Length; i++)
            {
                simSheet.Cell(i + 2, 1).Value = i;
                if (results[i].Variables != null)
                {
                    for (int j = 0; j < results[i].Variables.Length; j++)
                        simSheet.Cell(i + 2, j + 2).Value = results[i].Variables[j].Value;
                }
            }
        }

        // Export to byte array
        using var ms = new MemoryStream();
        workbook.SaveAs(ms);
        return ms.ToArray();
    }
}

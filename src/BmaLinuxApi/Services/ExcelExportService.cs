namespace BmaLinuxApi.Services;

using BmaLinuxApi.Models;
using ClosedXML.Excel;

public class ExcelExportService : IExportService
{
    public byte[] ExportToExcel(Model model, SimulationResult[] results)
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
        varsSheet.Cell(1, 3).Value = "Formula";

        for (int i = 0; i < model.Variables.Length; i++)
        {
            var v = model.Variables[i];
            varsSheet.Cell(i + 2, 1).Value = v.Id;
            varsSheet.Cell(i + 2, 2).Value = v.Name;
            varsSheet.Cell(i + 2, 3).Value = v.Formula;
        }

        // Export to byte array
        using var ms = new MemoryStream();
        workbook.SaveAs(ms);
        return ms.ToArray();
    }
}

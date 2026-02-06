using System.Text.Json;
using System.Text.Json.Serialization;
using BioCheckAnalyzerCommon;
using BmaLinuxApi.Endpoints;
using BmaLinuxApi.Services;

var builder = WebApplication.CreateBuilder(args);

// Add CORS for development - allows any origin
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// Configure JSON serialization
builder.Services.ConfigureHttpJsonOptions(options =>
{
    // Keep PascalCase (matches API spec)
    options.SerializerOptions.PropertyNamingPolicy = null;

    // Include null values in output
    options.SerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.Never;

    // Handle enums as strings
    options.SerializerOptions.Converters.Add(new JsonStringEnumConverter());
});

// Register F# analyzer (stateless singleton)
builder.Services.AddSingleton<IAnalyzer>(sp =>
{
    var analyzer = new UIMain.Analyzer();
    var logger = sp.GetRequiredService<ILogger<UIMain.Analyzer>>();
    ((IAnalyzer)analyzer).LoggingOn(new LogServiceAdapter(logger));
    return (IAnalyzer)analyzer;
});

// Register services
builder.Services.AddScoped<IAnalysisService, AnalysisService>();
builder.Services.AddScoped<ISimulationService, SimulationService>();
builder.Services.AddScoped<IFurtherTestingService, FurtherTestingService>();
builder.Services.AddScoped<ILtlService, LtlService>();
builder.Services.AddScoped<IExportService, ExcelExportService>();
builder.Services.AddSingleton<IScheduler, PlaceholderScheduler>();

var app = builder.Build();

// Global exception handler - returns consistent JSON error responses
app.UseExceptionHandler(errorApp =>
{
    errorApp.Run(async context =>
    {
        context.Response.StatusCode = StatusCodes.Status500InternalServerError;
        context.Response.ContentType = "application/json";

        var error = context.Features.Get<Microsoft.AspNetCore.Diagnostics.IExceptionHandlerFeature>();
        if (error != null)
        {
            var logger = context.RequestServices.GetRequiredService<ILogger<Program>>();
            logger.LogError(error.Error, "Unhandled exception");

            await context.Response.WriteAsJsonAsync(new
            {
                Error = "An unexpected error occurred",
                // Only include details in development
                Details = app.Environment.IsDevelopment() ? error.Error.Message : null
            });
        }
    });
});

// Handle non-exception status codes (404, etc.) with JSON responses
app.UseStatusCodePages(async statusCodeContext =>
{
    statusCodeContext.HttpContext.Response.ContentType = "application/json";
    await statusCodeContext.HttpContext.Response.WriteAsJsonAsync(new
    {
        Error = $"Status code: {statusCodeContext.HttpContext.Response.StatusCode}"
    });
});

// Configure the HTTP request pipeline
app.UseCors();
app.UseStaticFiles();

// SPA fallback - serve index.html for non-API routes
app.MapFallbackToFile("index.html");

// Health endpoint for monitoring
app.MapHealthEndpoints();

// Simulation endpoint
app.MapSimulateEndpoints();

// Analysis endpoint
app.MapAnalyzeEndpoints();

// FurtherTesting endpoint
app.MapFurtherTestingEndpoints();

// LTL endpoints
app.MapLtlEndpoints();

// Export endpoint
app.MapExportEndpoints();

app.Run();

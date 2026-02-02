using BmaLinuxApi.Services;

var builder = WebApplication.CreateBuilder(args);

// Register services
// Note: F# IAnalyzer registration will be added when implementing actual services
builder.Services.AddScoped<IAnalysisService, PlaceholderAnalysisService>();
builder.Services.AddScoped<ISimulationService, PlaceholderSimulationService>();
builder.Services.AddScoped<IFurtherTestingService, PlaceholderFurtherTestingService>();
builder.Services.AddScoped<ILtlService, PlaceholderLtlService>();
builder.Services.AddSingleton<IScheduler, PlaceholderScheduler>();

var app = builder.Build();

// Configure the HTTP request pipeline
app.UseStaticFiles();

// Placeholder endpoint to verify API is running
app.MapGet("/api/health", () => Results.Ok(new { Status = "Healthy", Timestamp = DateTime.UtcNow }));

app.Run();

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
// (Services will be added in Phase 2)

var app = builder.Build();

// Configure the HTTP request pipeline
app.UseStaticFiles();

// Placeholder endpoint to verify API is running
app.MapGet("/api/health", () => Results.Ok(new { Status = "Healthy", Timestamp = DateTime.UtcNow }));

app.Run();

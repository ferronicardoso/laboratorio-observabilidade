using OpenTelemetry.Metrics;
using System.Diagnostics.Metrics;

var builder = WebApplication.CreateBuilder(args);

// Criar Meter para métricas customizadas
var meter = new Meter("WeatherForecast.API", "1.0");
// Contador de previsões geradas
var forecastCounter = meter.CreateCounter<long>("weather_forecast_generated_total",
    description: "Total de previsões do tempo geradas");

// Add services to the container.
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

// Adicionar HTTP Logging
builder.Services.AddHttpLogging(logging =>
{
    logging.LoggingFields = Microsoft.AspNetCore.HttpLogging.HttpLoggingFields.All;
});

// Configurar OpenTelemetry para métricas
builder.Services.AddOpenTelemetry()
    .WithMetrics(metrics =>
    {
        metrics
            // Instrumentação automática do ASP.NET Core
            .AddAspNetCoreInstrumentation()
            // Instrumentação de HttpClient (se usar)
            .AddHttpClientInstrumentation()
            // Métricas de runtime do .NET
            .AddRuntimeInstrumentation()
            .AddProcessInstrumentation()
            // Adicionar nossas métricas customizadas
            .AddMeter("WeatherForecast.API")
            // Exporter para Prometheus
            .AddPrometheusExporter();
    });

var app = builder.Build();

// Configure the HTTP request pipeline.
app.UseHttpLogging();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

// Endpoint de métricas para Prometheus
app.MapPrometheusScrapingEndpoint();

var summaries = new[]
{
    "Freezing", "Bracing", "Chilly", "Cool", "Mild", "Warm", "Balmy", "Hot", "Sweltering", "Scorching"
};

app.MapGet("/weatherforecast", () =>
{
    var forecast =  Enumerable.Range(1, 5).Select(index =>
        new WeatherForecast
        (
            DateOnly.FromDateTime(DateTime.Now.AddDays(index)),
            Random.Shared.Next(-20, 55),
            summaries[Random.Shared.Next(summaries.Length)]
        ))
        .ToArray();

    // Incrementar contador de previsões geradas
    forecastCounter.Add(forecast.Length);

    return forecast;
})
.WithName("GetWeatherForecast");

app.Run();

record WeatherForecast(DateOnly Date, int TemperatureC, string? Summary)
{
    public int TemperatureF => 32 + (int)(TemperatureC / 0.5556);
}

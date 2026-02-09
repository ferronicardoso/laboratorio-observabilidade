using OpenTelemetry.Metrics;
using OpenTelemetry.Trace;
using OpenTelemetry.Resources;
using System.Diagnostics.Metrics;
using Microsoft.EntityFrameworkCore;
using dotnet_api.Data;
using Serilog;
using Serilog.Formatting.Compact;
using Serilog.Enrichers.Span;

var builder = WebApplication.CreateBuilder(args);

// Configurar Serilog para logging estruturado em JSON
Log.Logger = new LoggerConfiguration()
    .Enrich.FromLogContext()
    .Enrich.WithSpan()  // Adiciona TraceId e SpanId automaticamente
    .Enrich.WithProperty("ServiceName", "dotnet-api")
    .WriteTo.Console(new CompactJsonFormatter())
    .CreateLogger();

builder.Host.UseSerilog();

// Configurar DbContext com SQL Server
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// Adicionar Controllers
builder.Services.AddControllers();

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

// Configurar OpenTelemetry para métricas E traces
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
            .AddMeter("Products.API")
            // Exporter para Prometheus
            .AddPrometheusExporter();
    })
    .WithTracing(tracing =>
    {
        tracing
            // Configurar resource (nome do serviço)
            .SetResourceBuilder(OpenTelemetry.Resources.ResourceBuilder.CreateDefault()
                .AddService("dotnet-api", serviceVersion: "1.0.0"))
            // Instrumentação automática do ASP.NET Core (HTTP requests)
            .AddAspNetCoreInstrumentation(options =>
            {
                options.RecordException = true;
                options.EnrichWithHttpRequest = (activity, request) =>
                {
                    activity.SetTag("http.request.method", request.Method);
                    activity.SetTag("http.request.path", request.Path);
                };
                options.EnrichWithHttpResponse = (activity, response) =>
                {
                    activity.SetTag("http.response.status_code", response.StatusCode);
                };
            })
            // Instrumentação de HttpClient
            .AddHttpClientInstrumentation()
            // Instrumentação de Entity Framework Core (SQL queries!)
            .AddEntityFrameworkCoreInstrumentation(options =>
            {
                options.SetDbStatementForText = true;
                options.SetDbStatementForStoredProcedure = true;
                options.EnrichWithIDbCommand = (activity, command) =>
                {
                    activity.SetTag("db.query", command.CommandText);
                };
            })
            // Exporter OTLP (envia para Alloy → Tempo)
            .AddOtlpExporter(options =>
            {
                options.Endpoint = new Uri("http://alloy:4317");
                options.Protocol = OpenTelemetry.Exporter.OtlpExportProtocol.Grpc;
            });
    });

var app = builder.Build();

// Log inicial da aplicação
Log.Information("Iniciando dotnet-api com logging estruturado");

// Criar banco e seed automaticamente
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var context = services.GetRequiredService<AppDbContext>();

        // Aplicar migrations (cria banco e tabelas com configurações corretas)
        await context.Database.MigrateAsync();
        app.Logger.LogInformation("Database migrations aplicadas com sucesso");

        // Fazer seed de dados
        await DataSeeder.SeedData(context, app.Logger);
    }
    catch (Exception ex)
    {
        app.Logger.LogError(ex, "Erro ao criar database ou seed no banco de dados");
    }
}

// Configure the HTTP request pipeline.
app.UseHttpLogging();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

// Endpoint de métricas para Prometheus
app.MapPrometheusScrapingEndpoint();

// Mapear Controllers
app.MapControllers();

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

try
{
    app.Run();
}
catch (Exception ex)
{
    Log.Fatal(ex, "Aplicação encerrada inesperadamente");
    throw;
}
finally
{
    Log.CloseAndFlush();
}

record WeatherForecast(DateOnly Date, int TemperatureC, string? Summary)
{
    public int TemperatureF => 32 + (int)(TemperatureC / 0.5556);
}

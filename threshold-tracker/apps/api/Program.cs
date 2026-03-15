using Microsoft.EntityFrameworkCore;
using ThresholdTracker.Application.Services;
using ThresholdTracker.Application.Validation;
using ThresholdTracker.Domain.Repositories;
using ThresholdTracker.Infrastructure.Persistence;
using ThresholdTracker.Infrastructure.Repositories;
using ThresholdTracker.Infrastructure.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Database configuration
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(connectionString));

// Domain/Application services
builder.Services.AddScoped<IMapRepository, MapRepository>();
builder.Services.AddScoped<IScoreEntryRepository, ScoreEntryRepository>();
builder.Services.AddScoped<IMapService, MapService>();
builder.Services.AddScoped<IScoreService, ScoreService>();

// External score import abstractions (no concrete provider yet)
builder.Services.AddScoped<IExternalScoreProvider, DummyExternalScoreProvider>();
builder.Services.AddScoped<IScoreImportService, ScoreImportService>();

builder.Services.AddScoped<IMapValidator, MapValidator>();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseRouting();

app.UseAuthorization();

app.MapControllers();

app.Run();


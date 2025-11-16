using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using SCIS.Infrastructure.Data;
using SCIS.Infrastructure.Services;
using SCIS.ML.Services;
using SCIS.Core.Interfaces;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new() { Title = "SCIS API", Version = "v1" });
    c.AddSecurityDefinition("Bearer", new()
    {
        Name = "Authorization",
        Type = Microsoft.OpenApi.Models.SecuritySchemeType.ApiKey,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = Microsoft.OpenApi.Models.ParameterLocation.Header,
        Description = "JWT Authorization header using the Bearer scheme."
    });
    c.AddSecurityRequirement(new()
    {
        {
            new()
            {
                Reference = new()
                {
                    Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

// CORS Configuration - More flexible for development
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(
                "http://localhost:3000", 
                "https://localhost:3000",
                "http://127.0.0.1:3000",
                "https://127.0.0.1:3000"
              )
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials(); // This is important for JWT tokens
    });
    
    // More permissive policy for development
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});
// Database
builder.Services.AddDbContext<SCISDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// Authentication
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"] ?? throw new InvalidOperationException("JWT Key not configured")))
        };
    });

builder.Services.AddAuthorization();

// Services
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IPatientAuthService, PatientAuthService>();
builder.Services.AddScoped<IDataRequestService, DataRequestService>();
builder.Services.AddScoped<IDataRequestEndpointService, DataRequestEndpointService>();
builder.Services.AddScoped<IFeedbackService, FeedbackService>();
builder.Services.AddScoped<IMLService, MLService>();
builder.Services.AddScoped<IHospitalSettingsService, HospitalSettingsService>();
builder.Services.AddScoped<IFhirValidationService, FhirValidationService>();
builder.Services.AddScoped<ISystemManagerService, SystemManagerService>();
builder.Services.AddScoped<IOnboardingService, OnboardingService>();

// Register EmailService with HttpClient
builder.Services.AddHttpClient<IEmailService, EmailService>((serviceProvider, httpClient) =>
{
    var configuration = serviceProvider.GetRequiredService<IConfiguration>();
    var apiKey = configuration["Brevo:ApiKey"];
    if (!string.IsNullOrEmpty(apiKey))
    {
        httpClient.DefaultRequestHeaders.Add("api-key", apiKey);
        httpClient.DefaultRequestHeaders.Add("accept", "application/json");
    }
});
builder.Services.AddHttpClient<FhirValidationService>();
builder.Services.AddHttpClient<DataRequestService>();
builder.Services.AddHttpClient<DataRequestEndpointService>();


var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// IMPORTANT: CORS must be before UseHttpsRedirection to prevent preflight redirect issues
// Use more permissive CORS policy for development
if (app.Environment.IsDevelopment())
{
    app.UseCors("AllowAll");
}
else
{
    app.UseCors("AllowFrontend");
}

// Only use HTTPS redirection in production or when explicitly configured
if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

// Ensure database is created and seed data
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<SCISDbContext>();
    context.Database.EnsureCreated();
    //await SCIS.Infrastructure.Data.SeedData.SeedAsync(context);
}

app.Run();

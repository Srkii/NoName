using backend;
using backend.Data;
using backend.Extensions;
using backend.Interfaces;
using backend.Services;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
builder.Services.AddApplicationServices(builder.Configuration);
builder.Services.AddIdentityServices(builder.Configuration);

builder.Services.AddTransient<IEmailSender,EmailService>();

var app = builder.Build();

// Configure the HTTP request pipeline.
// app.UseHttpsRedirection(); verovatno nam ne treba trenutno

app.UseCors(builder => builder.AllowAnyHeader().AllowAnyMethod().WithOrigins("http://localhost:4200"));

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();

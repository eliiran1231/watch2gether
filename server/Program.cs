using Microsoft.AspNetCore.Http.Features;
using Microsoft.AspNetCore.Mvc;
using server.Hubs;
using server.types;

var builder = WebApplication.CreateBuilder(args);
builder.WebHost.ConfigureKestrel(options =>
{
    options.Limits.MaxRequestBodySize = 1024 * 1024 * 1024; // 1 GB
    options.Limits.KeepAliveTimeout = TimeSpan.FromMinutes(10);
    options.Limits.RequestHeadersTimeout = TimeSpan.FromMinutes(10);
});

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowSpecificOrigin", builder =>
    {
        builder
            .WithOrigins("https://localhost:4200") // Specify your Angular app's origin
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials(); // Allow credentials to include cookies
    });
});

builder.Services.Configure<FormOptions>(options =>
{
    options.MultipartBodyLengthLimit = 1024 * 1024 * 1024; // 1 GB
});

builder.Services.AddSingleton<IRoomsService>(new RoomsService());
builder.Services.AddSignalR();
var app = builder.Build();
app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseCors("AllowSpecificOrigin");
app.MapHub<WatchingHub>("/watchingHub");
app.MapGet("/rooms",(IRoomsService roomsService)=>{
    return roomsService.GetRooms();
});
app.MapPost("/create",(RoomRequestModel room, IRoomsService roomsService, HttpContext context)=>{
    WatchingRoom createdRoom = roomsService.CreateRoom(room.nickName,room.name,room.vidURL);
    var participant = createdRoom.RegisterParticipant(room.nickName, WatcherPermissions.Owner());
    context.Response.Cookies.Append("uid", participant.GetUid(), new CookieOptions
    {
        Expires = DateTimeOffset.UtcNow.AddDays(30),
        HttpOnly = true,  // Ensure cookie is not accessible via JavaScript
        Secure = true,     // Ensure cookie is sent over HTTPS
        SameSite = SameSiteMode.None
    });
    return createdRoom;
});
app.MapPost("/registerRoom", (int id, [FromBody] RegisterRoomModel data, IRoomsService roomService, HttpContext context) =>
{
    var room = roomService.GetRoom(id);
    if (room == null) return Results.NotFound("Room doesn't exist "+id);
    Participant participant = room.RegisterParticipant(data.nickName);
    context.Response.Cookies.Append("uid", participant.GetUid(), new CookieOptions
    {
        Expires = DateTimeOffset.UtcNow.AddDays(30),
        HttpOnly = true,
        Secure = true,
        SameSite = SameSiteMode.None
    });
    return Results.Ok(participant);
});

app.MapGet("/watchingroom", (int id, IRoomsService roomsService) => {
    var room = roomsService.GetRoom(id);
    if(room == null) return Results.NotFound();
    return Results.Ok(room);
});

app.MapPost("/uploadVideo", async (HttpRequest request, [FromForm] IFormFile video) =>
{
    string _uploadPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads");
    if (video == null || video.Length == 0)
    return Results.BadRequest("No file uploaded");

    Directory.CreateDirectory(_uploadPath);

    var fileName = Path.GetRandomFileName() + Path.GetExtension(video.FileName);
    var filePath = Path.Combine(_uploadPath, fileName);

    using (var stream = new FileStream(filePath, FileMode.Create))
    {
        await video.CopyToAsync(stream);
    }
    var baseUrl = $"{request.Scheme}://{request.Host}";
    var fileUrl = $"{baseUrl}/uploads/{fileName}";
    return Results.Ok(new { url = fileUrl });
}).DisableAntiforgery();


app.Run();
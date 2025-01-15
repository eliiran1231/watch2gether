using System.Security.Claims;
using Microsoft.AspNetCore.SignalR;
using server.types;
namespace server.Hubs;

public class WatchingHub(IRoomsService roomsService) : Hub
{
    private readonly IRoomsService roomsService = roomsService;
    public async Task<IResult> JoinRoom(int id)
    {
        WatchingRoom room = roomsService.GetRoom(id) ?? throw new Exception("room doesnt exist");
        string uidCookie = Context.GetHttpContext()?.Request.Cookies["uid"]??"not_set";
        var participant = room.FindRegisteredParticipant(uidCookie);
        if(participant == null){
            return Results.NotFound();
        }
        if(room.FindParticipant(uidCookie) != null) return Results.Problem("already inside");
        Context.Items.Add(Context.ConnectionId,id);
        room.AddParticipant(participant);
        await Groups.AddToGroupAsync(Context.ConnectionId, id+"");
        await Clients.Group(id+"").SendAsync("participantJoined", participant);
        return Results.Ok(participant);
    }
    public async Task<IResult> LeaveRoom(){
        string uidCookie = Context.GetHttpContext()?.Request.Cookies["uid"]??"not_set";
        int id = Context.Items.TryGetValue(Context.ConnectionId, out var idObj) && idObj is int roomId? roomId: -1; 
        var room = roomsService.GetRoom(id);
        if(room == null) return Results.NotFound("no room with this id");
        var participant = room.FindParticipant(uidCookie);
        if(participant == null) return Results.NotFound("no participant with this id");
        room.RemoveParticipant(participant.Id);
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, room.Id+"");
        await Clients.Group(room.Id+"").SendAsync("participantLeft", participant);
        return Results.Ok();
    }

    public async Task<IResult> SendMessage(string content)
    {
        string uidCookie = Context.GetHttpContext()?.Request.Cookies["uid"]??"not_set";
        int id = Context.Items.TryGetValue(Context.ConnectionId, out var idObj) && idObj is int roomId? roomId: -1; 
        var room = roomsService.GetRoom(id);
        if(room == null) return Results.NotFound();
        Participant? participant = room.FindParticipant(uidCookie);
        if(participant == null) return Results.NotFound();
        if(!participant.AuthorizedToAction("chat")) return Results.Unauthorized();
        Message message = new(content,participant);  
        await Clients.Group(room.Id+"").SendAsync("ReceiveMessage",message);
        return Results.Ok(message);
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        await base.OnDisconnectedAsync(exception);
        await LeaveRoom();
    }
    public async Task<IResult> VideoEvent(VideoEvent videoEvent)
    {
        string uidCookie = Context.GetHttpContext()?.Request.Cookies["uid"]??"not_set";
        int id = Context.Items.TryGetValue(Context.ConnectionId, out var idObj) && idObj is int roomId? roomId: -1; 
        var room = roomsService.GetRoom(id);
        if(room == null) return Results.NotFound();
        var participant = room.FindParticipant(uidCookie);
        if(participant == null) return Results.NotFound();
        if(!participant.AuthorizedToAction(videoEvent.Name)) return Results.Unauthorized();
        await Clients.Group(room.Id+"").SendAsync("VideoEvent",new { videoEvent, from=participant});
        return Results.Ok();
    }
    public async Task<IResult> SetPermission(PermissionUpdateModel permissionUpdate){
        string uidCookie = Context.GetHttpContext()?.Request.Cookies["uid"]??"not_set";
        int id = Context.Items.TryGetValue(Context.ConnectionId, out var idObj) && idObj is int roomId? roomId: -1; 
        var room = roomsService.GetRoom(id);
        if(room == null) return Results.NotFound();
        var participant = room.FindParticipant(uidCookie);
        
        if(participant == null) return Results.NotFound();
        if(!participant.AuthorizedToAction("managePermissions")) return Results.Unauthorized();
        
        var targetParticipant = room.FindParticipantById(permissionUpdate.Participant.Id);
        if(targetParticipant==null) return Results.NotFound();
        var registerdTarget = room.FindRegisteredParticipant(targetParticipant.GetUid());

        registerdTarget?.Permissions.SetPermission(permissionUpdate.Action,permissionUpdate.IsPermmited);
        targetParticipant.Permissions.SetPermission(permissionUpdate.Action,permissionUpdate.IsPermmited);

        await Clients.Group(room.Id+"").SendAsync("permissionUpdate",new PermissionUpdateModel(targetParticipant,permissionUpdate.Action,permissionUpdate.IsPermmited));
        return Results.Ok();
    }
}
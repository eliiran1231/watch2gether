using System.Xml;
using Microsoft.VisualBasic;

namespace server.types;

public class RoomRequestModel
{
    public required string nickName {get; set;}
    public required string name { get; set; }
    public required string vidURL { get; set; }
}


public interface IRoomsService{
    WatchingRoom CreateRoom(string nickName,string name, string vidURL);
    List<Room> GetRooms();
    WatchingRoom? GetRoom(int id);
}

class RoomsService : IRoomsService
{
    readonly List<WatchingRoom> rooms = [];
    int lastID = 0;
    public WatchingRoom CreateRoom(string nickName ,string name, string vidURL)
    {
        lastID++;
        WatchingRoom watchingRoom = new(name, lastID, vidURL);
        rooms.Add(watchingRoom);
        return watchingRoom;
    }

    public WatchingRoom? GetRoom(int id)
    {
        return rooms.Find((watchingRoom) => watchingRoom.Id == id);
    }

    public List<Room> GetRooms()
    {
        var roomList = new List<Room>();
        foreach(var room in rooms){
            roomList.Add(room);
        }
        return roomList;
    }
}
public class WatcherPermissions(bool play, bool seeking, bool chat, bool kick, bool ban, bool managePermissions)
{
    public bool Play { get; set; } = play;
    public bool Seeking { get; set; } = seeking;
    public bool Chat { get; set; } = chat;
    public bool Kick { get; set; } = kick;
    public bool Ban { get; set; } = ban;
    public bool ManagePermissions { get; set; } = managePermissions;

    public void SetPermission(string action, bool IsPermmited){
        switch (action){
            case "play":
            case "pause":
                Play = IsPermmited;
                break;
            case "seeking":
            case "seeked":
                Seeking = IsPermmited;
                break;
            case "SendMessage":
                Chat = IsPermmited;
                break;
            case "kick":
                Kick = IsPermmited;
                break;
            case "ban":
                Ban = IsPermmited;
                break;
            case "managePermissions":
                ManagePermissions = IsPermmited;
                break;
        }
    }
    public static WatcherPermissions Owner()=>new(true, true, true, true, true,true);
    public static WatcherPermissions Mod()=>new(true, true, true, true, false,false);
    public static WatcherPermissions Normal()=>new(false, false, true, false, false,false);
}

record UidResult(Participant Participant, WatchingRoom WatchingRoom);

public record RegisterRoomModel(string nickName);

public class Participant(string name, int id, WatcherPermissions permissions)
{
    public string Name { get; set; } = name;
    public int Id { get; set; } = id;
    public WatcherPermissions Permissions { get; set; } = permissions;
    private readonly string uniqueId = Guid.NewGuid().ToString();

    public string GetUid(){
        return uniqueId;
    }
    public bool AuthorizedToAction(string action){
        return action switch
        {
            "play" or "pause" => Permissions.Play,
            "chat" => Permissions.Chat,
            "seeking" or "seeked" => Permissions.Seeking,
            "SendMessage" => Permissions.Chat,
            "kick" => Permissions.Kick,
            "ban" => Permissions.Ban,
            "managePermissions" => Permissions.ManagePermissions,
            _ => false
        };
    }
}
public class Room(string name, int id)
{
    public string Name { get; } = name;
    public int Id { get; } = id;
}

public class WatchingRoom(string name, int id, string vidURL) : Room(name, id)
{
    public string VidURL { get; private set; } = vidURL;
    private int lastParId = 0;
    public List<Participant> participants {get;private set;} = []; 
    public Dictionary<string,Participant> dictionary = [];

    public Participant RegisterParticipant(string nickName, WatcherPermissions? watcherPermissions = null)
    {
        lastParId++;
        var participant = new Participant(nickName, lastParId, watcherPermissions ?? WatcherPermissions.Normal());
        dictionary[participant.GetUid()]=participant;
        return participant;
    }

    public void RemoveParticipant(int id)
    {
        var participant = participants.Find(par => par.Id == id);
        if(participant != null) participants.Remove(participant);
    }
    public Participant? FindRegisteredParticipant(string uid){
        dictionary.TryGetValue(uid, out Participant? participant);
        return participant;
    }
    public Participant? FindParticipant(string uid){
        return participants.Find((p)=>p.GetUid()==uid);
    }
    public Participant? FindParticipantById(int id){
        return participants.Find((p)=>p.Id==id);
    }
    public void AddParticipant(Participant participant){
        participants.Add(participant);
    }
}

public class Message(string content, Participant author)
{
    public string Content { get; set; } = content;
    public Participant Author { get; set; } = author;
    public string Time { get; set; } = DateTime.Now.ToString();
}


public record VideoEventDetails(double Time, bool IsPlaying);
public record VideoEvent(string Name, VideoEventDetails Details);

public record PermissionUpdateModel(Participant Participant, string Action, bool IsPermmited);

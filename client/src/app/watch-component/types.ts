export class WatcherPermissions {
    play: boolean;
    seeking: boolean;
    chat: boolean;
    kick: boolean;
    ban: boolean;
    managePermissions:boolean;

    constructor(pauseOrResumeOrObject: boolean | { play: boolean, seeking: boolean, chat: boolean, kick: boolean, ban: boolean, managePermissions: boolean }, seeking: boolean = false, chat: boolean = false, kick: boolean = false, ban: boolean = false, managePermissions: boolean = false) {
        if (typeof pauseOrResumeOrObject === "boolean") {
            // Single boolean arguments version
            this.play = pauseOrResumeOrObject;
            this.seeking = seeking;
            this.chat = chat;
            this.kick = kick;
            this.ban = ban;
            this.managePermissions = managePermissions;
        } else {
            // Object version
            this.play = pauseOrResumeOrObject.play;
            this.seeking = pauseOrResumeOrObject.seeking;
            this.chat = pauseOrResumeOrObject.chat;
            this.kick = pauseOrResumeOrObject.kick;
            this.ban = pauseOrResumeOrObject.ban;
            this.managePermissions = pauseOrResumeOrObject.managePermissions;
        }
    }

    public setPermission(action:string,isPermmited:boolean){
        (this as any)[action] = isPermmited;
    }

    static Owner = new WatcherPermissions(true,true,true,true,true,true)
    static Mod = new WatcherPermissions(true,true,true,true,false,false)
    static Normal = new WatcherPermissions(false,false,true,false,false,false)
}

export class Participant {
    name: string;
    id: number;
    permissions: WatcherPermissions;

    constructor(name: string, id: number, permissions: WatcherPermissions) {
        this.name = name;
        this.id = id;
        this.permissions = permissions;
    }
}
export class Room {
    name:string;
    id:number
    constructor(name: string,id: number){
        this.name=name;
        this.id=id;
    }
}

export class WatchingRoom extends Room {
    vidURL:string;
    participants:Participant[];
    constructor(name:string,id:number,vidURL: string, participants: Participant[]){
        super(name,id);
        this.vidURL=vidURL;
        this.participants=participants;
    }
}

export interface VideoEventDetails{
    time:number;
    isPlaying:boolean;
};

export interface VideoEvent {
    name: string,
    details: VideoEventDetails;
}

export interface Message{
    time: string;
    author:Participant;
    content: string;
}

export interface permissionUpdate{
    participant:Participant;
    action:string;
    isPermmited:boolean;
}
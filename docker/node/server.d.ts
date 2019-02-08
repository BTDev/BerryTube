// This file is used for documentation reasons. When combined with proper usage of JSDoc, 
// Visual Studio Code will use these as hints for code completion. Otherwise, this file is
// basically ignored.

interface ISocket { }

interface IFilter { 
    enabled: boolean

    nickMatch: string
    nickParam: string
    
    chatMatch: string
    chatParam: string
    
    actionSelector: "none" | "nick" | "hush"
    actionMetadata: any
}

interface IChatMessage {
    msg: string,
    metadata: {
        channel: Channel
    }
}

interface INickRegistration {
    nick: string
    pass: string
}

interface IChangePassword {
    pass: string
}

interface ISetNick {
    nick: Nick
    ghostBust: boolean
}

interface IPlaylistSort {
    from: PlaylistIndex
    to: PlaylistIndex
    sanityId: VideoId
}

interface IDeleteVideo {
    index: PlaylistIndex
}

interface IAddVideo {
    videotitle: string
    videotype: VideoType
    force: boolean
    volat: boolean
    queue: boolean
    videoid: string
}

interface ISetVideoState {
    state: VideoState
}

interface IKickUser {
    nick: Nick,
    reason: string
}

interface IShadowbanUser {
    nick: Nick
    sban: boolean
    temp: boolean
}

declare const enum VideoState {
    PLAYING = 1,
    PAUSED = 2
}

type VideoPosition = number

type VideoId = string

type PlaylistIndex = number

type Channel = "main" | "admin"

type LeaderTarget = Nick | "Server"

type Nick = string

type VideoType =  "yt" | "vimeo" | "soundcloud" | "file" | "dash" | "twitch" | "twitchclip" | "livestream"
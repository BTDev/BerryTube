exports.actions = {
    ACTION_CHANGE_PASSWORD: "changePassword",
    ACTION_REFRESH_PLAYLIST: "refreshMyPlaylist",
    ACTION_REFRESH_VIDEO: "refreshMyVideo",
    ACTION_REGISTER: "registerNick",
    ACTION_RENEW_POSITION: "renewPos",
    ACTION_SET_CHATONLY: "chatOnly",
    ACTION_LOGIN: "setNick",
    ACTION_SET_PLAYLIST_IS_INITIALIZED: "myPlaylistIsInited",
    ACTION_VOTE_POLL: "votePoll",
    
    ACTION_CHAT: "chat",

    ACTION_SET_VIDEO_STATE: "forceStateChange",
    ACTION_SEEK_VIDEO: "videoSeek",
    
    ACTION_CLOSE_POLL: "closePoll",
    ACTION_CREATE_POLL: "createPoll",
    CAN_SEE_OBSCURED_POLLS: "canSeeObscuredPolls",
    
    ACTION_ADD_VIDEO: "addVideo",
    ACTION_PLAY_VIDEO: "forceVideoChange",
    ACTION_SKIP_VIDEO: "playNext",
    ACTION_MOVE_VIDEO: "sortPlaylist",

    ACTION_UNSET_LEADER: "giveUpLeader",
    
    ACTION_DELETE_VIDEO_HISTORY: "delVideoHistory",
    ACTION_DELETE_VIDEO: "delVideo",
    ACTION_FONDLE_USER: "fondleUser",
    ACTION_FONDLE_VIDEO: "fondleVideo",
    ACTION_RANDOMIZE_PLAYLIST: "randomizeList",
    ACTION_SEARCH_VIDEO_HISTORY: "searchHistory",
    ACTION_SET_LEADER: "giveLeader'",
    
    ACTION_BAN: "ban",
    ACTION_DEBUG_DUMP: "debugDump",
    ACTION_FORCE_REFRESH: "forceRefreshAll",
    ACTION_GET_BAN_LIST: "getBanlist",
    ACTION_GET_FILTERS: "getFilters",
    ACTION_GILD: "gild",
    ACTION_KICK_USER: "kickUser",
    ACTION_SET_AREAS: "setAreas",
    ACTION_SET_FILTERS: "setFilters",
    ACTION_SET_OVERRIDE_CSS: "setOverrideCss",
    ACTION_SET_TOGGLEABLE: "setToggleable",
    ACTION_SHADOW_BAN: "shadowBan",
    
    // no auth rules for these...
    ACTION_MOVE_LEADER: "moveLeader",
}
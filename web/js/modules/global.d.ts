declare type PLAYER_STATUS = "PLAYING" | "PAUSED" | "LOADING";

declare type PLAYER_MODE = "INLINE" | "POPOUT" | "AUDIO_ONLY" | "DISABLED";

declare interface BtVideo {
	videoid: string;
	videotype: string;
	videolength: number;
	volat: boolean;
	meta: object;
}

declare interface BtVideoState {
	/**
	 * The unix millisecond timestamp of when the client received (or generated) the request to set the state of the
	 * player.
	 */
	stateCreatedAt: number;
	video?: BtVideo;
	positionInSeconds: number;
	status: PLAYER_STATUS;
	mode: PLAYER_MODE;
	preferences: PlayerPreferences;
}

declare interface PlayerPreferences {
	volume: number; // <- number between 0.0 and 1.0 representing the volume
	sync: PlayerSyncPreferences;
}

declare interface PlayerSyncPreferences {
	isEnabled: boolean;
	accuracyInSeconds: number;
}

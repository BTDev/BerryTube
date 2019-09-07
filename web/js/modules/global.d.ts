declare type PLAYER_STATUS = "PLAYING" | "PAUSED" | "LOADING";

declare interface IVideo {
	videoid: string;
	videotype: string;
	videolength: number;
	volat: boolean;
	meta: object;
}

declare interface IPlayerState {
	stateCreatedAt: number; // <- unix milliseconds timestamp
	video: IVideo;
	positionInSeconds: number;
	status: PLAYER_STATUS;
}

declare interface IPlayerPreferences {
	volume: number; // <- number between 0.0 and 1.0 representing the volume
	sync: {
		isEnabled: boolean;
		accuracyInSeconds: number;
	};
}

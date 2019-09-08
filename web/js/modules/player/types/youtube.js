import { BasePlayer } from "./base.js";
import { PromiseSource, adjustTime } from "../../lib.js";
import { PLAYER_STATUS } from "../../bt.js";

let youtubeApiPromise = null;

/* eslint-disable no-unused-vars */
const YT_STATE_UNSTARTED = -1;
const YT_STATE_ENDED = 0;
const YT_STATE_PLAYING = 1;
const YT_STATE_PAUSED = 2;
const YT_STATE_BUFFERING = 3;
const YT_STATE_CUED = 5;
/* eslint-enable no-unused-vars */

function loadYoutubeApi() {
	if (youtubeApiPromise) {
		return youtubeApiPromise;
	}

	const source = new PromiseSource();
	window.onYouTubeIframeAPIReady = () => {
		source.resolve();
	};

	const scriptElement = document.createElement("script");
	scriptElement.src = "https://www.youtube.com/iframe_api";
	document.head.appendChild(scriptElement);

	return (youtubeApiPromise = source.promise);
}

let playerInstance = null;

export class YoutubePlayer extends BasePlayer {
	constructor(dom, actions) {
		super("yt", dom, actions);
		this.doSeek = false;
	}

	/**
	 * @param {boolean} isEnabled
	 */
	async setEnabled(isEnabled) {
		await super.setEnabled(isEnabled);
		if (!isEnabled) {
			return;
		}

		await loadYoutubeApi();
		if (!playerInstance) {
			await new Promise((resolve, reject) => {
				playerInstance = new window.YT.Player(this.playerDom.el, {
					width: "100%",
					height: "100%",
					playerVars: {
						disablekb: 1,
						enablejsapi: 1,
						iv_load_policy: 3,
						modestbranding: 1,
						playsinline: 1,
						rel: 0,
					},
					events: {
						onReady: resolve,
						onError: reject,
						onStateChange: this.onPlayerStateChange.bind(this),
					},
				});
			});
		}
	}

	/**
	 * @returns {Promise<BtVideoState>}
	 */
	async getState() {
		return await super.getState();
	}

	/**
	 * @param {BtVideoState} state
	 * @returns {Promise<void>}
	 */
	async setState(state) {
		if (!state.video) {
			await super.setState(state);
			return;
		}

		let doSync = true;

		if (
			!this.state.video ||
			this.state.video.videoid !== state.video.videoid
		) {
			const adjustedTime =
				adjustTime(state.stateCreatedAt, state.positionInSeconds) /
				1000;

			const startSeconds = Math.max(adjustedTime, 0);

			playerInstance.loadVideoById({
				videoId: state.video.videoid,
				startSeconds,
			});

			this.doSeek = true;
			doSync = false;
		} else if (this.state.status !== state.status) {
			if (state.status === PLAYER_STATUS.PLAYING) {
				playerInstance.playVideo();
			} else if (state.status === PLAYER_STATUS.PAUSED) {
				playerInstance.pauseVideo();
			}
		}

		await super.setState(state);

		if (doSync) {
			this.syncTime();
		}
	}

	onPlayerStateChange({ data }) {
		const adjustedTime =
			adjustTime(
				this.state.stateCreatedAt,
				this.state.positionInSeconds,
			) / 1000;

		if (data === YT_STATE_PLAYING) {
			if (this.doSeek) {
				this.doSeek = false;

				if (adjustedTime < 0) {
					playerInstance.seekTo(0);
					playerInstance.pauseVideo();
					window.setTimeout(() => {
						playerInstance.playVideo();
						this.syncVolume();
					}, Math.abs(adjustedTime) * 1000);
				} else {
					if (this.state.preferences.sync.isEnabled) {
						playerInstance.seekTo(adjustedTime);
						this.syncVolume();
					}
				}
			} else {
				window.setTimeout(() => this.syncTime(), 250);
			}
		} else if (data === YT_STATE_PAUSED) {
			if (adjustedTime > 0) {
				playerInstance.playVideo();
			}
		}
	}

	syncTime() {
		const {
			state: {
				stateCreatedAt,
				positionInSeconds,
				preferences: { sync },
			},
		} = this;

		if (
			!sync.isEnabled ||
			typeof playerInstance.getCurrentTime() === "undefined"
		) {
			return;
		}

		const adjustedTime = adjustTime(stateCreatedAt, positionInSeconds);

		const timeDiff = Math.abs(
			adjustedTime / 1000 - playerInstance.getCurrentTime(),
		);

		if (timeDiff > sync.accuracyInSeconds) {
			// eslint-disable-next-line no-console
			console.warn(
				`Player got out of sync by ${timeDiff} seconds, adjusting...`,
			);
			playerInstance.seekTo(adjustedTime / 1000);
		}
	}

	syncVolume() {
		const volume = this.state.preferences.volume;
		if (volume === 0) {
			playerInstance.setVolume(0);
			playerInstance.mute();
		} else {
			playerInstance.setVolume(Math.floor(volume * 100));
			playerInstance.unMute();
		}
	}

	async getPreferences() {
		return {
			...this.state.preferences,
			volume: !playerInstance.isMuted()
				? playerInstance.getVolume() / 100
				: 0,
		};
	}
}

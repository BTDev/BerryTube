// cSpell:disable

import {
	shape,
	StringShape,
	NullableStringShape,
	BooleanShape,
	VoidShape,
	NullableBooleanShape,
	NumberShape,
	NullableNumberShape,
	StringArrayShape,
	NumberArrayShape,
} from "lib/shapes";

export const FilterShape = shape({
	kind: "object",
	props: {
		name: NullableStringShape,
		nickMatch: NullableStringShape,
		nickParam: NullableStringShape,
		chatMatch: NullableStringShape,
		chatParam: NullableStringShape,
		chatReplace: NullableStringShape,
		actionSelector: NullableStringShape,
		actionMetadata: NullableStringShape,
		enable: BooleanShape,
	},
});

export const FilterArray = shape({ kind: "array", item: FilterShape });

export const SocketEvents = {
	setOverrideCss: StringShape,
	setFilters: FilterArray,
	searchHistory: shape({ kind: "object", props: { search: StringShape } }),
	delVideoHistory: shape({ kind: "object", props: { videoid: StringShape } }),
	randomizeList: VoidShape,
	getFilters: VoidShape,
	setToggleable: shape({
		kind: "object",
		props: { name: StringShape, state: StringShape },
	}),
	myPlaylistIsInited: VoidShape,
	renewPos: VoidShape,
	refreshMyVideo: VoidShape,
	refreshMyPlaylist: VoidShape,
	chat: shape({
		kind: "object",
		props: {
			msg: StringShape,
			metadata: shape({
				kind: "object",
				props: {
					channel: NullableStringShape,
					flair: NullableStringShape,
					nameflaunt: NullableBooleanShape,
				},
				isNullable: true,
			}),
		},
	}),
	registerNick: shape({
		kind: "object",
		props: {
			nick: StringShape,
			pass: StringShape,
		},
	}),
	changePassword: shape({
		kind: "object",
		props: {
			pass: StringShape,
		},
	}),
	playNext: VoidShape,
	sortPlaylist: shape({
		kind: "object",
		props: {
			from: NumberShape,
			to: NumberShape,
			sanityid: StringShape,
		},
	}),
	forceVideoChange: shape({
		kind: "object",
		props: {
			index: NumberShape,
			sanityid: StringShape,
		},
	}),
	delVideo: shape({
		kind: "object",
		props: {
			index: NumberShape,
			sanityid: StringShape,
		},
	}),
	addVideo: shape({
		kind: "object",
		props: {
			videotype: StringShape,
			videotitle: StringShape,
			videoid: StringShape,
			queue: NullableBooleanShape,
		},
	}),
	forceStateChange: shape({
		kind: "object",
		props: {
			state: NumberShape,
		},
	}),
	videoSeek: NumberShape,
	moveLeader: NullableStringShape,
	kickUser: shape({
		kind: "object",
		props: {
			nick: StringShape,
			reason: NullableStringShape,
		},
	}),
	shadowBan: shape({
		kind: "object",
		props: {
			nick: StringShape,
			sban: BooleanShape,
			temp: BooleanShape,
		},
	}),
	setAreas: shape({
		kind: "object",
		props: {
			areaname: StringShape,
			content: StringShape,
		},
	}),
	fondleVideo: shape({
		kind: "object",
		props: {
			sanityid: StringShape,
			action: StringShape,
			info: shape({
				kind: "object",
				props: {
					pos: NullableNumberShape,
					volat: NullableBooleanShape,
					tag: NullableStringShape,
				},
			}),
		},
	}),
	getBanlist: VoidShape,
	ban: shape({
		kind: "object",
		props: {
			ips: StringArrayShape,
			nicks: StringArrayShape,
			duration: NullableNumberShape,
		},
	}),
	forceRefreshAll: shape({
		kind: "object",
		props: {
			delay: NullableBooleanShape,
		},
	}),
	newPoll: shape({
		kind: "object",
		props: {
			title: StringShape,
			obscure: BooleanShape,
			pollType: StringShape,
			closePollInSeconds: NullableNumberShape,
			ops: shape({
				kind: "array",
				item: shape({
					kind: "object",
					props: {
						text: StringShape,
						isTwoThirds: BooleanShape,
					},
				}),
			}),
		},
	}),
	closePoll: VoidShape,
	votePoll: shape({
		kind: "object",
		props: {
			op: NullableNumberShape,
			ballet: { ...NumberArrayShape, isNullable: true },
		},
	}),
	setNick: shape({
		kind: "object",
		props: {
			nick: StringShape,
			pass: StringShape,
		},
	}),
	disconnect: VoidShape,
};

import socketIo from "socket.io";

import { Settings } from "config";
import { BerryEngine } from "engine";
import { OpenNormalPollCommand } from "modules/polls";
import { GetUserBanInfoQuery } from "modules/security/api";
import { Shape, Unwrap, isShape } from "lib/shapes";
import { SocketEvents } from "./protocol";

export function initializeModule({
	root,
	entities,
	sessions,
	actions: { dispatch },
}: BerryEngine) {
	const io = socketIo.listen(Settings.nodeport);

	io.configure(function() {
		io.set("authorization", async (handshakeData: any, callback: any) => {
			const banInfo = await dispatch(
				GetUserBanInfoQuery,
				{ nicks: [], origins: [handshakeData.address.address] },
				{},
			);

			if (banInfo.isBanned) {
				callback("BAN", false);
			}

			callback(null, true);
		});
	});

	io.sockets.on("connection", (ioSocket: any) => {
		const session = sessions.createSession();
		const socket = session.createSocket({
			emit: ioSocket.emit.bind(ioSocket),
			origin: {
				type: "ipv4",
				value: ioSocket.handshake.headers["x-forwarded-for"],
			},
		});

		// I don't want to deal with the spelling of the parameters of the old protocol
		// cSpell:disable

		handle("setNick", async data => {});

		handle("addVideo", async data => {});

		handle("ban", async data => {});

		handle("changePassword", async data => {});

		handle("chat", async data => {});

		handle("closePoll", async data => {});

		handle("delVideo", async data => {});

		handle("delVideoHistory", async data => {});

		handle("fondleVideo", async data => {});

		handle("forceRefreshAll", async data => {});

		handle("forceStateChange", async data => {});

		handle("forceVideoChange", async data => {});

		handle("getBanlist", async data => {});

		handle("getFilters", async data => {});

		handle("kickUser", async data => {});

		handle("moveLeader", async data => {});

		handle("myPlaylistIsInited", async data => {});

		handle("newPoll", async data => {});

		handle("playNext", async data => {});

		handle("randomizeList", async data => {});

		handle("refreshMyPlaylist", async data => {});

		handle("refreshMyVideo", async data => {});

		handle("registerNick", async data => {});

		handle("renewPos", async data => {});

		handle("searchHistory", async data => {});

		handle("setAreas", async data => {});

		handle("setFilters", async data => {});

		handle("setOverrideCss", async data => {});

		handle("setToggleable", async data => {});

		handle("shadowBan", async data => {});

		handle("sortPlaylist", async data => {});

		handle("videoSeek", async data => {});

		handle("votePoll", async data => {});

		handle("disconnect", async () => {
			socket.dispose();
		});

		function handle<TEventName extends keyof typeof SocketEvents>(
			eventName: TEventName,
			handler: (
				param: Unwrap<typeof SocketEvents[TEventName]>,
			) => void | Promise<void>,
		) {
			ioSocket.on(eventName, async (data: any) => {
				const shape = SocketEvents[eventName];

				try {
					if (!isShape(shape, data)) {
						throw new Error("Invalid shape of data");
					}

					await Promise.resolve(handler(data));
				} catch (e) {
					// tslint:disable-next-line: no-console
					console.error(
						`Unhandled exception in socket handler of ${eventName}`,
					);
					// tslint:disable-next-line: no-console
					console.error(e);
				}
			});
		}
	});
}

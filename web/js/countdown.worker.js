/* global moment */
importScripts(
	"https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.22.2/moment.min.js",
	"https://cdnjs.cloudflare.com/ajax/libs/moment-duration-format/2.2.2/moment-duration-format.min.js"
);

const API_KEY =
	"7f33ca4b6abd4ff029d44986b52dcf9afb601aabd752017bebf6637443501487";
const CALENDAR_KEY = "ks1vk8rt2qcy3vpk6j";
const SUBCALENDAR_RECURRING = 3929506;
const SUBCALENDAR_ONEOFF = 3929522;

let events = [];

function showError(title, reasons) {
	if (!reasons) {
		reasons = ["Unknown reasons"];
	} else if (!Array.isArray(reasons)) {
		reasons = [reasons];
	}

	let html = `<p class="countdown-error-title">${title}</p>`;
	for (const reason of reasons) {
		html += `<p>${reason}</p>`;
	}

	postMessage({
		action: "innerHTML",
		id: "countdown-error",
		html,
	});
}

async function fetchEvents(days, subcalendar) {
	const startDate = moment.utc();
	const endDate = startDate.clone();
	endDate.add(days, "days");

	const resp = await fetch(
		`https://api.teamup.com/${CALENDAR_KEY}/events?_teamup_token=${API_KEY}&startDate=${startDate.format(
			"YYYY-MM-DD",
		)}&endDate=${endDate.format(
			"YYYY-MM-DD",
		)}&subcalendarId[]=${subcalendar}`,
	);
	try {
		if (resp.ok) {
			const data = await resp.json();
			return data.events;
		} else {
			const data = await resp.json();
			showError(data.title, data.message);
		}
	} catch (err) {
		showError("Unhandled fetch error", err);
	}
}

async function updateEvents() {
	const [recurringEvents, oneoffEvents] = await Promise.all([
		fetchEvents(9, SUBCALENDAR_RECURRING),
		fetchEvents(365, SUBCALENDAR_ONEOFF),
	]);

	events = (recurringEvents || []).concat(oneoffEvents || []);
	for (const event of events) {
		event.start_dt = moment(event.start_dt);
		event.end_dt = moment(event.end_dt);
		event.oneoff = !event.series_id;
	}
	events.sort((a, b) => a.start_dt.diff(b.start_dt));
}

async function timerLoop() {
	const now = moment();
	const recurringCutoff = now.clone();
	recurringCutoff.add(7, "days");

	const visibleEvents = events.filter(
		event =>
			event.end_dt.isAfter(now) &&
			(event.oneoff || event.start_dt.isBefore(recurringCutoff)),
	);

	postMessage({
		action: visibleEvents.some(event => event.notes)
			? "removeClass"
			: "addClass",
		id: "countdown-timers",
		class: "countdown-no-notes",
	});

	let html = "";
	for (const event of visibleEvents) {
		if (now.isBetween(event.start_dt, event.end_dt)) {
			html += `
				<tr>
					<th class="countdown-title" scope="row">${event.title}</th>
					<td class="countdown-happening" colspan="2">It's happening!</td>
					<td class="countdown-note">${event.notes}</td>
				</tr>
			`;
		} else {
			const startTime = event.start_dt.format(
				event.oneoff
					? "[<small>]ddd[</small>] MMM Do, hh:mm[<small>] A[</small>]"
					: "[<small>]ddd[</small>] hh:mm[<small>] A[</small>]",
			);

			const timeDiff = moment
				.duration(event.start_dt.diff(now))
				.format(
					"d[<small>d</small>] hh[<small>h</small>] mm[<small>m</small>]",
				);

			html += `
				<tr>
					<th class="countdown-title" scope="row">${event.title}</th>
					<td class="countdown-start-time">${startTime}</td>
					<td class="countdown-time-diff">${timeDiff}</td>
					<td class="countdown-note">${event.notes}</td>
				</tr>
			`;
		}
	}

	postMessage({
		action: "innerHTML",
		id: "countdown-body",
		html,
	});

	// update 1 second past the minute
	setTimeout(timerLoop, 61000 - now.seconds() * 1000 - now.milliseconds());
}

async function init() {
	await updateEvents();
	await timerLoop();

	// reload calendar once a day
	// subtract up to an hour to reduce API spam when many clients reload simultaneously
	setInterval(
		updateEvents,
		Math.floor(1000 * 60 * 60 * (24 - Math.random())),
	);
}

// randomize to reduce API spam when many clients reload simultaneously
setTimeout(init, 2000 * Math.random());

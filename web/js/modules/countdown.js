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

	const container = document.getElementById("countdown-error");
	container.innerHTML = "";

	const titleElement = document.createElement("p");
	titleElement.classList.add("countdown-error-title");
	titleElement.textContent = title;
	container.appendChild(titleElement);

	for (const reason of reasons) {
		const textElement = document.createElement("p");
		textElement.textContent = reason;
		container.appendChild(textElement);
	}
}

async function fetchEvents(days, subcalendar) {
	const startDate = window.moment.utc();
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
		showError("Unhandled error", err);
	}
}

async function updateEvents() {
	const [recurringEvents, oneoffEvents] = await Promise.all([
		fetchEvents(9, SUBCALENDAR_RECURRING),
		fetchEvents(365, SUBCALENDAR_ONEOFF),
	]);

	events = recurringEvents.concat(oneoffEvents);
	for (const event of events) {
		event.start_dt = window.moment(event.start_dt);
		event.end_dt = window.moment(event.end_dt);
		event.oneoff = !event.series_id;
	}
	events.sort((a, b) => a.start_dt.diff(b.start_dt));
}

async function timerLoop() {
	const now = window.moment();
	const recurringCutoff = now.clone();
	recurringCutoff.add(7, "days");

	const visibleEvents = events.filter(
		event =>
			event.end_dt.isAfter(now) &&
			(event.oneoff || event.start_dt.isBefore(recurringCutoff)),
	);

	const table = document.getElementById("countdown-timers");
	if (visibleEvents.some(event => event.notes)) {
		table.classList.remove("countdown-no-notes");
	} else {
		table.classList.add("countdown-no-notes");
	}

	const tbody = document.createElement("tbody");
	for (const event of visibleEvents) {
		let tr;
		if (now.isBetween(event.start_dt, event.end_dt)) {
			tr = document.getElementById("countdown-happening-row").content;
		} else {
			tr = document.getElementById("countdown-future-row").content;

			if (event.oneoff) {
				tr.querySelector(
					".countdown-start-time",
				).innerHTML = event.start_dt.format(
					"[<small>]ddd[</small>] MMM Do, hh:mm[<small>] A[</small>]",
				);
			} else {
				tr.querySelector(
					".countdown-start-time",
				).innerHTML = event.start_dt.format(
					"[<small>]ddd[</small>] hh:mm[<small>] A[</small>]",
				);
			}

			tr.querySelector(
				".countdown-time-diff",
			).innerHTML = window.moment
				.duration(event.start_dt.diff(now))
				.format(
					"d[<small>d</small>] hh[<small>h</small>] mm[<small>m</small>]",
				);
		}

		tr.querySelector(".countdown-title").textContent = event.title;
		tr.querySelector(".countdown-note").innerHTML = event.notes;

		tbody.appendChild(document.importNode(tr, true));
	}

	const oldTbody = document.querySelector("#countdown-timers > tbody");
	oldTbody.parentNode.replaceChild(tbody, oldTbody);

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

function initSoon() {
	// leave some extra time to not fight with page load too much
	// randomize to reduce API spam when many clients reload simultaneously
	setTimeout(init, 100 + 2000 * Math.random());
}

if (document.readyState === "loading") {
	window.addEventListener("DOMContentLoaded", initSoon);
} else {
	initSoon();
}

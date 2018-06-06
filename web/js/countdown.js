'use strict';
(function(){

const API_KEY = '7f33ca4b6abd4ff029d44986b52dcf9afb601aabd752017bebf6637443501487';
const CALENDAR_KEY = 'ks1vk8rt2qcy3vpk6j';
const SUBCALENDAR_RECURRING = 3929506;
const SUBCALENDAR_ONCEOFF = 3929522;

let events = [];

function showError(title, reasons) {
    if (!title) {
        title = 'Unknown error';
    }
    if (!reasons) {
        reasons = ['Unknown reasons'];
    }
    if (!Array.isArray(reasons)) {
        reasons = [reasons];
    }

    reasons = reasons.map(msg => `<p>${msg}</p>`).join('');
    document.getElementById('countdown-error').innerHTML = `<p class="countdown-error-title">${title}</p>${reasons}`;
}

function fetchEvents(days, subcalendar) {
    const startDate = moment.utc();
    const endDate = startDate.clone();
    endDate.add(days, 'days');

    return fetch(`https://api.teamup.com/${CALENDAR_KEY}/events?_teamup_token=${API_KEY}&startDate=${startDate.format('YYYY-MM-DD')}&endDate=${endDate.format('YYYY-MM-DD')}&subcalendarId[]=${subcalendar}`)
        .then(resp => {
            if (resp.ok) {
                return resp.json();
            } else {
                return resp.json().then(data => {
                    showError(data.title, data.message);
                }).catch(err => {
                    showError('Error error', err);
                });
            }
        }).catch(err => {
            showError('Network error', err);
        });
}

function updateEvents() {
    return Promise.all([
        fetchEvents(8, SUBCALENDAR_RECURRING).then(data => data.events),
        fetchEvents(365, SUBCALENDAR_ONCEOFF).then(data => {
            for (const event of data.events) {
                event.oneoff = true;
            }
            return data.events.filter(event => !event.series_id);
        })
    ]).then(vals => {
        events = vals[0].concat(vals[1]);
        for (const event of events) {
            //event.creation_dt = moment(event.creation_dt);
            event.start_dt = moment(event.start_dt);
            event.end_dt = moment(event.end_dt);
            //if (event.series_id) {
            //    event.ristart_dt = moment(event.ristart_dt);
            //    event.rsstart_dt = moment(event.rsstart_dt);
            //}
        }
        events.sort((a, b) => a.start_dt.unix() - b.start_dt.unix());

        const table = document.getElementById('countdown-timers');
        if (events.some(event => event.notes)) {
            table.classList.remove('countdown-no-notes');
        } else {
            table.classList.add('countdown-no-notes');
        }
    }).catch(err => {
        showError('Event update error', err);
    });
}

function updateTimers() {
    const now = moment();
    const nextWeek = now.clone();
    nextWeek.add(7, 'days');

    const tbody = document.createElement('tbody');
    for (const event of events.filter(event => event.end_dt.isAfter(now) && (event.oneoff || event.end_dt.isBefore(nextWeek)))) {
        let tr;
        if (now.isBetween(event.start_dt, event.end_dt)) {
            tr = document.getElementById('countdown-happening-row').content;
        } else {
            tr = document.getElementById('countdown-future-row').content;

            if (event.oneoff) {
                tr.querySelector('.countdown-start-time').innerHTML = event.start_dt.format('[<small>]ddd[</small>] MMM Do, hh:mm[<small>] A[</small>]');
            } else {
                tr.querySelector('.countdown-start-time').innerHTML = event.start_dt.format('[<small>]ddd[</small>] hh:mm[<small>] A[</small>]');
            }

            tr.querySelector('.countdown-time-diff').innerHTML = moment.duration(event.start_dt.diff(now)).format('d[<small>d</small>] hh[<small>h</small>] mm[<small>m</small>] ss[<small>s</small>]');
        }

        tr.querySelector('.countdown-title').textContent = event.title;
        tr.querySelector('.countdown-note').innerHTML = event.notes;

        tbody.appendChild(document.importNode(tr, true));
    }

    const oldTbody = document.querySelector('#countdown-timers > tbody');
    oldTbody.parentNode.replaceChild(tbody, oldTbody);
}

setTimeout(() => {
    updateEvents().then(() => {
        updateTimers();
        setInterval(updateTimers, 1000); // recalculate times once a second
        setInterval(updateEvents, Math.floor(1000 * 60 * 60 * (24 - Math.random() * 3))); // reload calendar once a day, give or take
    });
}, 1000 * Math.random());

})();

function getTypeLabel(type) {
    switch (type) {
        case 2: return 'admin';
        case 1: return 'spike';
        case 0: return 'user';
        default: return 'unknown';
    }
}

async function updateForms() {
    const main = document.getElementById('main');
    main.innerHTML = '';

    const body = new FormData();
    body.append('username', localStorage.nick);
    body.append('password', localStorage.pass);

    const response = await fetch('api.php', {
        method: 'POST',
        body,
    });
    if (!response.ok) {
        main.textContent = await response.text();
        return;
    }
    const candidates = await response.json();

    for (const [candidate, type] of Object.entries(candidates)) {
        const header = document.createElement('h2');
        header.textContent = candidate;
        main.appendChild(header);

        const status = document.createElement('p');
        status.textContent = `Currently: ${getTypeLabel(type)}`;
        main.appendChild(status);

        const form = document.createElement('form');
        form.action = 'api.php';
        form.method = 'POST';

        let input;
        input = document.createElement('input');
        input.type = 'hidden';
        input.name = 'username';
        input.value = localStorage.nick;
        form.appendChild(input);

        input = document.createElement('input');
        input.type = 'hidden';
        input.name = 'password';
        input.value = localStorage.pass;
        form.appendChild(input);

        input = document.createElement('input');
        input.type = 'hidden';
        input.name = 'candidate';
        input.value = candidate;
        form.appendChild(input);

        input = document.createElement('input');
        input.type = 'submit';
        input.name = 'action';
        input.value = 'Promote';
        form.appendChild(input);

        input = document.createElement('input');
        input.type = 'submit';
        input.name = 'action';
        input.value = 'Demote';
        form.appendChild(input);

        main.appendChild(form);
    }
}

async function main() {
    if (!localStorage.nick || !localStorage.pass) {
        document.getElementById('main').textContent = 'You must be logged in to BerryTube to use this page.';
        return;
    }

    await updateForms();
}

main().catch(console.error);

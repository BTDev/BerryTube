export function ensureExists(selector) {
    return new Promise(res => {
        window.whenExists(selector, el => res(el[0]));
    });
}

export function addPollMessage(creator, title) {
    window.addChatMsg({
        msg: {
            emote: "poll",
            nick: creator,
            type: 0,
            msg: title,
            multi: 0,
            metadata: false
        },
        ghost: false
    }, "#chatbuffer");
}
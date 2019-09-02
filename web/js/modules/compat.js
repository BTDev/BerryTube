// this file creates some global objects that other scripts expect to exist so we don't get errors
window.$ = window.jQuery = window.jQuery || (() => ({ length: 0 }));
window.$.each = window.$.each || (() => {});

// we can safely just set these, because modules are loaded first, the other scripts will overwrite them if they also
// provide the same globals
window.PLAYERS = window.PLAYERS || {};
window.VOLUME = 0;

// maltweaks doesn't do its init until waitForFlag returns, so overriding it here makes maltweaks not initialize (which
// is what we want by default)
window.waitForFlag = () => {};

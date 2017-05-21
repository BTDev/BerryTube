var settings = {}

settings.core = {};
settings.toggles = {};
settings.mysql = {};
settings.vc = {};

// Init Core settings
settings.core.version = "2.1.0";
settings.core.nodeport = 8344; // the server listening port.
settings.core.log_file_name = "bt.log";
settings.core.error_file_name = "error_bt.log";
settings.core.debug_file_name = "debug.log";
settings.core.max_saved_buffer = 15; // # of saved messages in chatlog sent to people who join.
settings.core.db_commit_delay = 1000 * 60 * 10; // ms
settings.core.heartbeat_interval = 10000; // ms
settings.core.max_connections_per_ip = 100;
settings.core.auto_volatile = 600; // Seconds
settings.core.spamhp = 15000; // ms
settings.core.spamcompare = 3000; // ms
settings.core.max_chat_size = 400; // characters
settings.core.temp_ban_duration = 1000 * 60 * 60 * 12; // ms
settings.core.login_fail_duration = 1000 * 60 * 10; // ms
settings.core.max_failed_logins = 10; // Number of times an IP can password fail before getting locked out.
settings.core.register_cooldown = 1000 * 60 * 30; //ms
settings.core.country_restriction_ignored = ['DE', 'IL']; // Some countries are particularly restrictive, ignore them.
settings.core.country_allow_required = ['GB', 'CA', 'US']; // Required countries if we have an allow list instead of a deny list


// Init Toggle settings
settings.toggles.flutteryay = [true,'Pink Yay'];
settings.toggles.bestponi = [false,'Best Poni'];
settings.toggles.wobniar = [false,'wobniaR'];
//settings.toggles.noghetti = [true,'Kick for ghetti'];
settings.toggles.mutegray = [false,'Mute Greynames'];
settings.toggles.allowreg = [true,'Allow Registration'];
settings.toggles.spaceaids = [true,'Bans are Contagious'];

// Init Videocontrol settings
settings.vc.tail_time = 2; // seconds
settings.vc.head_time = 3; // seconds

module.exports = settings;

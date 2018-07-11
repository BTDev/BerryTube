<?php

header('Content-Type: application/javascript');

require('../config.php');

echo 'scriptNodes=', json_encode([
    [
        'title' => 'ToastThemes',
        'desc' => 'A script that provides a large assortment of custom themes for the site, along with a few other fun features.',
        'authors' => ['Toastdeib'],
        'setting' => 'scriptNodeToastThemesEnabled',
        'css' => [cdn('plugins/toastthemes/toastthemes.css')],
        'js' => [cdn('plugins/toastthemes/toastthemes.js')]
    ]/*,
    [
        'title' => 'Ponypen',
        'desc' => 'A script that turns the video player into a pony playground.',
        'authors' => ['wut'],
        'setting' => 'scriptNodePonypenEnabled',
        'css' => [],
        'js' => ['https://btc.berrytube.tv/wut/ponypen.js']
    ]*/,
    [
        'title' => 'wutColors',
        'desc' => 'Gives each user a unique color to make chat easier to keep track of. <a href="http://btc.berrytube.tv/wut/wutColors/" target="_blank">Set your color here</a>',
        'authors' => ['wut'],
        'settings' => 'scriptNodeWutColorsEnabled',
        'css' => ['https://dl.dropboxusercontent.com/s/f5axkxk4wojatsf/style.css'],
        'js' => [cdn('plugins/wutcolors/wutColors.js')]
    ],
    [
        'title' => 'X-Ups',
        'desc' => 'Helps find a random user to berry.',
        'authors' => ['Cades'],
        'settings' => 'scriptNodeXupsEnabled',
        'minType' =>  1,
        'css' => [],
        'js' => [cdn('plugins/xups/xups-mod.js')]
    ],
    [
        'title' => 'DPM Counter',
        'desc' => 'A script that displays the drinks per minute for the active video next to the drink counter.',
        'authors' => ['Cades', 'Toastdeib'],
        'setting' => 'scriptNodeDpmEnabled',
        'css' => [],
        'js' => [cdn('plugins/dpm/dpm.js')]
    ],
    [
        'title' => 'Moonbase Alpha',
        'desc' => 'A script that speaks every line of chat with text-to-speech.',
        'authors' => ['wut'],
        'setting' => 'scriptNodeTtsEnabled',
        'css' => [],
        'js' => [cdn('plugins/tts/tts.js')]
    ],
    [
        'title' => 'Desktop Squees',
        'desc' => 'Display desktop notifications when your name is mentioned. Tested on Firefox and Chrome.',
        'authors' => ['Malsententia'],
        'setting' => 'scriptNodeDesktopSqueesEnabled',
        'css' => [],
        'js' => [cdn('plugins/desktopSquees/desktopSquees.js')]
    ],
    [
        'title' => 'Playlist Enhancement Plugin',
        'desc' => 'Set one-time or recurring alarms for upcoming/favorite playlist items! View estimated play times! Copy video links to the clipboard!',
        'authors' => ['Malsententia'],
        'setting' => 'scriptNodePEPEnabled',
        'css' => [cdn('plugins/pep/pep.css'),cdn('plugins/pep/multipleselectbox.css')],
        'js' => [cdn('plugins/pep/pep.js')]
    ],
    [
        'title' => 'Video Blacklist',
        'desc' => 'Adds right-click buttons for playlist entries allowing you to specify videos to not play.',
        'authors' => ['Cades'],
        'setting' => 'scriptNodeVideoBlacklistEnabled',
        'css' => [],
        'js' => [cdn('plugins/videoBlacklist/videoBlacklist.js')]
    ]
]), ';';

<?php

// must be a power of two between 16 and 4096, Discord desktop uses 48
$emoteSize = 48;
$cacheTimeSeconds = 60 * 5;

header('Content-Type: application/json');

$botToken = getenv('DISCORD_BOT_TOKEN');
$guildId = getenv('DISCORD_GUILD_ID');
if (!$botToken || !$guildId) {
    die('[]');
}

require_once('./config.php');

function loadFromCache() {
    global $mysqli;
    global $cacheTimeSeconds;

    $result = $mysqli->query('SELECT value FROM misc WHERE name = "discord_emotes"');
    $json = $result ? $result->fetch_array()[0] : null;
    if ($json) {
        $cache = json_decode($json);
        if ($cache->time + $cacheTimeSeconds > time()) {
            header('X-BT-FromCache: true');
            return $cache->emotes;
        }
    }
    header('X-BT-FromCache: false');
    return null;
}

function saveToCache($emotes) {
    global $mysqli;

    $json = json_encode([
        'time' => time(),
        'emotes' => $emotes,
    ], JSON_UNESCAPED_SLASHES);
    $statement = $mysqli->prepare('INSERT INTO misc (name, value) VALUES ("discord_emotes", ?) ON DUPLICATE KEY UPDATE value = ?');
    $statement->bind_param("ss", $json, $json);
    $statement->execute();
}

function loadFromDiscord() {
    global $botToken;
    global $guildId;
    global $emoteSize;

    $context = stream_context_create([
        'http' => [
            'method' => 'GET',
            'header' => "Accept: application/json\r\nAuthorization: Bot $botToken\r\n",
            'timeout' => 5,
        ]
    ]);
    $emojis = json_decode(file_get_contents("https://discord.com/api/v9/guilds/$guildId/emojis", false, $context));

    $emotes = [];
    foreach ($emojis as $emoji) {
        if ($emoji->available && $emoji->require_colons) {
            $emotes []= [
                'background-image' => "https://cdn.discordapp.com/emojis/$emoji->id.png?size=$emoteSize",
                'tags' => [],
                'sr' => 'discordserver',
                'height' => $emoteSize,
                'width' => $emoteSize,
                'names' => [$emoji->name]
            ];
        }
    }
    return $emotes;
}


$emotes = loadFromCache();
if (!$emotes) {
    $emotes = loadFromDiscord();
    saveToCache($emotes);
}

echo json_encode($emotes, JSON_UNESCAPED_SLASHES);

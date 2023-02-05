<?php

$ORG_NAME = 'BTDev';
$APP_ID = 289830;
$INSTALLATION_ID = 33872107;

if (!isset($_GET['repo'])) {
    http_response_code(400);
    die('missing repo parameter');
}

function base64url_encode($data) {
    return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
}

function api($path, $auth, $body = null) {
    global $ORG_NAME;

    $ch = curl_init("https://api.github.com/$path");

    $headers = [
        'Accept: application/vnd.github+json',
        'X-GitHub-Api-Version: 2022-11-28',
        "User-Agent: @$ORG_NAME",
        "Authorization: Bearer $auth",
    ];
    if ($body != null) {
        $headers []= 'Content-Type: application/json';
        $headers []= 'Content-Length: ' . strlen($body);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $body);
    }

    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

    $data = curl_exec($ch);

    if (curl_errno($ch)) {
        http_response_code(500);
        die(curl_error($ch));
    }

    $status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    if ($status < 200 || $status >= 300) {
        http_response_code($status);
        $json = json_decode($data);
        if ($json && $json->message) {
            die($json->message);
        }
        die("$status");
    }

    curl_close($ch);
    return $data;
}

$token = json_decode(@file_get_contents('/tmp/github_token.json'));
if (!$token || strtotime($token->expires_at) < time() + 60) {
    $jwt_header = base64url_encode(json_encode([
        'alg' => 'RS256',
        'typ' => 'JWT',
    ]));

    $jwt_payload = base64url_encode(json_encode([
        'iat' => time() - 60,
        'exp' => time() + 60,
        'iss' => "$APP_ID",
    ]));

    $github_key = openssl_pkey_get_private('file:///var/secrets/github.pem');
    openssl_sign("$jwt_header.$jwt_payload", $jwt_signature, $github_key, OPENSSL_ALGO_SHA256);
    $jwt_signature = base64url_encode($jwt_signature);
    $jwt = "$jwt_header.$jwt_payload.$jwt_signature";

    $token = json_decode(api("app/installations/$INSTALLATION_ID/access_tokens", $jwt, '{}'));
    file_put_contents('/tmp/github_token.json', json_encode($token));
}

$release = json_decode(api("repos/$ORG_NAME/$_GET[repo]/releases/latest", $token->token));
foreach ($release->assets as $asset) {
    if (str_ends_with($asset->name, '-debug.apk')) {
        $debug_asset = $asset;
    } elseif (str_ends_with($asset->name, '.apk')) {
        $release_asset = $asset;
    }
}

header('Content-Type: application/json');
echo json_encode([
    'name' => $release->name,
    'description' => $release->body,
    'version' => $release->tag_name,
    'url' => $release->html_url,
    'time' => $release->published_at,
    'assets' => [
        'debug' => isset($debug_asset) ? [
            'size' => $debug_asset->size,
            'url' => $debug_asset->browser_download_url,
        ] : null,
        'release' => [
            'size' => $release_asset->size,
            'url' => $release_asset->browser_download_url,
        ],
    ],
]);

<?php

header('Content-Type: text/plain');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405); // 405 Method Not Allowed
    die('only POST requests are allowed');
}

if (empty($_POST['token'])) {
    http_response_code(400); // 400 Bad Request
    die('no "token" in request');
}

require_once('apiconfig.php');
require_once('cors.php');

mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);
$mysqli = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
if (mysqli_connect_error()) {
    die('Connect Error (' . mysqli_connect_errno() . ') '. mysqli_connect_error());
}

$stmt = $mysqli->prepare("
    SELECT
        users.id,
        users.name,
        users.type,
        DATE_FORMAT(tokens.created, '%Y-%m-%dT%TZ')
    FROM
        users,
        tokens
    WHERE
        users.name = tokens.nick
        AND
        tokens.token = ?
    ");
$stmt->bind_param("s", $_POST['token']);
$stmt->execute();
$stmt->bind_result($id, $name, $type, $token_created);

if ($stmt->fetch()) {
    header('Content-Type: application/json');
    echo json_encode([
        'id' => $id,
        'name' => $name,
        'type' => $type,
        'token_created' => $token_created,
    ]);
} else {
    http_response_code(404); // 404 Not Found
    die('no such token');
}

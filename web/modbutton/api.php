<?php

require_once('../config.php');

$statement = $mysqli->prepare('SELECT `pass`, `type` FROM `users` WHERE `name` = ?');
$statement->bind_param('s', $_POST['username']);
$statement->execute();
$result = $statement->get_result();
$row = $result->fetch_array(MYSQLI_ASSOC);
if (!checkPassword($_POST['password'], $row['pass'])) {
    header('Status: 403 Forbidden');
    die('Invalid password');
}
if ($row['type'] < 2) {
    header('Status: 403 Forbidden');
    die('You are not an admin');
}

$candidates = [];
$result = $mysqli->query('SELECT `name`, `type` FROM `users` WHERE `meta`->"$.modbutton" = TRUE');
foreach ($result->fetch_all(MYSQLI_ASSOC) as $row) {
    $candidates[$row['name']] = intval($row['type']);
}

function checkPassword($input, $actual) {
    return md5($input) == $actual || password_verify($input, preg_replace('/^\\$2b\\$/', '\\$2y\\$', $actual));
}

if (isset($_POST['action'])) {
    switch ($_POST['action']) {
        case 'Promote':
            $type = 2;
            break;
        case 'Demote':
            $type = 0;
            break;
        default:
            die('Invalid action');
    }

    if (!isset($candidates[$_POST['candidate']])) {
        die('Invalid candidate');
    }

    $statement = $mysqli->prepare('UPDATE `users` SET `type` = ? WHERE `name` = ?');
    $statement->bind_param('is', $type, $_POST['candidate']);
    $statement->execute();

    header('Location: /modbutton/');
    die();
}

echo json_encode($candidates);

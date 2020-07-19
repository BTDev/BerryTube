<?php

    define("DB_HOST", "mysql");
    define("DB_NAME", "berrytube");
    define("DB_USER", "berrytube");
    define("DB_PASS", getenv('MYSQL_PASSWORD') ? getenv('MYSQL_PASSWORD') : 'berrytube');

    $domain = getenv('DOMAIN');
    $https = getenv('TLS_TYPE') != 'none';
    $scheme = $https ? 'https' : 'http';

    $port = '';
    if ($https && getenv('HTTPS_PORT') !== '443') {
        $port = ':' . getenv('HTTPS_PORT');
    }
    if (!$https && getenv('HTTPS_PORT') !== '80') {
        $port = ':' . getenv('HTTPS_PORT');
    }


    define('NO_CDN', getenv('NO_CDN') === 'true');
    define('NO_MINIFIED', getenv('NO_MINIFIED') === 'true');
    define('CLIENT_IP', $_SERVER['REMOTE_ADDR']);
    define("PATH","/");

    define('ORIGIN', "$scheme://$domain$port");
    define('SOCKET_ORIGIN', "$scheme://socket.$domain$port");
    define('CDN_ORIGIN', ORIGIN);

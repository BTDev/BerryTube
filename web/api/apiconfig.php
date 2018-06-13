<?php

    define("DB_HOST","mysql");
    define("DB_NAME","berrytube");
    define("DB_USER","berrytube");
    define("DB_PASS",getenv('MYSQL_PASSWORD') ? getenv('MYSQL_PASSWORD') : 'berrytube');
    define('ORIGIN', 'https://' . getenv('DOMAIN') . ((getenv('HTTPS_PORT') === '443') ? '' : (':' . getenv('HTTPS_PORT'))));
    define('SOCKET_ORIGIN', 'https://' . getenv('SOCKET_DOMAIN') . ((getenv('HTTPS_PORT') === '443') ? '' : (':' . getenv('HTTPS_PORT'))));
    define('CDN_ORIGIN', 'https://' . getenv('CDN_DOMAIN') . ((getenv('HTTPS_PORT') === '443') ? '' : (':' . getenv('HTTPS_PORT'))));
    define('OLD_ORIGIN', 'http://' . getenv('DOMAIN') . ((getenv('HTTP_PORT') === '80') ? '' : (':' . getenv('HTTP_PORT'))));
    define('OLD_ORIGIN_WWW', 'http://www.' . getenv('DOMAIN') . ((getenv('HTTP_PORT') === '80') ? '' : (':' . getenv('HTTP_PORT'))));
    define('NO_CDN', getenv('NO_CDN') === 'true');
    if (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
        define('CLIENT_IP', $_SERVER['HTTP_X_FORWARDED_FOR']);
    } else {
        define('CLIENT_IP', $_SERVER['REMOTE_ADDR']);
    }
    /* CUT AFTER ME FOR ANY CHANGES. */
    define("PATH","/");

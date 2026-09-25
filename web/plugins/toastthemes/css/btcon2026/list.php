<?php

function getDirContents($dir, &$results = array()) {
    $files = scandir($dir);

    foreach ($files as $key => $value) {
        $path = $dir . DIRECTORY_SEPARATOR . $value;
        if (!is_dir($path)) {
            $results[] = $path;
        } else if ($value != "." && $value != "..") {
            getDirContents($path, $results);
            $results[] = $path;
        }
    }

    return $results;
}

header('Content-Type: application/json');
header('Cache-Control: no-cache, stale-if-error=3600');
echo json_encode(getDirContents('images'), JSON_UNESCAPED_SLASHES);

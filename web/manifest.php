<?php

define('MAX_SOURCES', 5);

// Instead of the full exception, only its message is shown to users
class PrettyException extends Exception { }

function parse_duration($input) {
    $parts = explode(':', $input);
    $seconds = intval(array_pop($parts));
    $seconds += intval(array_pop($parts)) * 60;
    $seconds += intval(array_pop($parts)) * 60 * 60;
    return $seconds;
}

function generate_manifest() {
    $data = [
        'title' => $_POST['title'],
        'duration' => parse_duration($_POST['duration']),
        'sources' => [],
    ];
    foreach ($_POST['urls'] as $i => $url) {
        $ordinal = $i + 1; // for error messages
        $quality = $_POST['qualities'][$i];
        if ($url) {
            if (!$quality) {
                throw new PrettyException("Source URL #${ordinal} doesn't have a quality");
            }

            if (!$_POST['skipchecks']) {
                $curl = curl_init();
                curl_setopt($curl, CURLOPT_URL, $url);
                curl_setopt($curl, CURLOPT_NOBODY, true);
                curl_setopt($curl, CURLOPT_FOLLOWLOCATION, true);
                curl_setopt($curl, CURLOPT_CONNECTTIMEOUT, 5);
                curl_setopt($curl, CURLOPT_TIMEOUT, 5);
                curl_exec($curl);

                if ($errno = curl_errno($curl)) {
                    $errstr = curl_strerror($errno);
                    throw new PrettyException("Source URL #${ordinal} doesn't seem to work (Error $errno: $errstr)");
                }

                $code = intval(curl_getinfo($curl, CURLINFO_RESPONSE_CODE));
                curl_close($curl);
                if ($code != 200) {
                    throw new PrettyException("Source URL #${ordinal} doesn't seem to work (HTTP $code)");
                }

                passthru('/usr/bin/ffprobe ' . escapeshellarg($url));
                if (exec('/usr/bin/ffprobe ' . escapeshellarg($url), $ffmpeg) === 0) {
                    var_dump($ffmpeg);
                    if (preg_match('/^\s*Duration: ([^,]+)/m', implode('\n', $ffmpeg), $matches) === false) {
                        throw new PrettyException("Unable to determined duration of source URL #${ordinal}");
                    }
                    $duration = parse_duration($matches[1]);
                    $data['duration'] = $duration;
                }
            }

            $data['sources'][] = [
                'url' => $url,
                'contentType' => 'video/mp4',
                'quality' => intval($_POST['qualities'][$i]),
            ];
        }
    }
    if ($data['duration'] === 0) {
        throw new PrettyException("Unable to determine the duration of the video! If the given URLs are not yet available, you have to specify the duration manually.");
    }
    return json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR);
}

function retain_value($name, $subkey = null, $attr = 'value') {
    if (array_key_exists($name, $_POST)) {
        if ($subkey === null) {
            return $attr . '="' . htmlspecialchars($_POST[$name]) . '"';
        }
        if (array_key_exists($subkey, $_POST[$name])) {
            return $attr . '="' . htmlspecialchars($_POST[$name][$subkey]) . '"';
        }
    }
    return '';
}

$manifest = null;
$error = '';
ini_set('html_errors', false);
ob_start();
if (array_key_exists('title', $_POST)) {
    try {
        $manifest = generate_manifest();
    } catch (Exception $ex) {
        $error .= $ex->getMessage();
    }
}
$error .= ob_get_clean();

?><!DOCTYPE html>
<html>
    <head>
        <title>BerryTube Manifests</title>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/5.0.0-alpha3/css/bootstrap.min.css" integrity="sha512-fjZwDJx4Wj5hoFYRWNETDlD7zty6PA+dUfdRYxe463OBATFHyx7jYs2mUK9BZ2WfHQAoOvKl6oYPCZHd1+t7Qw==" crossorigin="anonymous" />
        <script src="https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/5.0.0-alpha3/js/bootstrap.min.js" integrity="sha512-Qpek3fOFi+uCW8qSf92lltHNMRMHmLISYDIRFI4qgNV2U28+4Zc3EZC8szMMeVI9KA3zEZFtIP8gt41Pekd29w==" crossorigin="anonymous" defer></script>
    </head>
    <body>
        <div class="container">
            <h3>BerryTube Manifests</h3>
            <p>
                Videos can be queued using a manifest file, which describes multiple possible sources for a video. This can be used to provide video quality options that each user can choose from.
            </p>
            <p>
                For now, <strong>only mp4</strong> files are supported as sources. The manifest URL must have the file extension <code>.json</code> to be queueable.
            </p>
            <p>
                <a data-toggle="collapse" href="#example">File format information</a>
                <pre id="example" class="collapse"><code>{
    "title": "Video Title",
    "duration": 420,  // seconds
    "sources": [
        {
            "url": "https://example.com/video.1080p.mp4",
            "contentType": "video/mp4",
            "quality": 1080
        },
        {
            "url": "https://example.com/video.720p.mp4",
            "contentType": "video/mp4",
            "quality": 720
        },
        ...
    ]
}</code></pre>
            </p>

            <h4>Generator</h4>
            <?php if ($error) { ?>
                <div class="alert alert-danger"><?= htmlspecialchars($error instanceof PrettyException ? $error->getMessage() : $error) ?></div>
            <?php } ?>
            <form method="POST">
                <div class="row mb-3">
                    <div class="col-sm-9">
                        <label for="title" class="form-label">Video title</label>
                        <input type="text" class="form-control" name="title" required minlength="1" <?= retain_value('title') ?> />
                    </div>
                    <div class="col-sm-3">
                        <label for="duration" class="form-label">Duration (<code>hh:mm:ss</code>)</label>
                        <input type="text" class="form-control" name="duration" placeholder="autodetect" pattern="^((\d+:)?(\d+:)?\d+|autodetect)$" <?= retain_value('duration') ?> />
                    </div>
                </div>
                <div class="row">
                    <div class="col-sm-9">
                        <label class="form-label">Source URL</label>
                    </div>
                    <div class="col-sm-3">
                        <label class="form-label">Resolution (e.g. <code>1080</code> or <code>720</code>)</label>
                    </div>
                </div>
                <?php for ($i = 0; $i < MAX_SOURCES; ++$i) { ?>
                    <div class="row mb-3">
                        <div class="col-sm-9">
                            <input type="url" class="form-control" name="urls[]" <?= $i==0 ? 'required' : '' ?> <?= retain_value('urls', $i) ?> />
                        </div>
                        <div class="col-sm-3">
                            <input type="number" class="form-control" name="qualities[]" <?= $i==0 ? 'required' : '' ?> min="1" <?= retain_value('qualities', $i) ?> />
                        </div>
                    </div>
                <?php } ?>
                
                <div>
                    <input type="checkbox" name="skipchecks" <?= retain_value('skipchecks', null, 'checked') ?> />
                    <label for="skipchecks">Skip validity checks</label>
                </div>

                <button type="submit" class="btn btn-primary">Generate</button>

                <?php if ($manifest) { ?>
                    <h5 class="mt-4">
                        manifest.json
                        (<a href="data:application/json;charset=utf-8,<?= rawurlencode($manifest) ?>" download="manifest.json">download</a>)
                    </h5>
                    <p>
                        <pre><code><?= htmlspecialchars($manifest) ?></code></pre>
                    </p>
                <?php } ?>
            </form>
        </div>
    </body>
</html>
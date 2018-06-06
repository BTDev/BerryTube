// Load a small <style> tag for the toast message div, if it hasn't been loaded yet
if ($('#toastMessageStyling').length == 0) {
	var cssBody = 
		'#floatingToastDiv { background-color: #222222; color: #D3D3D3; border: 1px #D3D3D3 solid; padding: 5px; font-size: 10px; position: fixed; top: 40%; left: 50%; margin-left: -100px; width: 200px; z-index: 1000; } ' +
		'#floatingToastDiv .header { font-size: 11px; text-decoration: underline; text-align: center; width: inherit; margin-bottom: 5px; } ' +
		'#floatingToastDiv .row { overflow: hidden; white-space: nowrap; text-overflow: ellipsis; margin-top: 1px; margin-bottom: 1px; } ' +
		'#floatingToastDiv .msg { text-align: center; margin-top: 1px; margin-bottom: 1px; }';

	$('head').append(
		$('<style/>')
			.attr('id', 'toastMessageStyling')
			.attr('type', 'text/css')
			.append(cssBody)
		);
}

/**
 * Logs the given message with console.log(), prepended with a timestamp.
 *
 * @param {String} message  The message to log.
 */
var loggingEnabled = getStoredBoolean('loggingEnabled', false);
function log(message) {
	if (loggingEnabled) {
		var now = new Date();
		var timestamp = '[' + padTime(now.getHours()) + ":" + padTime(now.getMinutes()) + ":" + padTime(now.getSeconds()) + '] ';
		console.log(timestamp + message);
	}
}

/**
 * Pads the given time part with a 0 if needed, returning a 2-character string
 * representation of it.
 *
 * @param {int} number  The time part to pad.
 */
function padTime(number) {
	return (number < 10 ? '0' : '') + number;
}

/**
 * Retrieves an int from local storage. If the value doesn't exist or isn't a valid
 * int, the default value will be returned instead.
 *
 * @param {String} key    The key name for the int to retrieve.
 * @param {int} defValue  The default value to return in the event of failure.
 *
 * @return {int}		  The stored value if it exists, the default value otherwise.
 */
function getStoredInt(key, defValue) {
	var value = parseInt(localStorage.getItem(key));
	if (value) {
		return value;
	}
	else {
		return defValue;
	}
}

/**
 * Retrieves a boolean from local storage. If the value doesn't exist or isn't a valid
 * boolean, the default value will be returned instead.
 *
 * @param {String} key        The key name for the boolean to retrieve.
 * @param {boolean} defValue  The default value to return in the event of failure.
 *
 * @return {boolean}		  The stored value if it exists, the default value otherwise.
 */
function getStoredBoolean(key, defValue) {
	var value = localStorage.getItem(key);
	if (value == 'true') {
		return true;
	}
	else if (value == 'false') {
		return false;
	}
	else {
		return defValue;
	}
}

/**
 * Retrieves a String from local storage. If the value doesn't exist or isn't a valid
 * String, the default value will be returned instead.
 *
 * @param {String} key        The key name for the String to retrieve.
 * @param {String} defValue	  The default value to return in the event of failure.
 *
 * @return {boolean}		  The stored value if it exists, the default value otherwise.
 */
function getStoredString(key, defValue) {
	var value = localStorage.getItem(key);
	if (value) {
		return value;
	}
	else {
		return defValue;
	}
}

/**
 * Stores the given value in local storage. The value can be of any datatype - this
 * function will automatically convert it to a String before storage.
 *
 * @param {String} key	  The key name for the value to store.
 * @param {Object} value  The value to store.
 */
function setStoredValue(key, value) {
	localStorage.setItem(key, '' + value);
}

/**
 * Shows a simple toast message with the specified text centered in the toast div.
 *
 * @param {String} text		   The text to display.
 * @param {int} fadeLength	   The length in milliseconds for the fade in and out to take.
 * @param {int} displayLength  The length in milliseconds to display the message for.
 */
function showSimpleToastMessage(text, fadeLength, displayLength) {
	showToastMessage('<div class="msg">' + text + '</div>', fadeLength, displayLength);
}

/**
 * Shows a table-style toast message with the specified header text and each row added below it.
 *
 * @param {String} header	   The text to display as the header.
 * @param {String[]} rows	   The rows to display in the table.
 * @param {int} fadeLength	   The length in milliseconds for the fade in and out to take.
 * @param {int} displayLength  The length in milliseconds to display the message for.
 */
function showTableToastMessage(header, rows, fadeLength, displayLength) {
	var text = '<div class="header">' + header + '</div>';
	for (var i = 0; i < rows.length; i++) {
		text += '<div class="row">' + rows[i] + '</div>';
	}
	showToastMessage(text, fadeLength, displayLength);
}

var fadeCycleRunning = false;
function showToastMessage(body, fadeLength, displayLength) {
	if (!fadeCycleRunning) {
		log('Beginning fade cycle');
		fadeCycleRunning = true;
		var div = $('<div/>')
			.attr('id', 'floatingToastDiv')
			.css('opacity', '0.0')
			.css('filter', 'alpha(opacity=0)')
			.html(body);
		$('body').append(div);
        div.fadeTo(fadeLength, 1, 'linear', function() {
            setTimeout(function() {
                $('#floatingToastDiv').fadeTo(fadeLength, 0, 'linear', removeToastMessage);
            }, displayLength);
        });
	}
}

function removeToastMessage() {
	if (fadeCycleRunning) {
		document.body.removeChild(document.getElementById('floatingToastDiv'));
		fadeCycleRunning = false;
	}
}

/* SLIDE ANIMATION FUNCTIONS */
function slideIn(elementId, property, fixed, startValue, endValue, interval, onComplete) {
	setSlidePosition(elementId, property, fixed, startValue);
	if (startValue < endValue) {
		setTimeout(function() { slideIn(elementId, property, fixed, startValue + 1, endValue, interval, onComplete); }, interval);
	}
	else {
		if (onComplete != undefined) {
			onComplete();
		}
	}
}

function slideOut(elementId, property, fixed, startValue, endValue, interval, onComplete) {
	setSlidePosition(elementId, property, fixed, startValue);
	if (startValue > endValue) {
		setTimeout(function() { slideOut(elementId, property, fixed, startValue - 1, endValue, interval, onComplete); }, interval);
	}
	else {
		if (onComplete != undefined) {
			onComplete();
		}
	}
}

function setSlidePosition(elementId, property, fixed, value) {
	var div = document.getElementById(elementId);
	var unit = fixed ? 'px' : '%';
	div.style.setProperty(property, value + unit);
}
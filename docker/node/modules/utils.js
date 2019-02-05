const formatRegex = /\{(\w+)\}/g;

/**
 * @argument {string} format the format string; ex: "this is a constant, this is a {match} and {another}"
 * @argument {(type: "constant" | "match", value: string) => {}} onMatch a function that gets invoked for every {match} or constant expression found
 */
exports.parseFormat = function(format, onMatch) {
    let result = null;
    let lastIndex = 0;
    while (result = formatRegex.exec(format)) {
        const constPart = format.substring(lastIndex, result.index);
        if (constPart.length)
            onMatch("constant", constPart);

        onMatch("match", result[1]);
        lastIndex = result.index + result[0].length;
    }

    if (lastIndex < format.length - 1)
        onMatch("constant", format.substring(lastIndex))
}
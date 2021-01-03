export const LogLevel = Object.freeze({
    DEBUG: "DEBUG",
    INFO: "INFO",
    WARNING: "WARNING",
    ERROR: "ERROR",
    CRITICAL: "CRITICAL",
});

export function logService(level, message, source = "APP", production = false) {
    // Use synthetic Error object to retrieve stacktrace data
    let stack = new Error().stack;
    let fileTokens = stack.split("\n")[2].split("\\");
    let trace = "unknown";
    try {
        trace = fileTokens[fileTokens.length - 1].substring(
            0,
            fileTokens[fileTokens.length - 1].length - 2
        );
    } catch (err) {}

    let log = `${new Date().toLocaleTimeString()} (${level}) - ${source}: ${message}`;

    switch (level) {
        case LogLevel.DEBUG:
            console.debug(log);
            break;
        case LogLevel.INFO:
            console.log(log);
            break;
        case LogLevel.WARNING:
            console.warn(log);
            break;
        case LogLevel.ERROR:
            console.error(log);
            break;
        case LogLevel.CRITICAL:
            console.error(log);
            break;
    }
}

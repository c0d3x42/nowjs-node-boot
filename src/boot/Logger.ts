import * as paths from "path";
import * as winston from "winston";

let launcherLogger: winston.LoggerInstance;

export function getLauncherLogger() {

    if (launcherLogger) { return launcherLogger; }
    const logDirPath = paths.join(process.cwd(), "logs");
    const env = process.env.NODE_ENV || "development";
    const tsFormat = () => `${(new Date()).toISOString()} , ${process.pid}`;
    const colors = {
        silly: "magenta",
        verbose: "cyan",
        // tslint:disable-next-line:object-literal-sort-keys
        debug: "blue",
        error: "red",
        data: "grey",
        warn: "yellow",
        info: "green",
    };
    launcherLogger = winston.loggers.add("LAUNCHER", {
        transports: [
            // colorize the output to the console
            new (winston.transports.Console)({
                prettyPrint: true,
                // tslint:disable-next-line:object-literal-sort-keys
                colorize: true,
                level: "silly",
                timestamp: tsFormat,
            }),
            new (require("winston-daily-rotate-file"))({
                colorize: false,
                datePattern: "yyyy-MM-dd",
                filename: paths.join(logDirPath, `-launcher.log`),
                handleExceptions: true,
                json: true,
                level: env === "development" ? "verbose" : "info",
                maxFiles: 5,
                maxsize: 5242880, // 5MB
                prepend: true,
                timestamp: tsFormat,

            }),
        ],
    });
    return launcherLogger;
}

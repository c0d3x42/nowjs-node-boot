import * as fs from "fs";
import * as path from "path";
import * as pino from "pino";
// tslint:disable-next-line:no-var-requires
const multistream = require("pino-multi-stream").multistream;
const cwd = process.cwd();
const LOCAL_LOG_FILE = "boot";
let launcherLogger: pino.BaseLogger;

export function getLauncherLogger() {

    if (launcherLogger) { return launcherLogger; }
    const logDirPath = path.join(cwd, "logs");
    const env = process.env.NODE_ENV || "development";
    const fileOptions = { flags: "a", defaultEncoding : "utf8" };
    const prettyConsole = pino.pretty();
    prettyConsole.pipe(process.stdout);
    if (!fs.existsSync(logDirPath)) {
        fs.mkdirSync(logDirPath);
    }
    this.generalFileStream = fs.createWriteStream(path.join(logDirPath, `${LOCAL_LOG_FILE}.log`), fileOptions);
    const streams = [
        {
            level: "trace",
            stream: prettyConsole,
        },
        {
            level: "trace",
            stream: this.generalFileStream,
        },
    ];
    launcherLogger = pino({level: "debug"}, multistream(streams));
    return launcherLogger;
}

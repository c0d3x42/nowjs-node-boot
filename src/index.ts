// tslint:disable-next-line:ordered-imports
import "reflect-metadata";
import { exceptions } from "nowjs-core";
import * as os from "os";

import { ArgumentException, CodedException } from "nowjs-core/lib/exceptions";
import { BootOptions, getLauncherLogger } from "./boot/index";
import { ENV_DEVELOPMENT_TOKEN } from "./common/index";

// tslint:disable-next-line:interface-name
/**
 * The nowjs application bootloader.
 * @example node launch --app myapp --worker-limit 2 --log-level debug --mode distributed .
 * @export
 * @param {BootOptions} options
 */
export function boot(options: BootOptions) {
    const logger = getLauncherLogger();
    logger.info("Nowjs launcher starting ...");
    try {
        const envAppName = process.env.NOWJS_APP_NAME ;
        const envAppMode = process.env.NOWJS_APP_MODE ;
        const envWorkerLimit = process.env.NOWJS_APP_WORKERLIMIT ;
        const envLogLevel = process.env.NOWJS_APP_LOGLEVEL;
        if (envAppName || (process.argv.indexOf("--app") >= 0 && process.argv.length > 1)) {
            const defaultLevel = process.env.NODE_ENV === ENV_DEVELOPMENT_TOKEN ? "debug" : "info";
            const defaultWorkerLimit = process.env.NODE_ENV === ENV_DEVELOPMENT_TOKEN ? 1 : os.cpus().length;
            const defaultMode = "standalone";
            const appName = envAppName || process.argv[process.argv.indexOf("--app") + 1];
            // tslint:disable-next-line:radix
            const workerLimit =  envWorkerLimit ? parseInt(envWorkerLimit) :
                      process.argv.indexOf("--worker-limit") >= 0 ?
                // tslint:disable-next-line:radix
                parseInt(process.argv[process.argv.indexOf("--worker-limit") + 1]) :
                defaultWorkerLimit;
            const logLevel = envLogLevel || process.argv.indexOf("--log-level") >= 0 ?
                process.argv[process.argv.indexOf("--log-level") + 1] : defaultLevel;
            const mode =  envAppMode || process.argv.indexOf("--mode") >= 0 ?
                process.argv[process.argv.indexOf("--mode") + 1] : defaultMode;
            options = Object.assign(options, {
                AppName: appName.toLocaleLowerCase(),
                LogLevel: logLevel.toLowerCase(),
                Mode: mode.toLowerCase(),
                WorkerLimit: workerLimit,

            }) ;
            const bootstrap = require("./boot/Bootstrap");
            if (bootstrap) {
                // now boot application
                bootstrap.boot(options);
            } else {
                throw new CodedException(-1101, "The kernel bootstrap not loaded.");
            }

        } else {
            throw new ArgumentException(
                "The argument(s) type or value mismatched . please see the with '--help' options ");
        }

    } catch (error) {
        // tslint:disable-next-line:no-console
        logger.error(error.toString());
        // tslint:disable-next-line:no-console
       // logger.warn(`Exiting application launcher normally by code "{${2}}".`);
        throw error;
        // tslint:disable-next-line:no-empty
    } finally {

    }
}

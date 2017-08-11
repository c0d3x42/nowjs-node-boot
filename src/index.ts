// tslint:disable-next-line:ordered-imports
import "reflect-metadata";
import { exceptions } from "nowjs-core";
import * as os from "os";

import { IApplicationService } from "nowjs-core/lib/core";
import { ArgumentException, CodedException } from "nowjs-core/lib/exceptions";
import { BootOptions, getLauncherLogger } from "./boot/index";
import { ENV_DEVELOPMENT_TOKEN } from "./common/index";

/**
 * The nowjs application bootloader.
 * @example node launch  --worker-limit 2 --log-level debug --mode distributed .
 * @export
 * @param {BootOptions} options
 */
export function boot(application: IApplicationService , options: BootOptions) {
    const logger = getLauncherLogger();
    logger.info("Nowjs launcher starting ...");
    try {
        const envAppMode = process.env.NOWJS_APP_MODE;
        const envWorkerLimit = process.env.NOWJS_APP_WORKERLIMIT;
        const envLogLevel = process.env.NOWJS_APP_LOGLEVEL;
        const defaultLevel = process.env.NODE_ENV === ENV_DEVELOPMENT_TOKEN ? "debug" : "info";
        const defaultWorkerLimit = process.env.NODE_ENV === ENV_DEVELOPMENT_TOKEN ? 1 : os.cpus().length;
        const defaultMode = "standalone";
        // tslint:disable-next-line:radix
        const workerLimit = envWorkerLimit ? parseInt(envWorkerLimit) :
            process.argv.indexOf("--worker-limit") >= 0 ?
                // tslint:disable-next-line:radix
                parseInt(process.argv[process.argv.indexOf("--worker-limit") + 1]) :
                defaultWorkerLimit;
        const logLevel = envLogLevel || process.argv.indexOf("--log-level") >= 0 ?
            process.argv[process.argv.indexOf("--log-level") + 1] : defaultLevel;
        const mode = envAppMode || process.argv.indexOf("--mode") >= 0 ?
            process.argv[process.argv.indexOf("--mode") + 1] : defaultMode;
        options = Object.assign(options, {
            LogLevel: logLevel.toLowerCase(),
            Mode: mode.toLowerCase(),
            WorkerLimit: workerLimit,

        });
        const bootstrap = require("./boot/Bootstrap");
        if (bootstrap) {
            // now boot application
            bootstrap.boot(application, options);
        } else {
            throw new CodedException(-1101, "The kernel bootstrap not loaded.");
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

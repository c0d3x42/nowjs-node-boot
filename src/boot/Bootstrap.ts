
import "reflect-metadata";

import { Container, ContainerModule, interfaces } from "inversify";

import * as cluster from "cluster";
import * as colors from "colors";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";

import {  exceptions } from "nowjs-core";
import { CodedException } from "nowjs-core/lib/exceptions";
import { ENV_DEVELOPMENT_TOKEN, TYPES } from "../common/index";
import { BootOptions } from "./BootOptions";
import { getLauncherLogger } from "./Logger";

const mlogger = getLauncherLogger();

const kernel: Container = new Container();

const BASE_MODULES_DIR = "modules";
const kernelModules = ["core"];
const startupModules = ["core"];
const loadedModules: ContainerModule[] = [];

function loadModules(options: BootOptions) {
    // tslint:disable-next-line:no-console
    mlogger.info(`Module loading started.`);

    for (const name of startupModules) {
        try {
            // tslint:disable-next-line:no-console
            mlogger.info(`Module "${name}" loading ...`);
            const modulePath = path.join(options.Paths.Modules, name, "Bootstrap");
            const subModules = require(`./${modulePath}`);
            // tslint:disable-next-line:forin
            for (const subModuleName in subModules) {
                const subModule = require(`./${modulePath}`)[subModuleName];
                kernel.load(subModule);
                loadedModules.push(subModule);
                // tslint:disable-next-line:no-console
                mlogger.info(`Module "${name}" loaded.`);
            }

        } catch (error) {
            // tslint:disable-next-line:no-console
            mlogger.error(`Module "${name}" loading failed. \n Error: ${error} .`, error);
        }

    }
    // tslint:disable-next-line:no-console
    mlogger.info(`Module loading finished.`);
}

function unloadModules(options: BootOptions) {
    // tslint:disable-next-line:no-console
    mlogger.info(`Module unloading started.`);

    for (const module of loadedModules) {
        try {
            // tslint:disable-next-line:no-console
            mlogger.info(`Module "${name}" unloading ...`);
            kernel.unload(module);
            // tslint:disable-next-line:no-console
            mlogger.info(`Module "${name}" unloaded.`);
        } catch (error) {
            // tslint:disable-next-line:no-console
            mlogger.error(`Module "${name}" unloading failed. \n Error: ${error} .`, error);
        }

    }

    // tslint:disable-next-line:no-console
    mlogger.info(`Module unloading finished.`);
}

async function startUpWorker(options: BootOptions) {

    if (cluster.isWorker) {

        kernel.bind<Container>(TYPES.Kernel).toConstantValue(kernel);

    }
    if (cluster.isWorker || process.env.NODE_ENV === ENV_DEVELOPMENT_TOKEN) {
        // let appName = process.env.appName;
        const appName = options.AppName;

        const appPath = path.join(options.Paths.Apps, `${appName.toLowerCase() + ".app"}`);
        const appBootPath = path.join(options.Paths.Apps, `${appName.toLowerCase() + ".app"}`, "Bootstrap");
        try {
            mlogger.info(`Application '${appName
                }' in process id:${process.pid} loading.`, appName);
            const appModule = require(appBootPath);
            // load module to kernel
            kernel.load(appModule.subModule);
            // startup application module
            await appModule.startup(kernel, options);
            mlogger.info(`Application '${appName
                }' in process id:${process.pid} loaded.`, appName);
        } catch (error) {
            mlogger.error(`Application '${appName
                }' in process id:${process.pid} load failed.`, appName);
            mlogger.error( error.toString());
            process.exit(2);
        }

    }
}

function startUp(options: BootOptions) {

    if (process.env.NODE_ENV === ENV_DEVELOPMENT_TOKEN) {
        startUpWorker(options);
    } else {

        if (cluster.isMaster) {

            for (let i = 0; i < Math.min(os.cpus().length, options.WorkerLimit); i++) {
                const worker = cluster.fork(process.env);

                // tslint:disable-next-line:no-empty
                worker.on("disconnect", () => {

                });
                // tslint:disable-next-line:no-empty
                worker.on("online", () => {

                });
                // tslint:disable-next-line:no-empty
                worker.on("error", (code, signal) => {

                });
                // tslint:disable-next-line:no-empty
                worker.on("exit", (code, signal) => {

                });
            }

            cluster.on("exit", (worker, code, signal) => {
                // tslint:disable-next-line:no-console
                mlogger.info(`worker ${worker.process.pid} died.`);
            });
        } else {
            if (process.env.NODE_ENV !== ENV_DEVELOPMENT_TOKEN) {
                startUpWorker(options);
            }
        }
    }

}

function shutdown(options: BootOptions) {
    // Loading sub modules here .
    unloadModules(options);
}

export function boot(options: BootOptions) {
    if (!options) {
        throw new CodedException(-1104, "App options can not be null.");
    }
    if (!options.AppName) {
        throw new CodedException(-1103, "App name can not be empty or null.");
    }
    const appName = options.AppName;

    let banner = `\n\nThe '${colors.yellow(appName)}' application is ${colors.bold("loading")} in pid: ${process.pid}.`;
    banner += `\n\t\t${colors.green("************************************************************************")}`;
    banner += `\n\t\t\t\t ${colors.bold(colors.yellow("Now Boot loader v1.2"))
        + "\t" + colors.green("pid:" + process.pid)}`;
    banner += `\n\t\t\t\t\t ${colors.bold(colors.red("www.NowCanDo.com"))}`;
    banner += `\n\t\t${colors.green("************************************************************************")}`;
    banner += `\nThe '${colors.yellow(appName)
        }' application environment has been set to ${colors.blue("Mode")
        }='${options.Mode}' , ${colors.blue("ClusterMode")
        }='${cluster.isMaster ? "Master" : "Worker"}' ,  ${colors.blue("RunningMode")
        }='${process.env.NODE_ENV === ENV_DEVELOPMENT_TOKEN ? "Development" : "Production"
        }' ,  ${colors.blue("WorkerLimit")}='${options.WorkerLimit
        }' , ${colors.blue("LogLevel")}='${options.LogLevel}' .`;
    banner += `\nThe ${colors.magenta("System")
        } environment is ${colors.blue("Os")}='${os.platform()
        } / ${os.type()} / ${os.arch()} / ${os.release()
        }' ,  ${colors.blue("OsUpTime")}='${os.uptime()
        }' ,  ${colors.blue("HostName")}='${os.hostname
        }' , ${colors.blue("Cpu")}='${os.cpus().length
        } / ${os.cpus()[0].model} / ${os.cpus()[0].speed
        }' ,  ${colors.blue("Memory")}='${Math.ceil(os.totalmem() / (1024 * 1024))
        } MB / ${Math.ceil(os.freemem() / (1024 * 1024))
        } MB'  , ${colors.blue("LoadAverage")}='${os.loadavg()}'`;
    banner += `, ${colors.magenta("Nodejs")}='${process.version}'  , ${colors.blue("Cwd")}='${process.cwd()}' .`;
    banner += `\n\n`;

    const appPath = path.join(__dirname, "../apps/", `${appName.toLowerCase() + ".app"}`);
    const appBootPath = path.join(__dirname, "../apps/", `${appName.toLowerCase() + ".app"}`, "Bootstrap");
    kernel.bind<Container>(TYPES.Kernel).toConstantValue(kernel);

    process.on("unhandledRejection", (err: Error, p: any) => {
        mlogger.error(`There is a unhandeled promise rejection :\n${err.message}`, err, p);
        process.exit(2);
    });
    process.on("uncaughtException", (err: Error) => {
        mlogger.error(`There is a unhandeled error :\n${err.message}`, err);
        process.exit(2);
    });

    try {
        if (fs.existsSync(appPath) && (fs.existsSync(appBootPath + ".ts") || fs.existsSync(appBootPath + ".js"))) {
            mlogger.info( banner);
            startUp(options);

        } else {
            throw new CodedException(-1203, `There is no app with '${appName}' in apps directory.`);
        }
    } catch (error) {
        throw error;
    }

}

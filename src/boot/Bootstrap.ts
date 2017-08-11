
import "reflect-metadata";

import { Container, ContainerModule, interfaces } from "inversify";

import * as cluster from "cluster";
import * as colors from "colors";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";

import {  exceptions } from "nowjs-core";
import { IApplicationService } from "nowjs-core/lib/core";
import { CodedException } from "nowjs-core/lib/exceptions";
import { ENV_DEVELOPMENT_TOKEN, TYPES } from "../common/index";
import { BootOptions } from "./BootOptions";
import { getLauncherLogger } from "./Logger";

const mlogger = getLauncherLogger();

const kernel: Container = new Container();

export function getKernel(): Container {
    return kernel;
}

function startUpWorker(application: IApplicationService , options: BootOptions) {

    if (cluster.isWorker || process.env.NODE_ENV === ENV_DEVELOPMENT_TOKEN) {
        // let appName = process.env.appName;
        const appName = options.AppName;
        application.start();

    }
}

function startUp(application: IApplicationService , options: BootOptions) {
    kernel.bind<Container>(TYPES.Kernel).toConstantValue(kernel);
    if (process.env.NODE_ENV === ENV_DEVELOPMENT_TOKEN) {
        startUpWorker(application, options);
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
                mlogger.error(`worker ${worker.process.pid} died.`, code, signal);
            });
        } else {
            if (process.env.NODE_ENV !== ENV_DEVELOPMENT_TOKEN) {
                startUpWorker(application, options);
            }
        }
    }

}

export function boot(application: IApplicationService , options: BootOptions) {
    if (!options) {
        throw new CodedException(-1104, "App options can not be null.");
    }
    const appName = options.AppName || process.env.npm_package_name;
    const appVersion =  process.env.npm_package_version;

    let banner = `\n\nThe '${colors.yellow(appName)}' application is ${colors.bold("loading")} in pid: ${process.pid}.`;
    banner += `\n\t\t${colors.green("************************************************************************")}`;
    banner += `\n\t\t\t\t ${colors.bold(colors.yellow("Nowjs Boot loader v1.4.0"))
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

    process.on("unhandledRejection", (err: Error, p: any) => {
        mlogger.error(`There is a unhandeled promise rejection :\n${err.message}`, err, p);
        process.exit(2);
    });
    process.on("uncaughtException", (err: Error) => {
        mlogger.error(`There is a unhandeled error :\n${err.message}`, err);
        process.exit(2);
    });

    try {
        mlogger.info( banner);
        startUp(application, options);
    } catch (error) {
        throw error;
    }

}

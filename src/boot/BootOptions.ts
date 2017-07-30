
// tslint:disable-next-line:interface-name
export interface BootOptions {
    AppName?: string;
    Paths: {
        Configuration: string;
        Logging: string;
        Apps: string;
        Modules: string;
    };
    WorkerLimit?: number;
    Mode?: string;
    LogLevel?: string;
}

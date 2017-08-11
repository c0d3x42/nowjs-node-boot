import "jest";
import { IApplicationService, IApplicationServiceStatus, ServiceStatus } from "nowjs-core/lib/core";
import * as path from "path";
import { BootOptions } from "../src/boot/index";
import { ENV_DEVELOPMENT_TOKEN } from "../src/common/index";
import { boot } from "../src/index";

class SampleApplication implements IApplicationService {
    // tslint:disable-next-line:no-empty
    private  mstatus = {Status: ServiceStatus.Stopped, Timestamp: new Date()};
    // tslint:disable-next-line:no-empty
    constructor(options?: any) {

    }
    public async start(): Promise<IApplicationServiceStatus> {
        this.mstatus.Status = ServiceStatus.Running;
        return Promise.resolve(this.mstatus);
    }
    public async stop(): Promise<IApplicationServiceStatus> {
        throw new Error("Method not implemented.");
    }
    public async restart(): Promise<IApplicationServiceStatus> {
        throw new Error("Method not implemented.");
    }
    public async status(): Promise<IApplicationServiceStatus> {
        return Promise.resolve(this.mstatus);
    }
    public async pause(): Promise<IApplicationServiceStatus> {
        throw new Error("Method not implemented.");
    }
    public async resume(): Promise<IApplicationServiceStatus> {
        throw new Error("Method not implemented.");
    }
    public get Name(): string {
        return "SampleApp";
    }

}

// jest.resetAllMocks();
// jasmine.DEFAULT_TIMEOUT_INTERVAL = 60000;

// tslint:disable:no-empty
beforeAll(() => { });

beforeEach(() => {

});

afterAll(() => { });

afterEach(() => { });

describe("Test application boot loader", async () => {

    it("checks application boot function", async () => {
        expect.assertions(1);
        process.env.NOWJS_APP_NAME = "testapp";
        const application = new SampleApplication();
        const bootOptions = {};
        process.env.NODE_ENV = ENV_DEVELOPMENT_TOKEN;
        // boot the applications .:
        try {
             boot(application, bootOptions);
             const actual = await application.status();
             expect(actual.Status).toEqual(ServiceStatus.Running);
        } catch (error) {
             expect(error).not.toEqual(null);
        } finally {

        }
    });

});

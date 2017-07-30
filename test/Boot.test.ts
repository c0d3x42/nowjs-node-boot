import "jest";
import * as path from "path";
import { BootOptions } from "../src/boot/index";
import { boot } from "../src/index";

// jest.resetAllMocks();
// jasmine.DEFAULT_TIMEOUT_INTERVAL = 60000;

// tslint:disable:no-empty
beforeAll(() => { });

beforeEach(() => {

});

afterAll(() => { });

afterEach(() => { });

describe("Test application boot loader", async () => {
    const bootOptions: BootOptions = {
        Paths: {
            Apps: path.join(process.cwd(), "apps"),
            Configuration: path.join(process.cwd(), "config"),
            Logging: path.join(process.cwd(), "logs"),
            Modules: path.join(process.cwd(), "modules"),
        },
    };

    it("checks application boot function", async () => {
        expect.assertions(1);
        process.env.NOWJS_APP_NAME = "testapp";
        // boot the applications .
        try {
             boot(bootOptions);
        } catch (error) {
             expect(error).not.toEqual(null);
        } finally {

        }
    });

});

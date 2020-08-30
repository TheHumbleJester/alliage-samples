import axios from "axios";
import getPort from "get-port";

import { Sandbox } from "alliage-sandbox";
import { ChildProcess } from "child_process";

describe("Main scenario", () => {
  const sandbox = new Sandbox({
    scenarioPath: __dirname,
  });

  let webserverPort: number;
  let childProcess: ChildProcess;

  beforeAll(async () => {
    await sandbox.init();

    // Building the app
    await sandbox
      .build(["--env=development", "--use-typescript"])
      .waitCompletion();

    // Getting random port for webserver
    webserverPort = await getPort();

    // Starting the server
    ({ process: childProcess } = sandbox.run(["main"], {
      env: {
        WEBSERVER_PORT: webserverPort.toString(),
      },
    }));

    // Waiting for server to be started
    await new Promise((resolve) =>
      childProcess.stdout!.on("data", (data) => {
        if (data === `Listening on: ${webserverPort}\n`) {
          resolve();
        }
      })
    );
  }, 10000);

  afterAll(async () => {
    childProcess.kill("SIGINT");
    await sandbox.clear();
  });

  describe("GET /", () => {
    it('should respond "Hello world" !', async () => {
      const res = await axios.get(`http://localhost:${webserverPort}`);

      expect(res.status).toEqual(200);
      expect(res.data).toEqual("Hello world !");
    });
  });
});

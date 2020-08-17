import { ChildProcess } from "child_process";
import express, { Request, Response } from "express";
import { Server } from "http";
import axios from "axios";
import getPort from "get-port";

import { Sandbox } from "alliage-sandbox";

describe("Main scenario", () => {
  const sandbox = new Sandbox({
    scenarioPath: __dirname,
  });

  let webserverPort: number;
  let countryApiPort: number;
  let wikipediaApiPort: number;

  let childProcess: ChildProcess;

  beforeAll(async () => {
    await sandbox.init();

    // Building the app
    await sandbox
      .build(["--env=development", "--use-typescript"])
      .waitCompletion();

    // Getting random port for webserver
    webserverPort = await getPort();
    countryApiPort = await getPort();
    wikipediaApiPort = await getPort();

    // Starting the server
    ({ process: childProcess } = sandbox.run(["main"], {
      env: {
        WEBSERVER_PORT: webserverPort.toString(),
        COUNTRY_API_URL: `http://localhost:${countryApiPort}`,
        COUNTRY_API_KEY: "country_api_key",
        WIKIPEDIA_API_URL: `http://localhost:${wikipediaApiPort}`,
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

  describe("GET /countries", () => {
    it("should return the list of countries", async () => {
      const countryApiMock = express();
      let request: Request;
      countryApiMock.get("/country/all", (req: Request, res: Response) => {
        request = req;

        res.status(200).json([
          { name: "France", countryCode: "FR" },
          { name: "Germany", countryCode: "DE" },
          { name: "Italy", countryCode: "IT" },
        ]);
      });

      const server = await new Promise<Server>((resolve) => {
        const server = countryApiMock.listen(countryApiPort, () =>
          resolve(server)
        );
      });

      const res = await axios.get(
        `http://localhost:${webserverPort}/countries`
      );

      expect(request!).toBeDefined();
      expect(request!.query.key).toEqual("country_api_key");
      expect(res.status).toEqual(200);
      expect(res.data).toEqual([
        { name: "France", countryCode: "FR" },
        { name: "Germany", countryCode: "DE" },
        { name: "Italy", countryCode: "IT" },
      ]);

      server.close();
    });
  });

  describe("GET /countries/:countryCode", () => {
    it("should return the list of countries", async () => {
      const countryApiMock = express();
      let countryRequest: Request;
      countryApiMock.get("/country/code/fr", (req: Request, res: Response) => {
        countryRequest = req;

        res.status(200).json([{ name: "France", countryCode: "FR" }]);
      });

      const wikipediaApiMock = express();
      let wikipediaRequest: Request;
      wikipediaApiMock.get(
        "/rest_v1/page/summary/France",
        (req: Request, res: Response) => {
          wikipediaRequest = req;

          res.status(200).json({ extract: "france description" });
        }
      );

      const [countryApiServer, wikipediaApiServer] = await Promise.all([
        new Promise<Server>((resolve) => {
          const server = countryApiMock.listen(countryApiPort, () =>
            resolve(server)
          );
        }),
        new Promise<Server>((resolve) => {
          const server = wikipediaApiMock.listen(wikipediaApiPort, () =>
            resolve(server)
          );
        }),
      ]);

      const res = await axios.get(
        `http://localhost:${webserverPort}/countries/fr`
      );

      expect(countryRequest!).toBeDefined();
      expect(countryRequest!.query.key).toEqual("country_api_key");

      expect(wikipediaRequest!).toBeDefined();
      expect(res.status).toEqual(200);
      expect(res.data).toEqual({
        name: "France",
        countryCode: "FR",
        description: "france description",
      });

      countryApiServer.close();
      wikipediaApiServer.close();
    });
  });
});

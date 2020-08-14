import express, { Request, Response } from "express";

import { AbstractProcess } from "alliage-process-manager/process";
import { Service } from "alliage-service-loader/decorators";
import { parameter } from "alliage-di/dependencies";

@Service("main_process", [parameter("parameters.webserver.port")])
export default class MainProcess extends AbstractProcess {
  private port: number;

  constructor(port: number) {
    super();
    this.port = port;
  }

  getName() {
    return "main";
  }

  async execute() {
    const app = express();

    app.get("/", (_req: Request, res: Response) => {
      res.send("Hello world !");
    });

    app.listen(this.port);

    return await this.waitToBeShutdown();
  }
}

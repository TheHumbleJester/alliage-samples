import express, { Request, Response } from "express";

import { AbstractProcess } from "alliage-process-manager/process";
import { Service } from "alliage-service-loader/decorators";

@Service("main_process")
export default class MainProcess extends AbstractProcess {
  getName() {
    return "main";
  }

  async execute() {
    const app = express();

    app.get("/", (_req: Request, res: Response) => {
      res.send("Hello world !");
    });

    app.listen(8080);

    return await this.waitToBeShutdown();
  }
}

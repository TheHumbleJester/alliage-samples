import express from "express";

import { AbstractProcess } from "alliage-process-manager/process";

import { AbstractController } from "../controllers/abstract-controller";

export class WebProcess extends AbstractProcess {
  private port: number;
  private controllers: AbstractController[];

  constructor(port: number, controllers: AbstractController[]) {
    super();
    this.port = port;
    this.controllers = controllers;
  }

  getName() {
    return "web";
  }

  async execute() {
    const app = express();

    this.controllers.forEach((controller) => {
      controller.registerRoutes().forEach(([method, path, handler]) => {
        (app as any)[method](path, handler);
      });
    });

    app.listen(this.port);

    process.stdout.write(`Listening on: ${this.port}\n`);

    return await this.waitToBeShutdown();
  }
}

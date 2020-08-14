import express from "express";

import { AbstractProcess } from "alliage-process-manager/process";
import { Service } from "alliage-service-loader/decorators";
import {
  parameter,
  allInstancesOf,
  Constructor,
} from "alliage-di/dependencies";

import { AbstractController } from "../controllers/abstract-controller";

@Service("main_process", [
  parameter("parameters.webserver.port"),
  allInstancesOf(AbstractController as Constructor),
])
export default class MainProcess extends AbstractProcess {
  private port: number;
  private controllers: AbstractController[];

  constructor(port: number, controllers: AbstractController[]) {
    super();
    this.port = port;
    this.controllers = controllers;
  }

  getName() {
    return "main";
  }

  async execute() {
    const app = express();

    this.controllers.forEach((controller) => {
      controller.registerRoutes().forEach(([method, path, handler]) => {
        (app as any)[method](path, handler);
      });
    });

    app.listen(this.port);

    return await this.waitToBeShutdown();
  }
}

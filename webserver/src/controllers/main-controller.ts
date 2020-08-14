import { Request, Response } from "express";

import { AbstractController, METHOD, Route } from "./abstract-controller";
import { Service } from "alliage-service-loader/decorators";

@Service('main_controller')
export default class MainController extends AbstractController {
  public registerRoutes(): Route[] {
    return [
      [METHOD.GET, '/', this.handleIndex],
    ];
  }

  private handleIndex = (_req: Request, res: Response) => {
    res.send("Hello world !");
  }
}
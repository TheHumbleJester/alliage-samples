import { Request, Response } from "express";

export enum METHOD {
  GET = 'get',
  POST = 'post',
  PUT = 'put',
  DELETE = 'delete',
  OPTION = 'option',
  HEAD = 'head'
}

export type Route = [METHOD, string, (req: Request, res: Response) => void | Promise<void>];

export abstract class AbstractController {
  public abstract registerRoutes(): Route[];
}
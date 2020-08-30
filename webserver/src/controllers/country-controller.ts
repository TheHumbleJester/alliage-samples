import { Request, Response } from "express";

import { AbstractController, METHOD, Route } from "./abstract-controller";
import { Service } from "alliage-service-loader/decorators";
import { service } from "alliage-di/dependencies";

import CountryService from "../services/country-service";

@Service("country_controller", [service("country_service")])
export default class CountryController extends AbstractController {
  private countryService: CountryService;

  constructor(countryService: CountryService) {
    super();
    this.countryService = countryService;
  }

  public registerRoutes(): Route[] {
    return [
      [METHOD.GET, "/countries", this.handleCountryList]
    ];
  }

  private handleCountryList = async (_req: Request, res: Response) => {
    res.json(await this.countryService.getAllCountries());
  };
}

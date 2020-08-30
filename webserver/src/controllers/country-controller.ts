import { Request, Response } from "express";

import { AbstractController, METHOD, Route } from "./abstract-controller";
import { Service } from "alliage-service-loader/decorators";
import { service } from "alliage-di/dependencies";

import CountryService from "../services/country-service";
import WikipediaService from "../services/wikipedia-service";

@Service("country_controller", [
  service("country_service"),
  service("wikipedia_service"),
])
export default class CountryController extends AbstractController {
  private countryService: CountryService;
  private wikipediaService: WikipediaService;

  constructor(
    countryService: CountryService,
    wikipediaService: WikipediaService
  ) {
    super();
    this.countryService = countryService;
    this.wikipediaService = wikipediaService;
  }

  public registerRoutes(): Route[] {
    return [
      [METHOD.GET, "/countries", this.handleCountryList],
      [METHOD.GET, "/countries/:countryCode", this.handleCountryDetail],
    ];
  }

  private handleCountryList = async (_req: Request, res: Response) => {
    res.json(await this.countryService.getAllCountries());
  };

  private handleCountryDetail = async (req: Request, res: Response) => {
    const countryDetail = await this.countryService.getCountry(
      req.params.countryCode
    );

    if (countryDetail) {
      const countryDescription = await this.wikipediaService.getDescription(
        countryDetail.name
      );
  
      res.json({ ...countryDetail, description: countryDescription });
      return ;
    }
    res.status(404).json({ message: 'Not found.' });
  };
}

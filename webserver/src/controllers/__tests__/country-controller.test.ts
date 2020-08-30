import CountryController from "../country-controller";
import CountryService from "../../services/country-service";
import WikipediaService from "../../services/wikipedia-service";
import { METHOD } from "../abstract-controller";
import { Request, Response } from "express";

describe("controllers/country-controller", () => {
  describe("CountryController", () => {
    const countryService = new CountryService("dummy_url", "dummy_key");
    const wikipediaService = new WikipediaService("dummy_url");
    const controller = new CountryController(countryService, wikipediaService);

    const getAllCountriesSpy = jest.spyOn(countryService, "getAllCountries");
    const getCountrySpy = jest.spyOn(countryService, "getCountry");
    const getDescriptionSpy = jest.spyOn(wikipediaService, "getDescription");

    const routes = controller.registerRoutes();

    afterEach(() => {
      jest.resetAllMocks();
    });

    describe("#registerRoutes", () => {
      it("should register a country list and detail endpoints", () => {
        expect(routes).toEqual([
          [METHOD.GET, "/countries", expect.any(Function)],
          [METHOD.GET, "/countries/:countryCode", expect.any(Function)],
        ]);
      });
    });

    describe("#handleCountryList", () => {
      const handleCountryList = routes[0][2];

      it("should return the list of countries", async () => {
        const reqMock = {} as Request;
        const resMock = ({
          json: jest.fn(),
        } as unknown) as Response;

        getAllCountriesSpy.mockResolvedValueOnce([
          { name: "Afghanistan", code: "af" },
          { name: "Albania", code: "al" },
        ]);

        await handleCountryList(reqMock, resMock);

        expect(resMock.json).toHaveBeenCalledWith([
          { name: "Afghanistan", code: "af" },
          { name: "Albania", code: "al" },
        ]);
      });
    });

    describe("#handleCountryDetail", () => {
      const handleCountryDetail = routes[1][2];

      it("should return the country detail with its description", async () => {
        const reqMock = ({
          params: {
            countryCode: "tv",
          },
        } as unknown) as Request;
        const resMock = ({
          json: jest.fn(),
        } as unknown) as Response;

        getCountrySpy.mockResolvedValueOnce({
          name: "Tuvalu",
          code: "tv",
        });
        getDescriptionSpy.mockResolvedValueOnce("Dummy description");

        const handleCountryDetail = routes[1][2];
        await handleCountryDetail(reqMock, resMock);

        expect(getCountrySpy).toHaveBeenCalledWith("tv");
        expect(getDescriptionSpy).toHaveBeenCalledWith("Tuvalu");
        expect(resMock.json).toHaveBeenCalledWith({
          name: "Tuvalu",
          code: "tv",
          description: "Dummy description",
        });
      });

      it("should return a 404 error is the country does not exist", async () => {
        const reqMock = ({
          params: {
            countryCode: "unknown_code",
          },
        } as unknown) as Request;
        const resMock = ({
          status: jest.fn().mockImplementation(() => resMock),
          json: jest.fn(),
        } as unknown) as Response;

        getCountrySpy.mockResolvedValueOnce(null);

        await handleCountryDetail(reqMock, resMock);

        expect(getCountrySpy).toHaveBeenCalledWith("unknown_code");
        expect(resMock.status).toHaveBeenCalledWith(404);
        expect(resMock.json).toHaveBeenCalledWith({
          message: "Not found.",
        });
      });
    });
  });
});

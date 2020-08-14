import axios, { AxiosInstance } from "axios";

import { Service } from "alliage-service-loader/decorators";
import { parameter } from "alliage-di/dependencies";

export type Country = { name: string; code: string };

@Service("country_service", [
  parameter("parameters.countryApi.url"),
  parameter("parameters.countryApi.apiKey"),
])
export default class CountryService {
  private client: AxiosInstance;

  constructor(url: string, key: string) {
    this.client = axios.create({
      baseURL: url,
      params: { key },
    });
  }

  async getAllCountries() {
    return (await this.client.get<Country[]>("/country/all")).data;
  }

  async getCountry(countryCode: string) {
    try {
      return (await this.client.get<Country[]>(`/country/code/${countryCode}`)).data[0];
    }
    catch (e) {
      return null;
    }
  }
}

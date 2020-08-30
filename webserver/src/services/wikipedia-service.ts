import axios, { AxiosInstance } from "axios";

import { Service } from "alliage-service-loader/decorators";
import { parameter } from "alliage-di/dependencies";

@Service("wikipedia_service", [parameter("parameters.wikipediaApi.url")])
export default class WikipediaService {
  private client: AxiosInstance;

  constructor(url: string) {
    this.client = axios.create({
      baseURL: url,
    });
  }

  async getDescription(article: string) {
    try {
      const res = await this.client.get<{ extract: string }>(`/rest_v1/page/summary/${article}`);
      return res.data.extract;
    }
    catch (e) {
      return null;
    }
  }
}

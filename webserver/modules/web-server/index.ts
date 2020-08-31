import { AbstractLifeCycleAwareModule } from "alliage-lifecycle/module";
import { ServiceContainer } from "alliage-di/service-container";
import { parameter, allInstancesOf, Constructor } from "alliage-di/dependencies";
import { CONFIG_EVENTS } from "alliage-config-loader/events";
import { loadConfig } from "alliage-config-loader/helpers";
import { validate } from "alliage-config-loader/validators/json-schema";

import { WebProcess } from './processes/web';
import { AbstractController } from './controllers/abstract-controller';

export = class WebserverModule extends AbstractLifeCycleAwareModule {
  getEventHandlers() {
    return {
      [CONFIG_EVENTS.LOAD]: loadConfig(
        "webserver",
        validate({
          type: "object",
          properties: {
            port: {
              type: "number",
            },
          },
        })
      ),
    };
  }

  registerServices(serviceContainer: ServiceContainer) {
    serviceContainer.registerService("web_process", WebProcess, [
      parameter("webserver.port"),
      allInstancesOf(AbstractController as Constructor),
    ]);
  }
};
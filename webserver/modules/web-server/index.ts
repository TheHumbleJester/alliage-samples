import { AbstractLifeCycleAwareModule } from 'alliage-lifecycle/module'
import { ServiceContainer } from 'alliage-di/service-container'
import { parameter, allInstancesOf, Constructor } from 'alliage-di/dependencies';

import { WebProcess } from './processes/web';
import { AbstractController } from './controllers/abstract-controller';

export = class WebserverModule extends AbstractLifeCycleAwareModule {
  registerServices(serviceContainer: ServiceContainer) {
    serviceContainer.registerService('web_process', WebProcess, [
      parameter("parameters.webserver.port"),
      allInstancesOf(AbstractController as Constructor),
    ]);
  }
}
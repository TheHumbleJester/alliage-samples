import { AbstractProcess } from "alliage-process-manager/process";
import { Service } from "alliage-service-loader/decorators";

@Service("main_process")
export default class MainProcess extends AbstractProcess {
  getName() {
    return "main";
  }

  async execute() {
    process.stdout.write("Hello Alliage !\n");
    return true;
  }
}

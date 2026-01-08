import { IEvent } from "../event/Event";
import { Logger } from "../logger";
import { MachineRepository } from "../repository/MachineRepository";

export interface ISubscriber {
  handle(event: IEvent): IEvent | void;
  canHandle(event: IEvent): boolean;
}

export abstract class BaseSubscriber implements ISubscriber {
  public machineRepository: MachineRepository;
  public logger: Logger;

  constructor(machineRepository: MachineRepository, logger: Logger) {
    this.machineRepository = machineRepository;
    this.logger = logger;
  }

  handle(event: IEvent): IEvent | void {
    throw new Error("No implementation");
  }

  canHandle(event: IEvent): boolean {
    throw new Error("No implementation");
  }
}

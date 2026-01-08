import { EventEnum } from "../enum/event.enum";
import {
  IEvent,
  LowStockWarningEvent,
  MachineRefillEvent,
  StockLevelOkEvent,
} from "../event";
import { BaseSubscriber } from "./Subscriber";

export class MachineRefillSubscriber extends BaseSubscriber {
  handle(event: MachineRefillEvent): IEvent | undefined {
    const machine = this.machineRepository.findById(event.machineId());

    if (!machine) {
      return;
    }

    const newStockLevel = machine.getStockLevel() + event.getRefillQuantity();
    machine.updateStockLevel(newStockLevel);

    this.logger.machineLog(
      "INFO",
      machine.id,
      event.type(),
      `+${event.getRefillQuantity()} items`
    );

    if (machine.isStockLevelOk()) {
      return new StockLevelOkEvent(event.machineId());
    } else {
      return new LowStockWarningEvent(event.machineId());
    }
  }

  canHandle(event: IEvent): boolean {
    return event.type() === EventEnum.REFILL;
  }
}

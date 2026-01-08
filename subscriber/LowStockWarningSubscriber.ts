import { EventEnum } from "../enum/event.enum";
import { IEvent, LowStockWarningEvent } from "../event";
import { BaseSubscriber } from "./Subscriber";

export class LowStockWarningSubscriber extends BaseSubscriber {
  handle(event: LowStockWarningEvent): void {
    const machine = this.machineRepository.findById(event.machineId());

    if (!machine) {
      return;
    }

    if (!machine.isStockLevelOk()) {
      this.logger.machineLog(
        "WARN",
        machine.id,
        event.type(),
        `${machine.getStockLevel()} items left`
      );
    }
  }

  canHandle(event: IEvent): boolean {
    return event.type() === EventEnum.LOW_STOCK;
  }
}

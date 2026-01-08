import { EventEnum } from "../enum/event.enum";
import { StockLevelOkEvent } from "../event";
import { IEvent } from "../event/Event";
import { BaseSubscriber } from "./Subscriber";

export class StockLevelOkSubscriber extends BaseSubscriber {
  handle(event: StockLevelOkEvent): void {
    const machine = this.machineRepository.findById(event.machineId());

    if (!machine) {
      return;
    }

    if (machine.isStockLevelOk()) {
      this.logger.machineLog(
        "INFO",
        machine.id,
        event.type(),
        `${machine.getStockLevel()} items left`
      );
    }
  }

  canHandle(event: IEvent): boolean {
    return event.type() === EventEnum.STOCK_OK;
  }
}

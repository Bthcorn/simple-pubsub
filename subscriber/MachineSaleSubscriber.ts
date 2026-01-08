import { EventEnum } from "../enum/event.enum";
import { IEvent } from "../event/Event";
import { LowStockWarningEvent } from "../event/LowStockWarningEvent";
import { MachineSaleEvent } from "../event/MachineSaleEvent";
import { StockLevelOkEvent } from "../event/StockLevelOkEvent";
import { BaseSubscriber } from "./Subscriber";

export class MachineSaleSubscriber extends BaseSubscriber {
  handle(event: MachineSaleEvent): IEvent | void {
    const machine = this.machineRepository.findById(event.machineId());

    if (!machine) {
      return;
    }

    if (machine.getStockLevel() < event.getSoldQuantity()) {
      return new LowStockWarningEvent(event.machineId());
    }

    const newStockLevel = machine.getStockLevel() - event.getSoldQuantity();
    machine.updateStockLevel(newStockLevel);

    this.logger.machineLog(
      "INFO",
      machine.id,
      event.type(),
      `-${event.getSoldQuantity()} items`
    );

    if (machine.isStockLevelOk()) {
      return new StockLevelOkEvent(event.machineId());
    } else {
      return new LowStockWarningEvent(event.machineId());
    }
  }

  canHandle(event: IEvent): boolean {
    return event.type() === EventEnum.SALE;
  }
}

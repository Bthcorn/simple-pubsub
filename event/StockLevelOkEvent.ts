import { EventEnum } from "../enum/event.enum";
import { IEvent } from "./Event";

export class StockLevelOkEvent implements IEvent {
  constructor(private readonly _machineId: string) {}

  machineId(): string {
    return this._machineId;
  }

  type(): string {
    return EventEnum.STOCK_OK;
  }
}

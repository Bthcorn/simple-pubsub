import { EventEnum } from "../enum/event.enum";
import { IEvent } from "./Event";

export class MachineSaleEvent implements IEvent {
  constructor(
    private readonly _sold: number,
    private readonly _machineId: string
  ) {}

  machineId(): string {
    return this._machineId;
  }

  getSoldQuantity(): number {
    return this._sold;
  }

  type(): string {
    return EventEnum.SALE;
  }
}

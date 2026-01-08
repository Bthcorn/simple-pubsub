import { Machine } from "../object/Machine";
import { IRepository } from "./Repository";

export class MachineRepository implements IRepository<Machine> {
  public machines: Machine[];

  constructor(machines: Machine[]) {
    this.machines = machines;
  }

  findById(id: string): Machine | undefined {
    return this.machines.find((machine) => machine.id === id);
  }

  add(object: Machine): void {
    this.machines.push(object);
  }

  remove(id: string): void {
    this.machines = this.machines.filter((machine) => machine.id !== id);
  }

  update(id: string, object: Machine): void {
    const machine = this.findById(id);
    if (machine) {
      machine.updateStockLevel(machine.getStockLevel());
    }
  }
}

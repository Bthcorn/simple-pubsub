export class Machine {
  public stockLevel = 10;
  public id: string;

  constructor(id: string) {
    this.id = id;
  }

  getStockLevel(): number {
    return this.stockLevel;
  }

  updateStockLevel(newStockLevel: number) {
    if (newStockLevel < 0) {
      return;
    }

    this.stockLevel = newStockLevel;
  }

  isStockLevelOk(): boolean {
    return this.stockLevel >= 3;
  }
}

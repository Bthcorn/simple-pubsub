// interfaces
interface IEvent {
  type(): string;
  machineId(): string;
}

interface ISubscriber {
  handle(event: IEvent): void;
}

interface IPublishSubscribeService {
  publish(event: IEvent): void;
  subscribe(type: string, handler: ISubscriber): void;
  unsubscribe(type: string): void;
}

interface IRepository<T> {
  findById(id: string): T | undefined;
  add(object: T): void;
  remove(id: string): void;
  update(id: string, object: T): void;
}

// implementations
class MachineSaleEvent implements IEvent {
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
    return "sale";
  }
}

class MachineRefillEvent implements IEvent {
  constructor(
    private readonly _refill: number,
    private readonly _machineId: string
  ) {}

  machineId(): string {
    return this._machineId;
  }

  getRefillQuantity(): number {
    return this._refill;
  }

  type(): string {
    return "refill";
  }
}

class LowStockWarningEvent implements IEvent {
  constructor(private readonly _machineId: string) {}

  machineId(): string {
    return this._machineId;
  }

  type(): string {
    return "low_stock";
  }
}

class StockLevelOkEvent implements IEvent {
  constructor(private readonly _machineId: string) {}

  machineId(): string {
    return this._machineId;
  }

  type(): string {
    return "stock_ok";
  }
}

class MachineSaleSubscriber implements ISubscriber {
  public machineRepository: MachineRepository;

  constructor(machinesRepository: MachineRepository) {
    this.machineRepository = machinesRepository;
  }

  handle(event: MachineSaleEvent): IEvent | undefined {
    let machine = this.machineRepository.findById(event.machineId());

    if (!machine) {
      return;
    }

    if (machine.stockLevel < event.getSoldQuantity()) {
      return new LowStockWarningEvent(event.machineId());
    } else {
      machine.stockLevel -= event.getSoldQuantity();
      console.log(
        `Machine: ${
          machine.id
        } has sold ${event.getSoldQuantity()} items. Remaining stock: ${
          machine.stockLevel
        }`
      );
    }

    if (machine.isStockLevelOk()) {
      return new StockLevelOkEvent(event.machineId());
    } else {
      return new LowStockWarningEvent(event.machineId());
    }
  }
}

class MachineRefillSubscriber implements ISubscriber {
  public machineRepository: MachineRepository;

  constructor(machineRepository: MachineRepository) {
    this.machineRepository = machineRepository;
  }

  handle(event: MachineRefillEvent): IEvent | undefined {
    let machine = this.machineRepository.findById(event.machineId());

    if (!machine) {
      return;
    }

    machine.stockLevel += event.getRefillQuantity();

    console.log(
      `Machine: ${
        machine.id
      } has been refilled with ${event.getRefillQuantity()} items. New stock: ${
        machine.stockLevel
      }`
    );

    if (machine.isStockLevelOk()) {
      return new StockLevelOkEvent(event.machineId());
    } else {
      return new LowStockWarningEvent(event.machineId());
    }
  }
}

class LowStockWarningSubscriber implements ISubscriber {
  public machineRepository: MachineRepository;

  constructor(machineRepository: MachineRepository) {
    this.machineRepository = machineRepository;
  }

  handle(event: LowStockWarningEvent): void {
    const machine = this.machineRepository.findById(event.machineId());

    if (!machine) {
      return;
    }

    if (!machine.isStockLevelOk()) {
      console.warn(`Machine: ${machine.id}'s stock level is LOW`);
    }
  }
}

class StockLevelOkSubscriber implements ISubscriber {
  public machineRepository: MachineRepository;

  constructor(machineRepository: MachineRepository) {
    this.machineRepository = machineRepository;
  }

  handle(event: StockLevelOkEvent): void {
    const machine = this.machineRepository.findById(event.machineId());

    if (!machine) {
      return;
    }

    if (machine.isStockLevelOk()) {
      console.info(`Machine: ${machine.id}'s stock level is OK`);
    }
  }
}

// service
class PublishSubscribeService implements IPublishSubscribeService {
  public subscribers: Map<string, ISubscriber>;

  constructor() {
    this.subscribers = new Map<string, ISubscriber>();
    this.publish = this.publish.bind(this);
  }

  publish(event: IEvent): void {
    const subscriber = this.subscribers.get(event.type());
    if (!subscriber) {
      return;
    }

    if (subscriber instanceof MachineSaleSubscriber) {
      const result = subscriber.handle(event as MachineSaleEvent);
      if (result) {
        this.publish(result);
      }
    } else if (subscriber instanceof MachineRefillSubscriber) {
      const result = subscriber.handle(event as MachineRefillEvent);
      if (result) {
        this.publish(result);
      }
    } else {
      subscriber.handle(event);
    }
  }

  subscribe(type: string, handler: ISubscriber): void {
    if (!this.subscribers.has(type)) {
      this.subscribers.set(type, handler);
      console.log(`Subscribed to ${type}`);
    }
  }

  unsubscribe(type: string) {
    if (this.subscribers.has(type)) {
      this.subscribers.delete(type);
      console.log(`Unsubscribed from ${type}`);
    }
  }

  printSubscribers(): void {
    console.log(this.subscribers);
  }
}

// machine repository
class MachineRepository implements IRepository<Machine> {
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
      machine.stockLevel = object.stockLevel;
    }
  }
}

// objects
class Machine {
  public stockLevel = 10;
  public id: string;

  constructor(id: string) {
    this.id = id;
  }

  isStockLevelOk(): boolean {
    return this.stockLevel >= 3;
  }
}

// helpers
const randomMachine = (): string => {
  const random = Math.random() * 3;
  if (random < 1) {
    return "001";
  } else if (random < 2) {
    return "002";
  }
  return "003";
};

const eventGenerator = (): IEvent => {
  const random = Math.random();
  if (random < 0.5) {
    const saleQty = Math.random() < 0.5 ? 1 : 2; // 1 or 2
    return new MachineSaleEvent(saleQty, randomMachine());
  }
  const refillQty = Math.random() < 0.5 ? 3 : 5; // 3 or 5
  return new MachineRefillEvent(refillQty, randomMachine());
};

// program
(async () => {
  // create 3 machines with a quantity of 10 stock
  const machines: Machine[] = [
    new Machine("001"),
    new Machine("002"),
    new Machine("003"),
  ];

  // create a machine repository and inject the machines
  const machineRepository = new MachineRepository(machines);

  // create a machine sale event subscriber. inject the machines (all subscribers should do this)
  const saleSubscriber = new MachineSaleSubscriber(machineRepository);
  const refillSubscriber = new MachineRefillSubscriber(machineRepository);
  const lowStockSubscriber = new LowStockWarningSubscriber(machineRepository);
  const stockOkSubscriber = new StockLevelOkSubscriber(machineRepository);

  // create the PubSub service
  // const pubSubService: IPublishSubscribeService =
  //   null as unknown as IPublishSubscribeService; // implement and fix this
  const pubSubService = new PublishSubscribeService();
  pubSubService.subscribe("sale", saleSubscriber);
  pubSubService.subscribe("refill", refillSubscriber);
  pubSubService.subscribe("low_stock", lowStockSubscriber);
  pubSubService.subscribe("stock_ok", stockOkSubscriber);

  // create 5 random events
  console.log(machines);
  const events = [1, 2, 3, 4, 5].map((i) => eventGenerator());
  // publish the events
  events.map(pubSubService.publish);
  console.log(machines);
})();

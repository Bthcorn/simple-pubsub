import { IEvent, MachineRefillEvent, MachineSaleEvent } from "./event";
import { Logger } from "./logger";
import { Machine } from "./object/Machine";
import { MachineRepository } from "./repository/MachineRepository";
import { PublishSubscribeService } from "./service/PubSubService";
import {
  LowStockWarningSubscriber,
  MachineRefillSubscriber,
  MachineSaleSubscriber,
  StockLevelOkSubscriber,
} from "./subscriber";

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

const printAllMachine = (machines: Machine[]): void => {
  for (const machine of machines) {
    console.log(
      `Machine: ${machine.id}, Stock level ${machine.getStockLevel()}`
    );
  }
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

  const logger = new Logger();

  // create a machine sale event subscriber. inject the machines (all subscribers should do this)
  const saleSubscriber = new MachineSaleSubscriber(machineRepository, logger);
  const refillSubscriber = new MachineRefillSubscriber(
    machineRepository,
    logger
  );
  const lowStockSubscriber = new LowStockWarningSubscriber(
    machineRepository,
    logger
  );
  const stockOkSubscriber = new StockLevelOkSubscriber(
    machineRepository,
    logger
  );

  // create the PubSub service
  // const pubSubService: IPublishSubscribeService =
  //   null as unknown as IPublishSubscribeService; // implement and fix this
  const pubSubService = new PublishSubscribeService(logger);
  pubSubService.subscribe("sale", saleSubscriber);
  pubSubService.subscribe("refill", refillSubscriber);
  pubSubService.subscribe("low_stock", lowStockSubscriber);
  pubSubService.subscribe("stock_ok", stockOkSubscriber);

  // create 5 random events
  printAllMachine(machines);
  const events = [1, 2, 3, 4, 5].map((i) => eventGenerator());
  // publish the events
  events.map((event) => pubSubService.publish(event));
  printAllMachine(machines);
})();

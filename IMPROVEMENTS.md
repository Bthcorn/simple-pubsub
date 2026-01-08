### Things I revised from the last version...

1. Improved publish logic. <br>

```typescript
// This logic was written using if-else to identify the subscriber type which is totally not a efficient way. It is difficult for maintainability and extensibility e.g. adding new type of subscriber.
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
```

```typescript
// Improved version
publish(event: IEvent): void {
    for (const [type, subscriber] of this.subscribers) {
      if (subscriber.canHandle(event)) {
        const newEvent = subscriber.handle(event);

        if (newEvent) {
          this.publish(newEvent);
        }
      }
    }
  }
```

---

2. **Organized and separated source code** based on the functionalitiy and logic into directories as shown in the repository. This makes source code more readable and easier for new implementations.

   - enum
   - event
   - object
   - repository
   - service
   - subscriber
     <br>

3. Additionally, **Made some refactors to reduce some duplication and redundancy** of the code in the following examples.

```typescript
// Make abstract class for concreate subscriber classes to inherit from because they also need the similar attributes, methods, and contructors.
export abstract class BaseSubscriber implements ISubscriber {
  public machineRepository: MachineRepository;
  public logger: Logger;

  constructor(machineRepository: MachineRepository, logger: Logger) {
    this.machineRepository = machineRepository;
    this.logger = logger;
  }

  handle(event: IEvent): IEvent | void {
    throw new Error("No implementation");
  }

  canHandle(event: IEvent): boolean {
    throw new Error("No implementation");
  }
}

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
```

4. Implemented **Logger class** to inject in subscriber class for logging events or activities that occurs. Making it more flexible to generate logs.

5. Declared **event enum for events** in order to make code more readable, maintainable, and type-safe.

---

#### Result:

```[INFO]: Subscribed to sale
[INFO]: Subscribed to refill
[INFO]: Subscribed to low_stock
[INFO]: Subscribed to stock_ok
Machine: 001, Stock level 10
Machine: 002, Stock level 10
Machine: 003, Stock level 10
[INFO]: Machine 003     | Event type: sale      | -2 items
[INFO]: Machine 003     | Event type: stock_ok  | 8 items left
[INFO]: Machine 003     | Event type: sale      | -1 items
[INFO]: Machine 003     | Event type: stock_ok  | 7 items left
[INFO]: Machine 001     | Event type: refill    | +5 items
[INFO]: Machine 001     | Event type: stock_ok  | 15 items left
[INFO]: Machine 001     | Event type: sale      | -2 items
[INFO]: Machine 001     | Event type: stock_ok  | 13 items left
[INFO]: Machine 002     | Event type: refill    | +5 items
[INFO]: Machine 002     | Event type: stock_ok  | 15 items left
Machine: 001, Stock level 13
Machine: 002, Stock level 15
Machine: 003, Stock level 7
```

import { IEvent } from "../event";
import { Logger } from "../logger";
import { ISubscriber } from "../subscriber/Subscriber";

export interface IPublishSubscribeService {
  publish(event: IEvent): void;
  subscribe(type: string, handler: ISubscriber): void;
  unsubscribe(type: string): void;
}

export class PublishSubscribeService implements IPublishSubscribeService {
  public subscribers: Map<string, ISubscriber>;
  public logger: Logger;

  constructor(logger: Logger) {
    this.subscribers = new Map<string, ISubscriber>();
    this.logger = logger;
  }

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

  subscribe(type: string, handler: ISubscriber): void {
    if (this.subscribers.has(type)) {
      return;
    }

    this.subscribers.set(type, handler);
    this.logger.info("INFO", `Subscribed to ${type}`);
  }

  unsubscribe(type: string) {
    if (!this.subscribers.has(type)) {
      return;
    }

    this.subscribers.delete(type);
    this.logger.info("INFO", `Unsubscribed from ${type}`);
  }
}

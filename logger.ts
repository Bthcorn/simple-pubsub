export type LogType = "INFO" | "WARN" | "ERROR";

export class Logger {
  machineLog(type: LogType, id: string, event: string, message: string) {
    console.log(
      `[${type}]: Machine ${id} \t| Event type: ${event} \t| ${message}`
    );
  }

  info(type: LogType, message: string) {
    console.log(`[${type}]: ${message}`);
  }
}

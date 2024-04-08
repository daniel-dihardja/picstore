import { EventEmitter } from "events";

export type ProgressEvent = Readonly<{
  id: string;
}>;

class ProgressEventBus {
  private readonly bus = new EventEmitter();

  addListener<T>(progressId: string, listener: (event: T) => void) {
    this.bus.addListener(progressId, listener);
  }

  removeListener<T>(progressId: string, listener: (event: T) => void) {
    this.bus.removeListener(progressId, listener);
  }

  emit<T extends ProgressEvent>(event: T) {
    console.log(`Emitting event: ${event.id}`);
    this.bus.emit(event.id, event);
  }
}

// Creating and exposing the singleton instance of the EventBus
export const progressEventBus = new ProgressEventBus();

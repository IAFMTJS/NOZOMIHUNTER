type EventHandler = (payload?: unknown) => void

class EventBus {
  private listeners: Record<string, EventHandler[]> = {}

  on(event: string, handler: EventHandler) {
    if (!this.listeners[event]) {
      this.listeners[event] = []
    }

    this.listeners[event].push(handler)
  }

  emit(event: string, payload?: unknown) {
    const handlers = this.listeners[event]

    if (!handlers) return

    handlers.forEach(handler => handler(payload))
  }
}

export const eventBus = new EventBus()
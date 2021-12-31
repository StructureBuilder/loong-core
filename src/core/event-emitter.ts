type Event<T1, T2, T3, T4> = (t1?: T1, t2?: T2, t3?: T3, t4?: T4, ...args: any[]) => void;

export class EventEmitter<T1 = any, T2 = any, T3 = any, T4 = any> {
  private events: Event<T1, T2, T3, T4>[] = [];

  add(event: Event<T1, T2, T3, T4>) {
    this.events.push(event);
  }

  emit(t1?: T1, t2?: T2, t3?: T3, t4?: T4, ...args: any[]) {
    this.events.forEach(event => event(t1, t2, t3, t4, ...args));
  }

  clear() {
    this.events = [];
  }
}

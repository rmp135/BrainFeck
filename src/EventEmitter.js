export default class EventEmitter {
  constructor () {
    this.events = new Map();
    this.singleEvents = new Map();
  }
  emit (event, props) {
    if (this.events.has(event)) {
      this.events.get(event).forEach((e) => e(props));
    }
    if (this.singleEvents.has(event)) {
      this.singleEvents.get(event).forEach((e) => e(props));
    }
    this.singleEvents.delete(event);
  }
  on (event, f) {
    if (!this.events.has(event)) {
      this.events.set(event, []);
    }
    this.events.get(event).push(f);
  }
  once (event, f) {
    if (!this.singleEvents.has(event)) {
      this.singleEvents.set(event, []);
    }
    this.singleEvents.get(event).push(f);
  }
}

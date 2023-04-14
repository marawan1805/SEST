export class VirtualClock {
  private currentTime: number;
  private timeouts: Array<{ callback: () => void; time: number }>;

  constructor() {
    this.currentTime = 0;
    this.timeouts = [];
  }

  advanceTime(time: number) {
    this.currentTime += time;
    this.processTimeouts();
  }

  getTime(): number {
    return this.currentTime;
  }

  reset() {
    this.currentTime = 0;
    this.timeouts = [];
  }

  setTimeout(callback: () => void, time: number) {
    this.timeouts.push({ callback, time: this.currentTime + time });
    this.timeouts.sort((a, b) => a.time - b.time);
  }

  private processTimeouts() {
    while (this.timeouts.length > 0 && this.timeouts[0].time <= this.currentTime) {
      const { callback } = this.timeouts.shift()!;
      callback();
    }
  }
}

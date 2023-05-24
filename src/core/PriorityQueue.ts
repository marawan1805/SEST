export class PriorityQueue<T> {
    private items: { element: T; priority: number }[];
  
    constructor(private comparator: (a: T, b: T) => number) {
      this.items = [];
    }
  
    enqueue(item: T, priority: number = 0): void {
      const queueItem = { element: item, priority };
      let added = false;
  
      for (let i = 0; i < this.items.length; i++) {
        if (this.comparator(item, this.items[i].element) < 0) {
          this.items.splice(i, 0, queueItem);
          added = true;
          break;
        }
      }
  
      if (!added) {
        this.items.push(queueItem);
      }
    }
  
    dequeue(): T | undefined {
      if (this.isEmpty()) {
        return undefined;
      }
      return this.items.shift()?.element;
    }
  
    front(): T | undefined {
      if (this.isEmpty()) {
        return undefined;
      }
      return this.items[0].element;
    }
  
    isEmpty(): boolean {
      return this.items.length === 0;
    }
  
    length(): number {
      return this.items.length;
    }
  }
  
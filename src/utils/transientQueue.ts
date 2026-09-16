export interface QueuedSubmission {
  id: string;
  moduleId: string;
  payload: Record<string, any>;
  timestamp: number;
  retryCount: number;
}

class TransientOutboxQueue {
  private queue: QueuedSubmission[] = [];
  private listeners: Array<(count: number) => void> = [];
  private isFlushing = false;
  private pushHandler?: (item: QueuedSubmission) => Promise<boolean>;

  constructor() {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('transient_queue');
        if (stored) {
          this.queue = JSON.parse(stored);
        }
      } catch (e) {
        console.warn('Failed to load transient queue from storage', e);
      }
      window.addEventListener('online', () => this.flushQueue());
    }
  }

  private saveToStorage() {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('transient_queue', JSON.stringify(this.queue));
      } catch (e) {
        console.warn('Failed to save transient queue to storage', e);
      }
    }
  }

  public setPushHandler(handler: (item: QueuedSubmission) => Promise<boolean>) {
    this.pushHandler = handler;
  }

  public subscribe(callback: (count: number) => void): () => void {
    this.listeners.push(callback);
    callback(this.queue.length);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  private notify() {
    this.saveToStorage();
    this.listeners.forEach(cb => cb(this.queue.length));
  }

  public getPendingCount(): number {
    return this.queue.length;
  }

  public getPendingItems(): QueuedSubmission[] {
    return [...this.queue];
  }

  public enqueue(moduleId: string, payload: Record<string, any>): string {
    const id = `queue_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    this.queue.push({ id, moduleId, payload, timestamp: Date.now(), retryCount: 0 });
    this.notify();
    return id;
  }

  public purge(id: string) {
    this.queue = this.queue.filter(item => item.id !== id);
    this.notify();
  }

  public async flushQueue(): Promise<number> {
    if (this.isFlushing || this.queue.length === 0 || !this.pushHandler) return 0;
    this.isFlushing = true;
    let successCount = 0;
    const itemsToProcess = [...this.queue];
    for (const item of itemsToProcess) {
      try {
        const success = await this.pushHandler(item);
        if (success) {
          this.purge(item.id);
          successCount++;
        }
      } catch (err) {
        console.warn(`Transient queue retry for ${item.id} deferred:`, err);
        item.retryCount++;
      }
    }
    this.saveToStorage();
    this.isFlushing = false;
    return successCount;
  }
}

export const transientQueue = new TransientOutboxQueue();

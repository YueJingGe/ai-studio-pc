export type Job = () => Promise<void>;

export class InProcessQueue {
  private active = 0;
  private pending: Job[] = [];

  constructor(private readonly concurrency: number) {}

  push(job: Job): void {
    this.pending.push(job);
    this.drain();
  }

  get stats(): { active: number; pending: number } {
    return { active: this.active, pending: this.pending.length };
  }

  private drain(): void {
    while (this.active < this.concurrency && this.pending.length > 0) {
      const job = this.pending.shift();
      if (!job) return;
      this.active += 1;
      void job().finally(() => {
        this.active -= 1;
        this.drain();
      });
    }
  }
}

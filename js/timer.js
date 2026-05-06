export function formatTime(seconds) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

export class Timer {
  constructor({ totalSeconds, onTick, onWarning, onDanger, onExpire }) {
    this.totalMs    = totalSeconds * 1000;
    this.onTick     = onTick    || (() => {});
    this.onWarning  = onWarning || (() => {});
    this.onDanger   = onDanger  || (() => {});
    this.onExpire   = onExpire  || (() => {});
    this._intervalId    = null;
    this._startTimestamp = null;
    this._warnFired = false;
    this._dangerFired = false;
  }

  start() {
    this._startTimestamp = Date.now();
    this._warnFired = false;
    this._dangerFired = false;
    this.onTick(Math.ceil(this.totalMs / 1000));

    this._intervalId = setInterval(() => {
      const elapsed = Date.now() - this._startTimestamp;
      const remainingMs = this.totalMs - elapsed;
      const remainingSec = Math.max(0, Math.ceil(remainingMs / 1000));

      this.onTick(remainingSec);

      if (!this._warnFired && remainingSec <= 300) {
        this._warnFired = true;
        this.onWarning();
      }
      if (!this._dangerFired && remainingSec <= 60) {
        this._dangerFired = true;
        this.onDanger();
      }
      if (remainingSec <= 0) {
        this.stop();
        this.onExpire();
      }
    }, 500); // tick every 500ms for accuracy
  }

  stop() {
    if (this._intervalId !== null) {
      clearInterval(this._intervalId);
      this._intervalId = null;
    }
  }

  getRemaining() {
    if (!this._startTimestamp) return this.totalMs / 1000;
    const elapsed = Date.now() - this._startTimestamp;
    return Math.max(0, Math.ceil((this.totalMs - elapsed) / 1000));
  }
}

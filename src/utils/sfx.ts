class SoundEffectsManager {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private enabled: boolean = true;

  public setEnabled(val: boolean) {
    this.enabled = val;
  }

  public init() {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return null;
      this.ctx = new AudioCtx();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.55;
      this.master.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  private envelope(g: GainNode, t: number, a: number, d: number, v: number) {
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(v, t + a);
    g.gain.exponentialRampToValueAtTime(0.0001, t + a + d);
  }

  private tone(type: OscillatorType, f1: number, f2: number, t: number, d: number, v: number) {
    if (!this.ctx || !this.master) return;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(f1, t);
    osc.frequency.exponentialRampToValueAtTime(f2, t + d);
    this.envelope(g, t, 0.01, d, v);
    osc.connect(g).connect(this.master);
    osc.start(t);
    osc.stop(t + d + 0.05);
  }

  private sweep(f1: number, f2: number, t: number, d: number, v: number, q: number) {
    if (!this.ctx || !this.master) return;
    const node = this.ctx.createBufferSource();
    const buf = this.ctx.createBuffer(1, Math.floor(this.ctx.sampleRate * d), this.ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    node.buffer = buf;
    const filter = this.ctx.createBiquadFilter();
    const g = this.ctx.createGain();
    filter.type = 'bandpass';
    filter.Q.value = q;
    filter.frequency.setValueAtTime(f1, t);
    filter.frequency.exponentialRampToValueAtTime(f2, t + d);
    this.envelope(g, t, d * 0.3, d * 0.7, v);
    node.connect(filter).connect(g).connect(this.master);
    node.start(t);
  }

  public right() {
    if (!this.enabled || !this.init()) return;
    try {
      const t = this.ctx!.currentTime;
      this.tone('sine', 660, 990, t, 0.16, 0.35);
      this.tone('sine', 990, 1480, t + 0.09, 0.22, 0.3);
      this.tone('triangle', 1320, 1320, t + 0.09, 0.3, 0.08);
    } catch {}
  }

  public left() {
    if (!this.enabled || !this.init()) return;
    try {
      const t = this.ctx!.currentTime;
      this.tone('triangle', 300, 110, t, 0.2, 0.3);
      this.sweep(1800, 300, t, 0.22, 0.5, 1.2);
    } catch {}
  }

  public up() {
    if (!this.enabled || !this.init()) return;
    try {
      const t = this.ctx!.currentTime;
      this.sweep(300, 3000, t, 0.32, 0.5, 2.5);
      this.tone('sine', 420, 840, t, 0.3, 0.14);
    } catch {}
  }
}

export const SFX = new SoundEffectsManager();

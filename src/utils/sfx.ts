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

  /** Kısa, özgün açılış melodisi. Yalnızca kullanıcı etkileşimiyle çağrılır. */
  public playOpening() {
    if (!this.enabled || !this.init()) return;
    try {
      const t = this.ctx!.currentTime + 0.04;
      const notes = [
        { f: 523.25, at: 0, d: 0.42, v: 0.12 },
        { f: 659.25, at: 0.22, d: 0.48, v: 0.105 },
        { f: 783.99, at: 0.48, d: 0.58, v: 0.10 },
        { f: 1046.5, at: 0.82, d: 0.9, v: 0.075 },
        { f: 783.99, at: 1.28, d: 0.72, v: 0.055 }
      ];
      notes.forEach(n => this.tone('sine', n.f, n.f * 1.002, t + n.at, n.d, n.v));
      this.tone('triangle', 261.63, 261.63, t + 0.02, 1.45, 0.035);
    } catch {}
  }

  public right() {
    if (!this.enabled || !this.init()) return;
    try {
      const t = this.ctx!.currentTime;
      this.tone('sine', 740, 988, t, 0.11, 0.16);
      this.tone('sine', 988, 1175, t + 0.055, 0.14, 0.11);
    } catch {}
  }

  public left() {
    if (!this.enabled || !this.init()) return;
    try {
      const t = this.ctx!.currentTime;
      this.tone('sine', 440, 330, t, 0.13, 0.12);
      this.sweep(900, 420, t, 0.13, 0.12, 1.2);
    } catch {}
  }

  public up() {
    if (!this.enabled || !this.init()) return;
    try {
      const t = this.ctx!.currentTime;
      this.sweep(420, 1800, t, 0.22, 0.16, 2.5);
      this.tone('sine', 523, 784, t, 0.22, 0.10);
    } catch {}
  }
}

export const SFX = new SoundEffectsManager();

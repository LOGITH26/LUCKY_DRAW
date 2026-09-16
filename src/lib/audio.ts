// Audio engine: Web Audio API ticker for spinning, synthesized Chenda drum fanfare for celebration,
// and optional custom uploaded victory audio.

export class AudioEngine {
  private ctx: AudioContext | null = null;
  private tickerTimer: number | null = null;
  private tickerVolume = 0.5;
  private celebrationVolume = 0.7;
  private muted = false;

  private ensureCtx(): AudioContext {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  setTickerVolume(v: number) {
    this.tickerVolume = v;
  }

  setCelebrationVolume(v: number) {
    this.celebrationVolume = v;
  }

  setMuted(m: boolean) {
    this.muted = m;
    if (m) this.stopTicker();
  }

  // Mechanical ticker click — short noise burst through a bandpass filter.
  private playTick() {
    if (this.muted || this.tickerVolume <= 0) return;
    const ctx = this.ensureCtx();
    const now = ctx.currentTime;

    const bufferSize = Math.floor(ctx.sampleRate * 0.03);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 3);
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const bandpass = ctx.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.value = 2000;
    bandpass.Q.value = 5;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(this.tickerVolume * 0.6, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    noise.connect(bandpass);
    bandpass.connect(gain);
    gain.connect(ctx.destination);
    noise.start(now);
    noise.stop(now + 0.05);
  }

  startTicker(intervalMs = 80) {
    if (this.muted) return;
    this.stopTicker();
    this.playTick();
    this.tickerTimer = window.setInterval(() => this.playTick(), intervalMs);
  }

  stopTicker() {
    if (this.tickerTimer !== null) {
      clearInterval(this.tickerTimer);
      this.tickerTimer = null;
    }
  }

  // Synthesized Chenda-style drum roll + ascending fanfare.
  playCelebration() {
    if (this.muted) return;
    const ctx = this.ensureCtx();
    const now = ctx.currentTime;
    const vol = this.celebrationVolume;

    // Drum roll — rapid low-frequency thumps
    const drumCount = 12;
    for (let i = 0; i < drumCount; i++) {
      const t = now + i * 0.06;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(120, t);
      osc.frequency.exponentialRampToValueAtTime(40, t + 0.05);
      gain.gain.setValueAtTime(vol * 0.5, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.1);
    }

    // Ascending fanfare notes
    const fanfareStart = now + drumCount * 0.06 + 0.1;
    const notes = [392, 523.25, 659.25, 783.99]; // G, C, E, G
    notes.forEach((freq, i) => {
      const t = fanfareStart + i * 0.15;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(vol * 0.3, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.45);
    });
  }

  // Play a user-uploaded custom audio data URL, limited to 5 seconds.
  playCustomAudio(dataUrl: string): HTMLAudioElement | null {
    if (this.muted) return null;
    const audio = new Audio(dataUrl);
    audio.volume = this.celebrationVolume;
    audio.play().catch(() => {});
    setTimeout(() => {
      audio.pause();
      audio.currentTime = 0;
    }, 5000);
    return audio;
  }

  stopCustomAudio(audio: HTMLAudioElement | null) {
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
  }

  // Preview a celebration sound (used in settings).
  previewCelebration() {
    this.ensureCtx();
    this.playCelebration();
  }

  previewCustom(dataUrl: string): HTMLAudioElement | null {
    const audio = new Audio(dataUrl);
    audio.volume = this.celebrationVolume;
    audio.play().catch(() => {});
    return audio;
  }

  dispose() {
    this.stopTicker();
    if (this.ctx) {
      this.ctx.close();
      this.ctx = null;
    }
  }
}

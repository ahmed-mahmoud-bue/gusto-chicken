/**
 * Kitchen Audio Alert System using Web Audio API
 * Generates an authentic restaurant chime bell without external audio files.
 */

class KitchenAudioAlert {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;

  private getContext(): AudioContext | null {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  /**
   * Play high-resonance double ding kitchen chime
   */
  public playOrderChime(): void {
    if (this.isMuted) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const now = ctx.currentTime;

      // Note 1: Bright bell (659.25 Hz - E5)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(659.25, now);
      gain1.gain.setValueAtTime(0.25, now);
      gain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.5);

      // Note 2: Higher chime (987.77 Hz - B5)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(987.77, now + 0.16);
      gain2.gain.setValueAtTime(0.35, now + 0.16);
      gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.9);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.16);
      osc2.stop(now + 0.9);
    } catch (e) {
      console.warn('Audio alert play error', e);
    }
  }

  public setMuted(muted: boolean): void {
    this.isMuted = muted;
    try {
      localStorage.setItem('gusto_kitchen_audio_muted', muted ? 'true' : 'false');
    } catch {}
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public initFromStorage(): boolean {
    try {
      const saved = localStorage.getItem('gusto_kitchen_audio_muted');
      if (saved !== null) {
        this.isMuted = saved === 'true';
      }
    } catch {}
    return this.isMuted;
  }
}

export const kitchenAudio = new KitchenAudioAlert();
kitchenAudio.initFromStorage();

import { Sequencer } from './Sequencer';
import { SFX, type SfxId } from './sfx';
import { TRACKS, type TrackId } from './tracks';

/**
 * Som do jogo: efeitos e música sintetizados com a Web Audio API.
 * O navegador só libera o áudio depois de uma interação, por isso `unlock` é chamado no primeiro toque ou tecla.
 */
export class AudioManager {
  private static readonly MUTE_KEY = 'aurora-creature:mudo';

  private ctx: AudioContext | null = null;
  private master!: GainNode;
  private musicBus!: GainNode;
  private sfxBus!: GainNode;
  private noise!: AudioBuffer;
  private sequencer: Sequencer | null = null;
  private current: TrackId | null = null;
  private _muted: boolean;

  constructor() {
    this._muted = localStorage.getItem(AudioManager.MUTE_KEY) === '1';
  }

  get muted() { return this._muted; }

  /** Cria o contexto de áudio (na primeira interação) e retoma a música pendente. */
  unlock() {
    if (!this.ctx) {
      const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) return;
      const ctx = new Ctor();
      this.ctx = ctx;
      this.master = ctx.createGain();
      this.master.gain.value = this._muted ? 0 : 0.6;
      this.master.connect(ctx.destination);
      this.musicBus = ctx.createGain();
      this.musicBus.gain.value = 0.55;
      this.musicBus.connect(this.master);
      this.sfxBus = ctx.createGain();
      this.sfxBus.connect(this.master);
      this.noise = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
      const data = this.noise.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
      this.sequencer = new Sequencer(ctx, this.musicBus, this.noise);
      const pending = this.current;
      this.current = null;
      if (pending) this.music(pending);
    }
    if (this.ctx.state === 'suspended') void this.ctx.resume();
  }

  toggleMute(): boolean {
    this._muted = !this._muted;
    localStorage.setItem(AudioManager.MUTE_KEY, this._muted ? '1' : '0');
    if (this.ctx) this.master.gain.setTargetAtTime(this._muted ? 0 : 0.6, this.ctx.currentTime, 0.02);
    return this._muted;
  }

  /** Troca a música (não reinicia se já for a mesma). `null` para o silêncio. */
  music(id: TrackId | null) {
    if (id === this.current) return;
    this.current = id;
    if (!this.sequencer) return;
    if (id) this.sequencer.play(TRACKS[id]);
    else this.sequencer.stop();
  }

  sfx(id: SfxId) {
    const ctx = this.ctx;
    if (!ctx || this._muted) return;
    const now = ctx.currentTime;
    for (const part of SFX[id]) {
      const t = now + (part.at ?? 0);
      const vol = part.vol ?? 0.2;
      const gain = ctx.createGain();
      gain.connect(this.sfxBus);
      gain.gain.setValueAtTime(vol, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + part.dur);
      let src: AudioScheduledSourceNode;
      if (part.wave === 'noise') {
        const n = ctx.createBufferSource();
        n.buffer = this.noise;
        n.connect(gain);
        src = n;
      } else {
        const osc = ctx.createOscillator();
        osc.type = part.wave;
        osc.frequency.setValueAtTime(part.from, t);
        if (part.to) osc.frequency.exponentialRampToValueAtTime(part.to, t + part.dur);
        osc.connect(gain);
        src = osc;
      }
      src.start(t);
      src.stop(t + part.dur + 0.02);
    }
  }
}

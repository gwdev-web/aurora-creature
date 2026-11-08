import type { Channel, Track, Wave } from './tracks';

export interface NoteEvent { step: number; length: number; freq: number | null; drum: 'K' | 'S' | 'H' | null; }

/** Converte a notação em texto em eventos e toca a trilha em loop, agendando um pouco à frente. */
export class Sequencer {
  private static readonly SEMITONES: Record<string, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
  private static readonly LOOKAHEAD = 0.15;

  private timer: number | null = null;
  private channels: { channel: Channel; events: NoteEvent[]; length: number }[] = [];
  private startTime = 0;
  private stepDur = 0;
  /** Próximo índice de evento e volta do loop em cada canal. */
  private cursors: { index: number; loop: number }[] = [];
  private loop = true;
  private voices: AudioScheduledSourceNode[] = [];

  constructor(private readonly ctx: AudioContext, private readonly out: AudioNode, private readonly noise: AudioBuffer) {}

  /** Frequência de uma nota como `C#5`. */
  static freq(name: string): number {
    const m = /^([A-G])(#|b)?(-?\d)$/.exec(name);
    if (!m) throw new Error(`Nota inválida: ${name}`);
    const semis = Sequencer.SEMITONES[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0);
    const midi = (Number(m[3]) + 1) * 12 + semis;
    return 440 * 2 ** ((midi - 69) / 12);
  }

  static parse(notes: string): { events: NoteEvent[]; length: number } {
    const events: NoteEvent[] = [];
    let step = 0;
    for (const token of notes.trim().split(/\s+/)) {
      const [name, len] = token.split('.');
      const length = Number(len ?? 2);
      if (name === '-') { step += length; continue; }
      const drum = name === 'K' || name === 'S' || name === 'H' ? name : null;
      events.push({ step, length, freq: drum ? null : Sequencer.freq(name), drum });
      step += length;
    }
    return { events, length: step };
  }

  play(track: Track) {
    this.stop();
    this.stepDur = 60 / track.bpm / 4;
    this.loop = track.loop;
    this.channels = track.channels.map((channel) => ({ channel, ...Sequencer.parse(channel.notes) }));
    this.cursors = this.channels.map(() => ({ index: 0, loop: 0 }));
    this.startTime = this.ctx.currentTime + 0.05;
    this.timer = window.setInterval(() => this.schedule(), 40);
    this.schedule();
  }

  stop() {
    if (this.timer !== null) window.clearInterval(this.timer);
    this.timer = null;
    for (const v of this.voices) { try { v.stop(); } catch { /* já parou */ } }
    this.voices = [];
  }

  private schedule() {
    const until = this.ctx.currentTime + Sequencer.LOOKAHEAD;
    this.channels.forEach((ch, i) => {
      const cur = this.cursors[i];
      if (!ch.events.length) return;
      for (;;) {
        if (cur.index >= ch.events.length) {
          if (!this.loop) return;
          cur.index = 0;
          cur.loop++;
        }
        const ev = ch.events[cur.index];
        const t = this.startTime + (cur.loop * ch.length + ev.step) * this.stepDur;
        if (t > until) return;
        if (t >= this.ctx.currentTime - 0.01) this.voice(ch.channel.wave, ch.channel.volume, ev, t);
        cur.index++;
      }
    });
    this.voices = this.voices.filter((v) => (v as unknown as { _end: number })._end > this.ctx.currentTime);
  }

  private voice(wave: Wave, volume: number, ev: NoteEvent, t: number) {
    const dur = ev.length * this.stepDur;
    const gain = this.ctx.createGain();
    gain.connect(this.out);
    let src: AudioScheduledSourceNode;
    if (ev.drum) {
      const n = this.ctx.createBufferSource();
      n.buffer = this.noise;
      const filter = this.ctx.createBiquadFilter();
      filter.type = ev.drum === 'K' ? 'lowpass' : 'highpass';
      filter.frequency.value = ev.drum === 'K' ? 180 : ev.drum === 'S' ? 1800 : 7000;
      n.connect(filter).connect(gain);
      const len = ev.drum === 'H' ? 0.04 : ev.drum === 'S' ? 0.12 : 0.15;
      const v = volume * (ev.drum === 'K' ? 3 : ev.drum === 'S' ? 1.5 : 0.8);
      gain.gain.setValueAtTime(v, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + len);
      n.start(t);
      n.stop(t + len + 0.01);
      src = n;
    } else {
      const osc = this.ctx.createOscillator();
      osc.type = wave === 'noise' ? 'square' : wave;
      osc.frequency.setValueAtTime(ev.freq!, t);
      osc.connect(gain);
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(volume, t + 0.01);
      gain.gain.setValueAtTime(volume, t + dur * 0.7);
      gain.gain.linearRampToValueAtTime(0, t + dur * 0.95);
      osc.start(t);
      osc.stop(t + dur);
      src = osc;
    }
    (src as unknown as { _end: number })._end = t + dur + 0.1;
    this.voices.push(src);
  }
}

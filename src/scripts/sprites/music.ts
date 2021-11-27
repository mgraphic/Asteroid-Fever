import { Config } from '../config';
import { KeyState } from '../models';

export class Music {
    private static FPS: number = 60;

    private musicNotes: HTMLAudioElement[];

    private tempo: number = Config.MUSIC_TEMPO;
    private beat: number = 0;
    private noteIndex: number = 2;

    public constructor(private state: KeyState) {
        this.musicNotes = Config.MUSIC_CONFIG.files.map(
            (file: string): HTMLAudioElement => {
                const audio: HTMLAudioElement = new Audio(file);
                audio.volume = Config.MUSIC_CONFIG.volume;
                return audio;
            }
        );
    }

    public animate(): void {
        if (this.beat === 0) {
            this.play();
            this.beat = Math.ceil(this.tempo * Music.FPS);
            return;
        }

        this.beat--;
    }

    public setTempoByRatio(ratio: number): void {
        if (ratio <= 0) {
            ratio = 1;
        }

        const fastest: number = 1 - 100 / Config.MUSIC_MAX_BPS / 100;
        this.tempo = Config.MUSIC_TEMPO - fastest * (1 - ratio);
    }

    public mute(): void {
        this.musicNotes.forEach((stream: HTMLAudioElement): void => {
            stream.muted = true;
        });
    }

    public unmute(): void {
        this.musicNotes.forEach((stream: HTMLAudioElement): void => {
            stream.muted = false;
        });
    }

    private play(): void {
        this.noteIndex = (this.noteIndex + 1) % this.musicNotes.length;

        if (this.state.musicOn) {
            this.musicNotes[this.noteIndex].play();
        }
    }
}

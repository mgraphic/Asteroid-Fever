import { KeyState, SoundEffectConfig } from './models';

export class Sound {
    private static DEFAULT_CONFIG: Omit<SoundEffectConfig, 'file'> = {
        maxStreams: 1,
        volume: 1,
        loop: false,
    };

    private streams: HTMLAudioElement[];
    private streamIndex: number = 0;

    public constructor(
        private state: KeyState,
        private config: SoundEffectConfig
    ) {
        this.config = Object.assign({}, Sound.DEFAULT_CONFIG, config);
        this.streams = Array(this.config.maxStreams)
            .fill(null)
            .map((): HTMLAudioElement => {
                const audio: HTMLAudioElement = new Audio(this.config.file);
                audio.volume = this.config.volume;
                audio.loop = this.config.loop;
                return audio;
            });
    }

    public play(): void {
        if (this.state.soundOn) {
            this.streamIndex = (this.streamIndex + 1) % this.config.maxStreams;
            this.streams[this.streamIndex].play();
        }
    }

    public stop(): void {
        this.streams[this.streamIndex].pause();
        this.streams[this.streamIndex].currentTime = 0;
    }

    public mute(): void {
        this.streams.forEach((stream: HTMLAudioElement): void => {
            stream.muted = true;
        });
    }

    public unmute(): void {
        this.streams.forEach((stream: HTMLAudioElement): void => {
            stream.muted = false;
        });
    }

    public volumeOff(): void {
        this.streams.forEach((stream: HTMLAudioElement): void => {
            stream.volume = 0;
        });
    }

    public volumeOn(): void {
        this.streams.forEach((stream: HTMLAudioElement): void => {
            stream.volume = this.config.volume;
        });
    }
}

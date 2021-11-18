import { MusicConfig, SoundEffectConfig } from './models';

export class Config {
    // Ship settings
    public static SHIP_STROKE_COLOR: string = '#fff';
    public static SHIP_STROKE_LINE_WIDTH: number = 1;
    public static SHIP_ROTATE_SPEED: number = 0.001;
    public static SHIP_THRUST_SPEED: number = 0.08;
    public static SHIP_MANIFEST_CYCLE_LOOPS: number = 5;
    public static SHIP_MANIFEST_CYCLE_TIMER: number = 70;
    public static SHIP_MANIFEST_RADIUS: number = 115;

    // Bullet settings
    public static BULLET_SPEED: number = 10;
    public static BULLET_FILL_STYLE: string = '#fff';
    public static BULLET_WIDTH: number = 4;
    public static BULLET_HEIGHT: number = 5;
    public static BULLET_REPEAT_EDGES: boolean = true;
    public static BULLET_CONTINUE_XY_PERCENT: number = 10;

    // Asteroid settings
    public static ASTEROID_SPEED: number = 2;
    public static ASTEROID_NUMBER_SIDES: number = 6;
    public static ASTEROID_STROKE_COLOR: string = '#fff';
    public static ASTEROID_RANDOM_ANGLE_OFFSET_MIN: number = -0.1;
    public static ASTEROID_RANDOM_ANGLE_OFFSET_MAX: number = 0.1;
    public static ASTEROID_RADIUS: number = 50;
    public static ASTEROID_BREAKUP_OFFSET: number = 5;

    // Game default settings
    public static GAME_ASTEROIDS_COUNT: number = 8;
    public static GAME_ASTEROIDS_COUNT_GROW: number = 0.75;
    public static GAME_ASTEROID_SPEED_INCREASE: number = 0.02;
    public static GAME_NUMBER_OF_LIVES: number = 3;
    public static GAME_EXTRA_LIFE_REWARD: number = 3500;
    public static GAME_MAX_LIVES: number = 6;

    // Score settings
    public static SCORE_ASTEROID_BY_BULLET: number = 20;
    public static SCORE_ASTEROID_BY_COLLISION: number = 10;
    public static SCORE_FIRE_BULLET: number = -1;

    // Message settings
    public static MESSAGE_DEFAULT_FONT: string = 'Digital';
    public static MESSAGE_DEFAULT_SIZE: string = '150px';
    public static MESSAGE_DEFAULT_STYLE: string = 'normal';
    public static MESSAGE_DEFAULT_FILL_STYLE: string = '#fff';
    public static MESSAGE_DEFAULT_STROKE_STYLE: string = null;
    public static MESSAGE_SUCCESS_RANDOM: string[] = [
        'Good Job',
        'Incredible',
        'On Fire',
        'Awesome',
        'Bring It On',
        'Smooth',
        'Own It',
        'Intense',
        'How Its Done',
        'Impressive',
        'Check It',
    ];

    /**
     * Keyboard settings
     *
     * a: KeyA
     * d: KeyD
     * l: KeyL
     * m: KeyM
     * w: KeyW
     * space: Space
     * arrow left, code: ArrowLeft
     * arrow right, code: ArrowRight
     * arrow up, code: ArrowUp
     * arrow down, code: ArrowDown
     */
    public static KEYS_SHIP_ROTATE_LEFT: string[] = ['KeyA', 'ArrowLeft'];
    public static KEYS_SHIP_ROTATE_RIGHT: string[] = ['KeyD', 'ArrowRight'];
    public static KEYS_SHIP_THRUST: string[] = ['KeyW', 'ArrowUp'];
    public static KEYS_BULLET_FIRE: string[] = ['Space', 'KeyM'];
    public static KEYS_GAME_PAUSE: string[] = ['KeyP'];
    public static KEYS_GAME_SOUND: string[] = ['KeyL'];

    // Music settings
    public static MUSIC_TEMPO: number = 1;
    public static MUSIC_MAX_BPS: number = 3;
    public static MUSIC_CONFIG: MusicConfig = {
        files: ['public/sounds/music-low.m4a', 'public/sounds/music-high.m4a'],
        volume: 1,
    };

    // Sound effect settings
    public static SOUND_EXPLODE: SoundEffectConfig = {
        file: 'public/sounds/explode.m4a',
        maxStreams: 1,
        volume: 1,
        loop: false,
    };
    public static SOUND_HIT: SoundEffectConfig = {
        file: 'public/sounds/hit.m4a',
        maxStreams: 5,
        volume: 0.5,
        loop: false,
    };
    public static SOUND_LASER: SoundEffectConfig = {
        file: 'public/sounds/laser.m4a',
        maxStreams: 5,
        volume: 0.5,
        loop: false,
    };
    public static SOUND_THRUST: SoundEffectConfig = {
        file: 'public/sounds/thrust.m4a',
        maxStreams: 1,
        volume: 1,
        loop: true,
    };
}

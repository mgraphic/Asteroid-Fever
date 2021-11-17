// import { Sound } from './sound';

export enum astroidLevelType {
    LEVEL1,
    LEVEL2,
    LEVEL3,
}

export type AsteroidBuildRequest = {
    level: astroidLevelType;
    count: number;
};

export type AsteroidCounter = {
    firstLevel: number;
    total: number;
    remaining: number;
};

export type CanvasContext = {
    context: CanvasRenderingContext2D;
    width: number;
    height: number;
};

export type Coordinates2D = {
    x: number;
    y: number;
};

export type KeyState = { [key: string]: boolean };

export type MessageConfigurator = {
    font?: string;
    size?: string;
    style?: string;
    blink?: boolean;
    scroll?: boolean;
    scrollSpeed?: number;
    fillStyle?: string | null;
    strokeStyle?: string | null;
    textAlign?: 'left' | 'right' | 'center' | 'start' | 'end';
    textBaseline?:
        | 'top'
        | 'hanging'
        | 'middle'
        | 'alphabetic'
        | 'ideographic'
        | 'bottom';
};

export type MusicConfig = {
    files: string[];
    volume: number;
};

export type ShapePoint = {
    radius: number;
    angle: number;
    index: number;
    curve: boolean;
};

export type SoundEffectConfig = {
    file: string;
    volume?: number;
    loop?: boolean;
    maxStreams?: number;
};

export type SpriteShape = {
    strokeStyle: string | null;
    fillStyle: string | null;
    points: ShapePoint[];
};

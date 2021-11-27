import { Config } from '../config';
import { AsteroidLevelTypes, CanvasContext, Coordinates2D } from '../models';
import { getRandomInRange } from '../utils';
import { AbstractSprite } from './abstract-sprite';

export class Asteroid extends AbstractSprite {
    protected angle: number;
    protected radius: number;
    private randomOffset: { x: number[]; y: number[] } = { x: [], y: [] };

    constructor(
        protected canvas: CanvasContext,
        protected centerPosition: Coordinates2D,
        private level: AsteroidLevelTypes,
        private speed: number
    ) {
        super();

        switch (this.level) {
            case AsteroidLevelTypes.LEVEL3:
                this.radius = Config.ASTEROID_RADIUS / 2 / 2;
                break;
            case AsteroidLevelTypes.LEVEL2:
                this.radius = Config.ASTEROID_RADIUS / 2;
                break;
            case AsteroidLevelTypes.LEVEL1:
                defualt: this.radius = Config.ASTEROID_RADIUS;
                break;
        }

        this.angle = Math.floor(Math.random() * 359);

        for (let i = 0; i < Config.ASTEROID_NUMBER_SIDES; i++) {
            this.randomOffset.x.push(
                getRandomInRange(
                    Config.ASTEROID_RANDOM_ANGLE_OFFSET_MIN,
                    Config.ASTEROID_RANDOM_ANGLE_OFFSET_MAX
                )
            );
            this.randomOffset.y.push(
                getRandomInRange(
                    Config.ASTEROID_RANDOM_ANGLE_OFFSET_MIN,
                    Config.ASTEROID_RANDOM_ANGLE_OFFSET_MAX
                )
            );
        }
    }

    public getLevel(): AsteroidLevelTypes {
        return this.level;
    }

    public getRadius(): number {
        return this.radius;
    }

    public move(): void {
        let { x, y }: Coordinates2D = this.centerPosition;

        x -= Math.cos(this.radians) * this.speed;
        y -= Math.sin(this.radians) * this.speed;

        if (x < 0) {
            x = this.canvas.width;
        }

        if (x > this.canvas.width) {
            x = 0;
        }

        if (y < 0) {
            y = this.canvas.height;
        }

        if (y > this.canvas.height) {
            y = 0;
        }

        this.centerPosition = { x, y };
    }

    public render(): void {
        const { x, y }: Coordinates2D = this.centerPosition;
        const vertAngle = (Math.PI * 2) / Config.ASTEROID_NUMBER_SIDES;

        this.canvas.context.strokeStyle = Config.ASTEROID_STROKE_COLOR;
        this.canvas.context.beginPath();

        for (let i = 0; i < Config.ASTEROID_NUMBER_SIDES; i++) {
            this.canvas.context.lineTo(
                x -
                    this.radius *
                        Math.cos(
                            (vertAngle + this.randomOffset.x[i]) * i +
                                this.radians
                        ),
                y -
                    this.radius *
                        Math.sin(
                            (vertAngle + this.randomOffset.y[i]) * i +
                                this.radians
                        )
            );
        }

        this.canvas.context.closePath();
        this.canvas.context.stroke();
    }
}

import { Config } from '../config';
import { CanvasContext, Coordinates2D } from '../models';
import { isBetween, radiusCollision, valueOfPercent } from '../utils';
import { AbstractSprite } from './abstract-sprite';

export class Bullet extends AbstractSprite {
    private distanceTracker: Coordinates2D = { x: 0, y: 0 };
    private show: boolean = true;

    constructor(
        protected canvas: CanvasContext,
        protected angle: number,
        protected centerPosition: Coordinates2D
    ) {
        super();
    }

    public isHidden(): boolean {
        return !this.show;
    }

    public animate(): void {
        let { x, y }: Coordinates2D = this.centerPosition;

        x -= Math.cos(this.radians) * Config.BULLET_SPEED;
        y -= Math.sin(this.radians) * Config.BULLET_SPEED;

        // continue with calculated travel path
        if (Config.BULLET_REPEAT_EDGES) {
            let xWrap: boolean = false;
            let yWrap: boolean = false;
            if (x < 0) {
                x = this.canvas.width;
                xWrap = true;
            }

            if (x > this.canvas.width) {
                x = 0;
                xWrap = true;
            }

            if (y < 0) {
                y = this.canvas.height;
                yWrap = true;
            }

            if (y > this.canvas.height) {
                y = 0;
                yWrap = true;
            }

            if (xWrap || this.distanceTracker.x > 0) {
                this.distanceTracker.x += Math.abs(
                    Math.cos(this.radians) * Config.BULLET_SPEED
                );
            }

            if (yWrap || this.distanceTracker.y > 0) {
                this.distanceTracker.y += Math.abs(
                    Math.sin(this.radians) * Config.BULLET_SPEED
                );
            }

            if (
                this.distanceTracker.x >
                    valueOfPercent(
                        this.canvas.width,
                        Config.BULLET_CONTINUE_XY_PERCENT
                    ) ||
                this.distanceTracker.y >
                    valueOfPercent(
                        this.canvas.height,
                        Config.BULLET_CONTINUE_XY_PERCENT
                    )
            ) {
                this.show = false;
            }
        }

        this.centerPosition = { x, y };
    }

    public render(): void {
        if (!this.show) {
            return;
        }
        this.canvas.context.fillStyle = Config.BULLET_FILL_STYLE;

        const { x, y }: Coordinates2D = this.centerPosition;

        this.canvas.context.fillRect(
            x,
            y,
            Config.BULLET_HEIGHT,
            Config.BULLET_HEIGHT
        );
    }
}

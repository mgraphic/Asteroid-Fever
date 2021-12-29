import { AbstractSprite } from './abstract-sprite';

import { Config } from '../config';
import { ShipSource, CanvasContext, Coordinates2D } from '../models';
import { valueOfPercent } from '../utils';

export class Bullet extends AbstractSprite {
    private distanceTracker: Coordinates2D = { x: 0, y: 0 };
    private show: boolean = true;

    constructor(
        protected canvas: CanvasContext,
        protected angle: number,
        protected centerPosition: Coordinates2D,
        private source: ShipSource
    ) {
        super();
    }

    public isHidden(): boolean {
        return !this.show;
    }

    public getSource(): ShipSource {
        return this.source;
    }

    public move(): void {
        let { x, y }: Coordinates2D = this.centerPosition;

        const velocity: Coordinates2D = {
            x: Math.cos(this.radians) * Config.BULLET_SPEED,
            y: Math.sin(this.radians) * Config.BULLET_SPEED,
        };

        x -= velocity.x;
        y -= velocity.y;

        this.distanceTracker.x += Math.abs(velocity.x);
        this.distanceTracker.y += Math.abs(velocity.y);

        // continue with calculated travel path
        if (Config.BULLET_REPEAT_EDGES) {
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
        }

        if (
            this.distanceTracker.x >=
                valueOfPercent(
                    this.canvas.width,
                    Config.BULLET_MAX_XY_DISTANCE_PERCENT
                ) ||
            this.distanceTracker.y >=
                valueOfPercent(
                    this.canvas.height,
                    Config.BULLET_MAX_XY_DISTANCE_PERCENT
                )
        ) {
            this.show = false;
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

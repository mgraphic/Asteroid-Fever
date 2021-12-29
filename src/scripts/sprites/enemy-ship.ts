import { CanvasContext, Coordinates2D, SpriteShape } from '../models';
import { Config } from '../config';
import { valueOfPercent } from '../utils';

import { AbstractSprite } from './abstract-sprite';
import { Enemy } from './enemy';

export class EnemyShip extends AbstractSprite {
    protected centerPosition: Coordinates2D;
    private radius: number;
    protected angle: number = 0;

    private rotateDirection: number = +1;

    constructor(
        protected canvas: CanvasContext,
        protected parentContainer: Enemy
    ) {
        super();
        this.radius = this.parentContainer.getRadius();
    }

    public setCenterPosition(position: Coordinates2D): void {
        this.centerPosition = position;
    }

    public move(): void {
        this.angle +=
            this.rotateDirection > 0
                ? Config.ENEMY_ROCKER_SPEED
                : -Config.ENEMY_ROCKER_SPEED;

        if (Math.abs(this.angle) > Config.ENEMY_ROCKER_TILT) {
            this.rotateDirection = -this.rotateDirection;
        }
    }

    public render(): void {
        const lineWidth: number = this.canvas.context.lineWidth;
        const sides: number = 6;

        const { x, y }: Coordinates2D = this.centerPosition;

        this.canvas.context.strokeStyle = Config.ENEMY_STROKE_COLOR;
        this.canvas.context.lineWidth = Config.ENEMY_STROKE_LINE_WIDTH;

        const vertAngle = (Math.PI * 2) / sides;

        const shapes: SpriteShape[] = [
            {
                // ship
                strokeStyle: Config.ENEMY_STROKE_COLOR,
                fillStyle: null,
                points: [
                    {
                        radius: this.radius,
                        angle: vertAngle,
                        curve: false,
                    },
                    {
                        radius: valueOfPercent(this.radius, 70),
                        angle: vertAngle,
                        curve: false,
                    },
                    {
                        radius: valueOfPercent(this.radius, 70),
                        angle: vertAngle,
                        curve: false,
                    },
                    {
                        radius: this.radius,
                        angle: vertAngle,
                        curve: false,
                    },
                    {
                        radius: valueOfPercent(this.radius, 70),
                        angle: vertAngle,
                        curve: false,
                    },
                    {
                        radius: valueOfPercent(this.radius, 70),
                        angle: vertAngle,
                        curve: false,
                    },
                ],
            },
        ];

        shapes.forEach((shape) => {
            this.canvas.context.beginPath();
            shape.points.forEach(({ radius, angle, curve }, index: number) => {
                if (curve) {
                    this.canvas.context.quadraticCurveTo(
                        x,
                        y,
                        x - radius * Math.cos(angle * index + this.radians),
                        y - radius * Math.sin(angle * index + this.radians)
                    );
                } else {
                    this.canvas.context.lineTo(
                        x - radius * Math.cos(angle * index + this.radians),
                        y - radius * Math.sin(angle * index + this.radians)
                    );
                }
            });

            this.canvas.context.closePath();
            if (shape.fillStyle) {
                this.canvas.context.fillStyle = shape.fillStyle;
                this.canvas.context.fill();
            }
            if (shape.strokeStyle) {
                this.canvas.context.strokeStyle = shape.strokeStyle;
                this.canvas.context.stroke();
            }
        });

        const w = this.radius;
        this.canvas.context.beginPath();
        this.canvas.context.lineTo(
            x - w * Math.cos(this.angle * 0 + this.radians),
            y - w * Math.sin(this.angle * 0 + this.radians)
        );
        this.canvas.context.lineTo(
            x + w * Math.cos(this.angle * 0 + this.radians),
            y + w * Math.sin(this.angle * 0 + this.radians)
        );
        this.canvas.context.strokeStyle = Config.ENEMY_STROKE_COLOR;
        this.canvas.context.lineWidth = valueOfPercent(this.radius, 20);
        this.canvas.context.stroke();

        // reset line width
        this.canvas.context.lineWidth = lineWidth;
    }
}

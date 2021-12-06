import { Config } from '../config';
import { CanvasContext, Coordinates2D, SpriteShape } from '../models';
import {
    getCenterCoordinatesOfCanvas,
    getRandomInRange,
    valueOfPercent,
} from '../utils';
import { AbstractSprite } from './abstract-sprite';
import { Enemy } from './enemy';

export class EnemyShip extends AbstractSprite {
    // private debug: boolean = !true;

    // protected centerPosition: Coordinates2D;
    // private nosePosition: Coordinates2D;
    // private velocityPosition: Coordinates2D;
    private inMotion: boolean = false;
    private radius: number;
    protected angle: number = 0;
    // private hidden: boolean = false;
    // private display: boolean = true;

    private rotateDirection: number = +1;

    constructor(
        protected canvas: CanvasContext,
        protected centerPosition: Coordinates2D //  private radius: number
    ) // private enemy: Enemy
    {
        super();
        // this.reset();
        // this.radius = this.enemy.getRadius();
        // this.centerPosition=this.enemy.getCenterPosition();
    }

    // public reset(): void {
    //     this.centerPosition = getCenterCoordinatesOfCanvas(this.canvas);
    //     // this.velocityPosition = { x: 0, y: 0 };
    //     // this.angle = 0;
    // }

    public move(): void {
        // this.centerPosition = this.enemy.getCenterPosition();

        const rotateSpeed: number = 0.00018;
        const rockerMax: number = 0.002;

        this.angle += this.rotateDirection > 0 ? rotateSpeed : -rotateSpeed;

        if (Math.abs(this.angle) > rockerMax) {
            this.rotateDirection = -this.rotateDirection;
        }
        // console.log(this.angle);

        // const speed = 1;

        // let { x, y }: Coordinates2D = this.centerPosition;

        // x -= Math.cos(this.radians) * speed;
        // y -= Math.sin(this.radians) * speed;

        // if (x < 0) {
        //     x = this.canvas.width;
        // }

        // if (x > this.canvas.width) {
        //     x = 0;
        // }

        // if (y < 0) {
        //     y = this.canvas.height;
        // }

        // if (y > this.canvas.height) {
        //     y = 0;
        // }

        // this.centerPosition = { x, y };
    }

    public Xrender(): void {
        // this.centerPosition = this.enemy.getCenterPosition();

        const { x, y }: Coordinates2D = this.centerPosition;

        // this.guidelines();
        const vertAngle = (Math.PI * 2) / Config.ASTEROID_NUMBER_SIDES;

        this.canvas.context.strokeStyle = 'green';
        this.canvas.context.beginPath();

        for (let i = 0; i < Config.ASTEROID_NUMBER_SIDES; i++) {
            this.canvas.context.lineTo(
                x - this.radius * Math.cos(vertAngle * i + this.radians),
                y - this.radius * Math.sin(vertAngle * i + this.radians)
            );
        }

        this.canvas.context.closePath();
        this.canvas.context.stroke();
    }

    public render(): void {
        // this.centerPosition = this.enemy.getCenterPosition();

        // if (!this.display) {
        //     return;
        // }
        const sides: number = 6;

        const { x, y }: Coordinates2D = this.centerPosition;

        this.canvas.context.strokeStyle = Config.SHIP_STROKE_COLOR;
        this.canvas.context.lineWidth = Config.SHIP_STROKE_LINE_WIDTH;

        const vertAngle = (Math.PI * 2) / sides;

        // this.guidelines();

        const shapes: SpriteShape[] = [
            {
                // ship
                strokeStyle: 'white',
                fillStyle: null,
                points: [
                    {
                        radius: this.radius,
                        angle: vertAngle,
                        // index: 0,
                        curve: false,
                    },
                    {
                        // radius: this.radius - 20,
                        radius: valueOfPercent(this.radius, 70),
                        angle: vertAngle,
                        //  - 0.4,
                        // + 0.4
                        // index: 1,
                        curve: false,
                    },
                    {
                        // radius: this.radius - 20,
                        radius: valueOfPercent(this.radius, 70),
                        angle: vertAngle,
                        //  + 0.2,
                        //  - 0.2
                        // index: 2,
                        curve: false,
                    },
                    {
                        radius: this.radius,
                        angle: vertAngle,
                        // index: 3,
                        curve: false,
                    },
                    {
                        // radius: this.radius - 20,
                        radius: valueOfPercent(this.radius, 70),
                        angle: vertAngle,
                        //  + 1.5,
                        // + 0.4
                        // index: 4,
                        curve: false,
                    },
                    {
                        // radius: this.radius - 20,
                        radius: valueOfPercent(this.radius, 70),
                        angle: vertAngle,
                        //  - 1.2,
                        //  - 0.2
                        // index: 5,
                        curve: false,
                    },
                ],
            },
        ];

        // const vertAngle2 = (Math.PI * 2) / sides;
        // if (this.inMotion) {
        // shapes.push({
        //     // thrust
        //     strokeStyle: 'red',
        //     fillStyle: 'white',
        //     points: [
        //         {
        //             radius: this.radius,
        //             angle: vertAngle2,
        //             index: 1,
        //             curve: false,
        //         },
        //         {
        //             radius: this.radius,
        //             angle: vertAngle2,
        //             index: 2,
        //             curve: false,
        //         },
        //         // {
        //         //     radius:
        //         //         this.radius - this.radius * getRandomInRange(2.5, 3),
        //         //     angle: vertAngle,
        //         //     index: 3,
        //         //     curve: false,
        //         // },
        //     ],
        // });
        // }

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

        // this.Xrender();

        const w = this.radius;
        // valueOfPercent(this.radius, 125);
        this.canvas.context.beginPath();
        this.canvas.context.lineTo(
            x - w * Math.cos(this.angle * 0 + this.radians),
            y - w * Math.sin(this.angle * 0 + this.radians)
        );
        this.canvas.context.lineTo(
            x + w * Math.cos(this.angle * 0 + this.radians),
            y + w * Math.sin(this.angle * 0 + this.radians)
        );
        this.canvas.context.strokeStyle = 'white';
        this.canvas.context.lineWidth = valueOfPercent(this.radius, 20);
        // this.canvas.context.lineCap = 'round';
        this.canvas.context.stroke();
    }
}

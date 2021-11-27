import { Config } from '../config';
import { CanvasContext, Coordinates2D, SpriteShape } from '../models';
import { getCenterCoordinatesOfCanvas, getRandomInRange } from '../utils';
import { AbstractSprite } from './abstract-sprite';

export class Ship extends AbstractSprite {
    private debug: boolean = false;

    protected centerPosition: Coordinates2D;
    private nosePosition: Coordinates2D;
    private velocityPosition: Coordinates2D;
    private inMotion: boolean = false;
    private radius: number = 15; //15;
    protected angle: number = 0;
    private hidden: boolean = false;
    private display: boolean = true;

    constructor(protected canvas: CanvasContext) {
        super();
        this.reset();
    }

    public reset(): void {
        this.centerPosition = getCenterCoordinatesOfCanvas(this.canvas);
        this.velocityPosition = { x: 0, y: 0 };
        this.angle = 0;
    }

    public manifest(): void {
        let cycles: number = 0;

        this.hidden = false;

        const loop: () => void = () => {
            setTimeout((): void => {
                if (cycles <= Config.SHIP_MANIFEST_CYCLE_LOOPS) {
                    this.display = !this.display;
                    cycles++;
                    loop();
                } else {
                    this.display = true;
                }
            }, Config.SHIP_MANIFEST_CYCLE_TIMER);
        };

        loop();
    }

    public getNosePosition(): Coordinates2D {
        return this.nosePosition || this.centerPosition;
    }

    public toggleThrust(state?: boolean): void {
        this.inMotion = state !== undefined ? state : !this.inMotion;
    }

    public rotate(direction: number): void {
        this.angle += Config.SHIP_ROTATE_SPEED * direction;
    }

    public getRadius(): number {
        return this.radius;
    }

    public isHidden(): boolean {
        return this.hidden;
    }

    public hide(): void {
        this.display = false;
        this.hidden = true;
    }

    public move(): void {
        if (this.hidden) {
            return;
        }

        // If moving forward calculate changing values of x & y
        // If you want to find the new point x use the
        // formula oldX + cos(radians) * distance
        // Forumla for y oldY + sin(radians) * distance
        if (this.inMotion) {
            this.velocityPosition.x +=
                Math.cos(this.radians) * Config.SHIP_THRUST_SPEED;
            this.velocityPosition.y +=
                Math.sin(this.radians) * Config.SHIP_THRUST_SPEED;
        }

        // If ship goes off board place it on the opposite side
        if (this.centerPosition.x < 0) {
            this.centerPosition.x = this.canvas.width;
        }

        if (this.centerPosition.x > this.canvas.width) {
            this.centerPosition.x = 0;
        }

        if (this.centerPosition.y < 0) {
            this.centerPosition.y = this.canvas.height;
        }

        if (this.centerPosition.y > this.canvas.height) {
            this.centerPosition.y = 0;
        }

        this.velocityPosition.x *= 0.99;
        this.velocityPosition.y *= 0.99;

        // Change value of x & y while accounting for air friction
        this.centerPosition.x -= this.velocityPosition.x;
        this.centerPosition.y -= this.velocityPosition.y;
    }

    public render(): void {
        if (!this.display) {
            return;
        }

        const { x, y }: Coordinates2D = this.centerPosition;

        this.canvas.context.strokeStyle = Config.SHIP_STROKE_COLOR;
        this.canvas.context.lineWidth = Config.SHIP_STROKE_LINE_WIDTH;

        const vertAngle = (Math.PI * 2) / 3;

        this.nosePosition = {
            x: x - this.radius * Math.cos(this.radians),
            y: y - this.radius * Math.sin(this.radians),
        };

        this.guidelines();

        const shapes: SpriteShape[] = [
            {
                // ship
                strokeStyle: 'white',
                fillStyle: null,
                points: [
                    {
                        radius: this.radius,
                        angle: vertAngle,
                        index: 0,
                        curve: false,
                    },
                    {
                        radius: this.radius,
                        angle: vertAngle + 0.4,
                        index: 1,
                        curve: false,
                    },
                    {
                        radius: this.radius,
                        angle: vertAngle - 0.2,
                        index: 2,
                        curve: true,
                    },
                ],
            },
        ];

        if (this.inMotion) {
            shapes.push({
                // thrust
                strokeStyle: null,
                fillStyle: 'white',
                points: [
                    {
                        radius: this.radius,
                        angle: vertAngle + 0.8,
                        index: 1,
                        curve: false,
                    },
                    {
                        radius: this.radius,
                        angle: vertAngle - 0.4,
                        index: 2,
                        curve: true,
                    },
                    {
                        radius:
                            this.radius -
                            this.radius * getRandomInRange(2.5, 3),
                        angle: vertAngle,
                        index: 3,
                        curve: false,
                    },
                ],
            });
        }

        shapes.forEach((shape) => {
            this.canvas.context.beginPath();
            shape.points.forEach(({ radius, angle, index, curve }) => {
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
    }

    guidelines() {
        if (!this.debug || !this.display) return;

        const { x, y }: Coordinates2D = this.centerPosition;

        this.canvas.context.lineWidth = Config.SHIP_STROKE_LINE_WIDTH;

        // cross hairs
        this.canvas.context.strokeStyle = 'aqua';
        this.canvas.context.beginPath();
        this.canvas.context.moveTo(x, 0);
        this.canvas.context.lineTo(x, this.canvas.height);
        this.canvas.context.moveTo(0, y);
        this.canvas.context.lineTo(this.canvas.width, y);
        this.canvas.context.closePath();
        this.canvas.context.stroke();
        // circle
        this.canvas.context.strokeStyle = 'green';
        this.canvas.context.beginPath();
        this.canvas.context.moveTo(x, y);
        this.canvas.context.arc(x, y, this.radius, 0, Math.PI * 2);
        this.canvas.context.closePath();
        this.canvas.context.stroke();
        // nose pointer
        this.canvas.context.strokeStyle = 'orange';
        this.canvas.context.beginPath();
        this.canvas.context.moveTo(this.nosePosition.x, this.nosePosition.y);
        this.canvas.context.lineTo(this.nosePosition.x, this.canvas.height);
        this.canvas.context.closePath();
        this.canvas.context.stroke();
    }
}

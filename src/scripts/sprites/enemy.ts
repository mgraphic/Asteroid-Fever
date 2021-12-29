import { Config } from '../config';
import { CanvasContext, Coordinates2D } from '../models';
import { EnemyShip } from './enemy-ship';
import { getRandomInRange, valueOfPercent } from '../utils';

export class Enemy {
    private debug: boolean = false;

    private centerPosition: Coordinates2D;
    private enemyShip: EnemyShip;
    private angle: number;
    private startingPosition: number;
    private radius: number = 18;
    private active: boolean = false;

    public constructor(
        private canvas: CanvasContext,
        private onDie: () => void
    ) {}

    public start(): void {
        if (this.active) {
            return;
        }

        this.active = true;
        this.startingPosition = Math.round(Math.random());
        this.angle = this.startingPosition === 1 ? 0 : 180;

        const x: number =
            this.startingPosition > 0
                ? this.canvas.width + this.radius
                : -this.radius;
        const percentageOfCanvasHeight: number = Math.floor(
            valueOfPercent(
                this.canvas.height,
                Config.ENEMY_Y_ENTRY_POINT_PERCENTAGE
            )
        );
        const y: number = getRandomInRange(
            percentageOfCanvasHeight,
            this.canvas.height - percentageOfCanvasHeight
        );

        this.centerPosition = { x, y };

        this.enemyShip = new EnemyShip(this.canvas, this);
        this.enemyShip.setCenterPosition(this.centerPosition);
    }

    public die(): void {
        if (!this.active) {
            return;
        }

        this.active = false;
        this.onDie();
        this.enemyShip = undefined;
    }

    public isActive(): boolean {
        return this.active;
    }

    public getPosition(): Coordinates2D {
        return this.centerPosition;
    }

    public getRadius(): number {
        return this.radius;
    }

    public move(): void {
        if (!this.active) {
            return;
        }

        const radians: number = (this.angle / Math.PI) * 180;
        const speed: number =
            this.startingPosition === 1
                ? -Config.ENEMY_SPEED
                : Config.ENEMY_SPEED;

        this.centerPosition.x += speed;

        if (
            (this.startingPosition === 0 &&
                this.centerPosition.x > this.canvas.width + this.radius) ||
            (this.startingPosition === 1 &&
                this.centerPosition.x < -this.radius)
        ) {
            this.die();
        }
    }

    public animate(): void {
        if (!this.active) {
            return;
        }

        this.enemyShip.animate();
        this.enemyShip.setCenterPosition(this.centerPosition);
        this.move();

        this.guidelines();
    }

    guidelines() {
        if (!this.debug) return;

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
    }
}

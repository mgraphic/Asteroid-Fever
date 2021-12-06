import { CanvasContext, Coordinates2D } from '../models';
import { getRandomInRange, valueOfPercent } from '../utils';
import { EnemyContainer } from './enemy-container';
import { EnemyShip } from './enemy-ship';
import { Ship } from './ship';

export class Enemy {
    private centerPosition: Coordinates2D;
    private enemyContainer: EnemyContainer;
    private enemyShip: EnemyShip;
    // private angle:
    private radius: number = 18;
    private active: boolean = false;

    public constructor(
        private canvas: CanvasContext,
        private playerShip: Ship // private fnFireBullet: VoidFunction, // private fnExplode: VoidFunction
    ) {}

    public start(): void {
        if (this.active) {
            return;
        }

        this.active = true;

        const startingPosition: number = Math.round(Math.random());
        const angle: number = startingPosition > 0 ? 180 : 0;
        const x: number =
            startingPosition > 0
                ? this.canvas.width + this.radius
                : -this.radius;
        const percentageOfCanvasHeight: number = Math.floor(
            valueOfPercent(this.canvas.height, 33)
        );
        const y: number = getRandomInRange(
            percentageOfCanvasHeight,
            this.canvas.height - percentageOfCanvasHeight
        );

        // const startX: number = startingPosition > 0 ? this.canvas.width + this.radius : -this.radius;

        // this.centerPosition = {
        //     x: -this.radius,
        //     y: getRandomInRange(
        //         percentageOfY,
        //         this.canvas.height - percentageOfY
        //     ),
        // };

        // console.log(
        //     // startX,
        //     startingPosition,
        //     this.canvas.height,
        //     // percentageOfY,
        //     // this.canvas.height - percentageOfY,
        //     this.centerPosition
        // );

        // console.log({
        //     startingPosition,
        //     angle,
        //     percentageOfCanvasHeight,
        //     x,
        //     y,
        // });
        this.centerPosition = { x, y };

        this.enemyContainer = new EnemyContainer(
            this.canvas,
            this.centerPosition,
            angle
        );
        this.enemyShip = new EnemyShip(this.canvas, this.centerPosition);
    }

    public die(): void {
        if (!this.active) {
            return;
        }
    }

    public getPosition(): Coordinates2D {
        return this.centerPosition;
    }

    public getRadius(): number {
        return this.radius;
    }

    public animate(): void {
        if (this.active) {
            this.enemyContainer.render();
            this.enemyShip.render();
        }
    }
}

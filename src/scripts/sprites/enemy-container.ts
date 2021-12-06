import { Config } from '../config';
import { Coordinates2D, CanvasContext } from '../models';
import { getCenterCoordinatesOfCanvas } from '../utils';
import { AbstractSprite } from './abstract-sprite';
import { EnemyShip } from './enemy-ship';

export class EnemyContainer extends AbstractSprite {
    private debug: boolean = true;
    // protected centerPosition: Coordinates2D;
    // protected angle: number = 0;
    private radius: number = 18; //15;
    private ship: EnemyShip;
    // protected canvas: CanvasContext;
    private display: boolean = true;

    public constructor(
        protected canvas: CanvasContext,
        protected centerPosition: Coordinates2D,
        protected angle: number
    ) {
        super();
        // this.centerPosition = getCenterCoordinatesOfCanvas(this.canvas);
        // this.ship = new EnemyShip(this.canvas, this.radius);
        // this.ship = new EnemyShip(this.canvas);
    }

    public animate(): void {
        super.animate();
        this.ship.animate();
    }

    public getRadius(): number {
        return this.radius;
    }

    public getCenterPosition(): Coordinates2D {
        return this.centerPosition;
    }

    public move(): void {
        // throw new Error('Method not implemented.');
        // animate ship
        // this.ship.animate();
    }

    public render(): void {
        // throw new Error('Method not implemented.');
        const { x, y }: Coordinates2D = this.centerPosition;

        this.canvas.context.lineWidth = Config.SHIP_STROKE_LINE_WIDTH;

        this.guidelines();

        // // cross hairs
        // this.canvas.context.strokeStyle = 'aqua';
        // this.canvas.context.beginPath();
        // this.canvas.context.moveTo(x, 0);
        // this.canvas.context.lineTo(x, this.canvas.height);
        // this.canvas.context.moveTo(0, y);
        // this.canvas.context.lineTo(this.canvas.width, y);
        // this.canvas.context.closePath();
        // this.canvas.context.stroke();
        // // circle
        // this.canvas.context.strokeStyle = 'green';
        // this.canvas.context.beginPath();
        // this.canvas.context.moveTo(x, y);
        // this.canvas.context.arc(x, y, this.radius, 0, Math.PI * 2);
        // this.canvas.context.closePath();
        // this.canvas.context.stroke();

        // render ship
        // this.ship.render();
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
    }
}

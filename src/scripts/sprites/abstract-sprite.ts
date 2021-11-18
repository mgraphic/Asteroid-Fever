import { CanvasContext, Coordinates2D } from '../models';

export abstract class AbstractSprite {
    protected abstract centerPosition: Coordinates2D;
    protected abstract angle: number;
    protected abstract canvas: CanvasContext;

    protected get radians(): number {
        return (this.angle / Math.PI) * 180;
    }

    public abstract animate(): void;
    public abstract render(): void;

    public getAngle(): number {
        return this.angle;
    }

    public getCenterPosition(): Coordinates2D {
        return this.centerPosition;
    }
}

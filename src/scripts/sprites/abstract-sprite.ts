import { CanvasContext, Coordinates2D } from '../models';

export abstract class AbstractSprite {
    protected abstract centerPosition: Coordinates2D;
    protected abstract angle: number;
    protected abstract canvas: CanvasContext;

    private _radians: number;

    public abstract animate(): void;
    public abstract render(): void;

    protected get radians(): number {
        if (this._radians !== undefined) {
            return this._radians;
        }

        return (this.angle / Math.PI) * 180;
    }

    public getAngle(): number {
        return this.angle;
    }

    public getCenterPosition(): Coordinates2D {
        return this.centerPosition;
    }
}

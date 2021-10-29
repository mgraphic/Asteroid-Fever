import { CanvasContext, Coordinates2D } from '../models';
import { AbstractSprite } from './abstract-sprite';
import { Explosion } from './explosion';

export class ExplosionParticle extends AbstractSprite {
    protected centerPosition: Coordinates2D;
    protected angle: number = 0;
    private alpha: number = 1;

    constructor(
        protected canvas: CanvasContext,
        private explosion: Explosion,
        private radius: number,
        private offsetX: number,
        private offsetY: number
    ) {
        super();
        this.centerPosition = { ...explosion.getCenterPosition() };
    }

    public isHidden(): boolean {
        return this.alpha <= 0;
    }

    public animate(): void {
        this.alpha -= 0.007;
        if (this.alpha < 0) {
            this.alpha = 0;
        }

        this.centerPosition.x += this.offsetX;
        this.centerPosition.y += this.offsetY;
    }

    public render(): void {
        this.canvas.context.save();
        this.canvas.context.globalAlpha = this.alpha;
        this.canvas.context.fillStyle = 'white';
        this.canvas.context.beginPath();
        this.canvas.context.arc(
            this.centerPosition.x,
            this.centerPosition.y,
            this.radius,
            0,
            Math.PI * 2,
            false
        );
        this.canvas.context.fill();
        this.canvas.context.globalAlpha = 1;
        this.canvas.context.restore();
    }
}

import { CanvasContext, Coordinates2D } from '../models';
import { getRandomInRange } from '../utils';
import { AbstractSprite } from './abstract-sprite';
import { ExplosionParticle } from './explosion-particle';

export class Explosion extends AbstractSprite {
    protected angle: number = 0;
    private particles: ExplosionParticle[] = [];

    constructor(
        protected canvas: CanvasContext,
        protected centerPosition: Coordinates2D
    ) {
        super();
        this.createParticles();
    }

    private createParticles(): void {
        for (let i = 0; i <= 100; i++) {
            const offsetX: number = (Math.random() - 0.5) * (Math.random() * 5);
            const offsetY: number = (Math.random() - 0.5) * (Math.random() * 5);
            const radius: number = getRandomInRange(1, 2);

            this.particles.push(
                new ExplosionParticle(
                    this.canvas,
                    this,
                    radius,
                    offsetX,
                    offsetY
                )
            );
        }
    }

    public isHidden(): boolean {
        return this.particles.every((particle: ExplosionParticle): boolean =>
            particle.isHidden()
        );
    }

    public animate(): void {
        // do nothing, render method doing everything
    }

    public render(): void {
        this.particles.forEach(
            (particle: ExplosionParticle, idx: number): void => {
                if (particle.isHidden()) {
                    this.particles.splice(idx, 1);
                } else {
                    particle.render();
                    particle.animate();
                }
            }
        );
    }
}

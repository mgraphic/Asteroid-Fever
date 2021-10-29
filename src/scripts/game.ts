import '../styles/index.scss';

import { Asteroid } from './sprites/asteroid';
import {
    astroidLevelType,
    CanvasContext,
    Coordinates2D,
    KeyAction,
} from './models';
import { Bullet } from './sprites/bullet';
import { Config } from './config';
import {
    drawSegment,
    getCenterCoordinatesOfCanvas,
    getRandomCanvasCoordinates,
    getRandomInRange,
    radiusCollision,
} from './utils';
import { Explosion } from './sprites/explosion';
import { Message } from './sprites/message';
import { Ship } from './sprites/ship';

export class Game {
    // Default values:
    private lives: number = 3;
    private score: number = 0;
    private highScore: number = 0;
    private level: number = 1;
    private transitioning: boolean = false;
    private asteroidsCount: number = Config.GAME_ASTEROIDS_COUNT;
    private asteroidSpeed: number = Config.ASTEROID_SPEED;

    // Element containers:
    private gameBoardElement: HTMLElement;
    private canvasElement: HTMLCanvasElement;
    private currentScoreElement: HTMLElement;
    private highScoreElement: HTMLElement;
    private levelElement: HTMLElement;
    private livesElement: HTMLElement;

    // Game state:
    private ship: Ship;
    private canvas: CanvasContext;
    private bullets: Bullet[] = [];
    private asteroids: Asteroid[] = [];
    private explosions: Explosion[] = [];
    private messages: Message[] = [];
    private localStorage: Storage = window.localStorage;
    private demoTimers: NodeJS.Timeout[] = [];
    private action: KeyAction = {
        RotateLeft: false,
        RotateRight: false,
        Thrust: false,
        Pause: false,
        Demo: true,
    };

    public constructor(gameBoard: HTMLElement) {
        this.gameBoardElement = gameBoard;
        this.highScore = Number(this.localStorage.getItem('highScore') ?? 0);
    }

    public run(): void {
        const ledgerElement: HTMLElement = drawSegment(
            'ledger',
            this.gameBoardElement
        );
        const currentScoreContainer: HTMLElement = drawSegment(
            'score-container',
            ledgerElement
        );
        currentScoreContainer.innerHTML = 'Score: ';

        this.currentScoreElement = drawSegment(
            'score',
            currentScoreContainer,
            'span'
        );
        this.currentScoreElement.innerHTML = String(this.score);

        const highScoreContainer: HTMLElement = drawSegment(
            'score-container',
            ledgerElement
        );
        highScoreContainer.innerHTML = 'Hight Score: ';

        this.highScoreElement = drawSegment(
            'score',
            highScoreContainer,
            'span'
        );
        this.highScoreElement.innerHTML = String(this.highScore);

        const levelContainer: HTMLElement = drawSegment(
            'score-container',
            ledgerElement
        );
        levelContainer.innerHTML = 'Level: ';

        this.levelElement = drawSegment('score', levelContainer, 'span');
        this.levelElement.innerHTML = String(this.level + 1);

        const livesContainer: HTMLElement = drawSegment(
            'score-container',
            ledgerElement
        );
        livesContainer.innerHTML = 'Lives: ';

        this.livesElement = drawSegment('lives', livesContainer, 'span');
        this.refreshLivesDisplay();

        this.canvasElement = <HTMLCanvasElement>(
            drawSegment(
                ['canvas', 'click-to-start'],
                this.gameBoardElement,
                'canvas'
            )
        );

        this.canvasElement.addEventListener('click', this.startGame.bind(this));

        this.canvas = {
            context: this.canvasElement.getContext('2d'),
            width: this.gameBoardElement.clientWidth,
            height: this.gameBoardElement.clientHeight,
        };

        this.canvasElement.width = this.canvas.width;
        this.canvasElement.height = this.canvas.height;

        document.body.addEventListener('keyup', this.keyUpHandler.bind(this));
        document.body.addEventListener(
            'keydown',
            this.keyDownHandler.bind(this)
        );

        this.ship = new Ship(this.canvas);
        this.ship.hide();
        this.startDemo();
        this.animate();
    }

    private reset(): void {
        this.asteroidsCount = Config.GAME_ASTEROIDS_COUNT;
        this.asteroidSpeed = Config.ASTEROID_SPEED;
        this.lives = 3;
        this.score = 0;
        this.level = 1;
        this.bullets = [];
        this.asteroids = [];
        this.explosions = [];
        this.messages = [];
        this.action.RotateLeft = false;
        this.action.RotateRight = false;
        this.action.Thrust = false;
        this.ship.reset();
    }

    private restartShip(): void {
        if (this.explosions.length === 0) {
            const allClear: boolean = this.asteroids.every(
                (asteroid: Asteroid): boolean =>
                    !radiusCollision(
                        asteroid.getCenterPosition(),
                        asteroid.getRadius(),
                        getCenterCoordinatesOfCanvas(this.canvas),
                        Config.SHIP_MANIFEST_RADIUS
                    )
            );

            if (allClear) {
                this.ship.hide();
                this.ship.reset();
                this.ship.manifest();

                if (!this.action.Demo) {
                    this.refreshLivesDisplay();
                }
            }
        }
    }

    private endLife(): void {
        this.explosions.push(
            new Explosion(this.canvas, this.ship.getCenterPosition())
        );

        if (!this.action.Demo) {
            this.lives--;

            if (this.lives < 0) {
                this.endGame();
                return;
            }
        }
    }

    private refreshLivesDisplay(): void {
        if (this.lives > 0) {
            this.livesElement.innerHTML = String('&#9651;').repeat(this.lives);
        } else {
            this.livesElement.innerHTML = '---';
        }
    }

    private refreshLevelDisplay(): void {
        this.levelElement.innerHTML = String(this.level);
    }

    private startDemo(): void {
        this.action.Demo = true;
        this.asteroids = [];

        this.messages.push(
            new Message(
                this.canvas,
                getCenterCoordinatesOfCanvas(this.canvas),
                'Asteroid Fever',
                {
                    blink: !true,
                    scroll: true,
                    scrollSpeed: 2,
                    fillStyle: null,
                    strokeStyle: '#fff',
                }
            )
        );

        // move ship
        {
            const loop: () => void = (): void => {
                const timer: number = Math.round(getRandomInRange(1000, 5000));
                this.demoTimers.push(
                    setTimeout((): void => {
                        this.action.Thrust = !this.action.Thrust;
                        loop();
                    }, timer)
                );
            };
            loop();
        }

        // rotate ship
        {
            const loop: () => void = (): void => {
                const timer: number = Math.round(getRandomInRange(1000, 5000));
                const dir = Math.round(getRandomInRange(-1, 1));
                this.demoTimers.push(
                    setTimeout((): void => {
                        if (dir < 0) {
                            this.action.RotateLeft = true;
                            this.action.RotateRight = false;
                        } else if (dir > 0) {
                            this.action.RotateLeft = false;
                            this.action.RotateRight = true;
                        } else {
                            this.action.RotateLeft = false;
                            this.action.RotateRight = false;
                        }
                        loop();
                    }, timer)
                );
            };
            loop();
        }

        // fire bullets
        {
            const loop: () => void = (): void => {
                const timer: number = Math.round(getRandomInRange(120, 500));
                this.demoTimers.push(
                    setTimeout((): void => {
                        this.fireBullet();
                        loop();
                    }, timer)
                );
            };
            loop();
        }

        this.startLevel();
    }

    private endDemo(): void {
        this.ship.hide();
        this.demoTimers.forEach((timer: NodeJS.Timeout): void => {
            clearTimeout(timer);
        });
        this.demoTimers = [];
        this.messages = [];
        this.action.Demo = false;
    }

    private async wait(timer: number) {
        return new Promise((resolve) => setTimeout(resolve, timer));
    }

    private async startGame(): Promise<void> {
        if (!this.action.Demo) {
            return;
        }

        this.canvasElement.classList.remove('click-to-start');
        this.endDemo();
        this.reset();
        this.refreshLivesDisplay();
        this.startLevel();
    }

    private async endGame(): Promise<void> {
        this.transitioning = true;
        this.ship.hide();
        this.messages.push(
            new Message(
                this.canvas,
                getCenterCoordinatesOfCanvas(this.canvas),
                'Game Over'
            )
        );
        await this.wait(5000);
        this.messages = [];
        this.startDemo();
        this.canvasElement.classList.add('click-to-start');
    }

    private async startLevel(): Promise<void> {
        this.transitioning = true;
        this.refreshLevelDisplay();

        if (!this.action.Demo) {
            this.messages.push(
                new Message(
                    this.canvas,
                    getCenterCoordinatesOfCanvas(this.canvas),
                    'Get Ready'
                )
            );
            await this.wait(2000);
            this.messages = [];
        }

        for (let i = 0; i < this.asteroidsCount; i++) {
            let allClear: boolean;
            let randomCoordinates: Coordinates2D;

            while (!allClear) {
                randomCoordinates = getRandomCanvasCoordinates(this.canvas);
                allClear = !radiusCollision(
                    randomCoordinates,
                    Config.ASTEROID_RADIUS,
                    this.ship.getCenterPosition(),
                    Config.SHIP_MANIFEST_RADIUS
                );
            }

            this.pushAsteroid(randomCoordinates);
        }

        this.transitioning = false;
    }

    private async endLevel(): Promise<void> {
        this.transitioning = true;

        if (!this.action.Demo) {
            this.level++;
            this.asteroidsCount++;
            this.asteroidSpeed += Config.ASTEROID_SPEED_INCREASE;

            this.messages.push(
                new Message(
                    this.canvas,
                    getCenterCoordinatesOfCanvas(this.canvas),
                    Config.MESSAGE_SUCCESS_RANDOM[
                        Math.floor(
                            Math.random() * Config.MESSAGE_SUCCESS_RANDOM.length
                        )
                    ]
                )
            );
            await this.wait(2000);
            this.messages = [];
        }

        this.startLevel();
    }

    private fireBullet(): void {
        if (!this.ship.isHidden()) {
            this.bullets.push(
                new Bullet(
                    this.canvas,
                    this.ship.getAngle(),
                    this.ship.getNosePosition()
                )
            );
            this.setScore(Config.SCORE_FIRE_BULLET);
        }
    }

    private setScore(score: number): void {
        if (this.action.Demo) {
            return;
        }

        this.score += score;
        this.currentScoreElement.innerHTML = String(this.score);

        if (this.score > this.highScore) {
            this.highScore = this.score;
            this.highScoreElement.innerHTML = String(this.highScore);
            this.localStorage.setItem('highScore', String(this.highScore));
        }
    }

    private animate(): void {
        if (this.action.Pause) {
            return;
        }

        this.canvas.context.clearRect(
            0,
            0,
            this.canvas.width,
            this.canvas.height
        );

        // manage user control
        this.ship.toggleThrust(this.action.Thrust);

        if (this.action.RotateLeft) {
            this.ship.rotate(-1);
        }

        if (this.action.RotateRight) {
            this.ship.rotate(1);
        }

        this.ship.render();
        this.ship.animate();

        if (this.bullets.length > 0) {
            this.bullets.forEach((bullet: Bullet, idx: number): void => {
                bullet.render();
                bullet.animate();
                if (bullet.isHidden()) {
                    this.bullets.splice(idx, 1);
                }
            });
        }

        if (this.asteroids.length > 0) {
            this.asteroids.forEach((asteroid: Asteroid): void => {
                asteroid.render();
                asteroid.animate();
            });
        }

        if (this.explosions.length > 0) {
            this.explosions.forEach(
                (explosion: Explosion, idx: number): void => {
                    explosion.render();
                    explosion.animate();
                    if (explosion.isHidden()) {
                        this.explosions.splice(idx, 1);
                    }
                }
            );
        }

        if (this.messages.length > 0) {
            this.messages.forEach((message: Message): void => {
                message.render();
                message.animate();
            });
        }

        // check for collision between ship and astroid
        if (!this.ship.isHidden() && this.asteroids.length > 0) {
            let asteroidsIdx: number;
            loop: for (let i = 0; i < this.asteroids.length; i++) {
                if (
                    !this.ship.isHidden() &&
                    radiusCollision(
                        this.ship.getCenterPosition(),
                        this.ship.getRadius(),
                        this.asteroids[i].getCenterPosition(),
                        this.asteroids[i].getRadius()
                    )
                ) {
                    asteroidsIdx = i;
                    this.endLife();
                    this.setScore(Config.SCORE_ASTEROID_BY_COLLISION);
                    this.ship.hide();
                    break loop;
                }
            }

            if (asteroidsIdx !== undefined) {
                this.breakupAsteroid(this.asteroids[asteroidsIdx]);
                this.asteroids.splice(asteroidsIdx, 1);
            }
        }

        if (!this.transitioning && this.ship.isHidden()) {
            this.restartShip();
        }

        if (this.asteroids.length > 0 && this.bullets.length > 0) {
            asteroidLoop: for (
                let asteroidsIdx = 0;
                asteroidsIdx < this.asteroids.length;
                asteroidsIdx++
            ) {
                bulletLoop: for (
                    let bulletsIdx = 0;
                    bulletsIdx < this.bullets.length;
                    bulletsIdx++
                ) {
                    const asteroid: Asteroid = this.asteroids[asteroidsIdx];
                    const bullet: Bullet = this.bullets[bulletsIdx];

                    if (
                        !bullet.isHidden() &&
                        radiusCollision(
                            bullet.getCenterPosition(),
                            Math.max(Config.BULLET_WIDTH, Config.BULLET_HEIGHT),
                            asteroid.getCenterPosition(),
                            asteroid.getRadius()
                        )
                    ) {
                        this.breakupAsteroid(asteroid);
                        this.asteroids.splice(asteroidsIdx, 1);
                        this.bullets.splice(bulletsIdx, 1);
                        this.setScore(Config.SCORE_ASTEROID_BY_BULLET);

                        break asteroidLoop;
                    }
                }
            }
        }

        if (!this.transitioning && this.asteroids.length === 0) {
            this.endLevel();
        }

        requestAnimationFrame(this.animate.bind(this));
    }

    private breakupAsteroid(asteroid: Asteroid): void {
        const { x, y }: Coordinates2D = asteroid.getCenterPosition();

        let nextLevel: astroidLevelType;

        switch (asteroid.getLevel()) {
            case astroidLevelType.LEVEL1:
                nextLevel = astroidLevelType.LEVEL2;
                break;

            case astroidLevelType.LEVEL2:
                nextLevel = astroidLevelType.LEVEL3;
                break;

            default:
                // do nothing
                break;
        }

        if (nextLevel) {
            this.pushAsteroid(
                {
                    x: x - Config.ASTEROID_BREAKUP_OFFSET,
                    y: y - Config.ASTEROID_BREAKUP_OFFSET,
                },
                nextLevel
            );
            this.pushAsteroid(
                {
                    x: x + Config.ASTEROID_BREAKUP_OFFSET,
                    y: y + Config.ASTEROID_BREAKUP_OFFSET,
                },
                nextLevel
            );
        }
    }

    private pushAsteroid(
        coordinates?: Coordinates2D,
        level?: astroidLevelType
    ): void {
        coordinates = coordinates || getRandomCanvasCoordinates(this.canvas);

        level = level || astroidLevelType.LEVEL1;

        this.asteroids.push(
            new Asteroid(this.canvas, coordinates, level, this.asteroidSpeed)
        );
    }

    private keyDownHandler($event: KeyboardEvent) {
        if (this.action.Demo) {
            return;
        }

        if (Config.KEYS_SHIP_ROTATE_LEFT.includes($event.code)) {
            this.action.RotateLeft = true;
        }

        if (Config.KEYS_SHIP_ROTATE_RIGHT.includes($event.code)) {
            this.action.RotateRight = true;
        }

        if (Config.KEYS_SHIP_THRUST.includes($event.code)) {
            this.action.Thrust = true;
        }
    }

    private keyUpHandler($event: KeyboardEvent) {
        if (Config.KEYS_GAME_PAUSE.includes($event.code)) {
            this.action.Pause = !this.action.Pause;

            if (!this.action.Pause) {
                requestAnimationFrame(this.animate.bind(this));
            }
        }

        if (this.action.Demo) {
            return;
        }

        if (Config.KEYS_SHIP_ROTATE_LEFT.includes($event.code)) {
            this.action.RotateLeft = false;
        }

        if (Config.KEYS_SHIP_ROTATE_RIGHT.includes($event.code)) {
            this.action.RotateRight = false;
        }

        if (Config.KEYS_SHIP_THRUST.includes($event.code)) {
            this.action.Thrust = false;
        }

        if (Config.KEYS_BULLET_FIRE.includes($event.code)) {
            this.fireBullet();
            this.setScore(Config.SCORE_FIRE_BULLET);
        }
    }
}

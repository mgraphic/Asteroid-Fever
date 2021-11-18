import '../styles/index.scss';

import { Asteroid } from './sprites/asteroid';
import {
    AsteroidBuildRequest,
    AsteroidCounter,
    AsteroidLevelTypes,
    CanvasContext,
    Coordinates2D,
    KeyState,
} from './models';
import { Bullet } from './sprites/bullet';
import { Config } from './config';
import {
    asteroidPieceCountByLevel,
    drawSegment,
    getCenterCoordinatesOfCanvas,
    getRandomCanvasCoordinates,
    getRandomInRange,
    radiusCollision,
    wait,
} from './utils';
import { Explosion } from './sprites/explosion';
import { Message } from './sprites/message';
import { Ship } from './sprites/ship';
import { Sound } from './sound';
import { Music } from './sprites/music';

export class Game {
    // Game state:
    private actions: KeyState = {
        RotateLeft: false,
        RotateRight: false,
        Thrust: false,
        Pause: false,
        Demo: true,
    };
    private asteroidCounter: AsteroidCounter = {
        firstLevel: Config.GAME_ASTEROIDS_COUNT,
        total: 0,
        remaining: 0,
    };
    private asteroids: Asteroid[] = [];
    private bullets: Bullet[] = [];
    private canvas: CanvasContext;
    private demoTimers: NodeJS.Timeout[] = [];
    private explosions: Explosion[] = [];
    private level: number = 1;
    private localStorage: Storage = window.localStorage;
    private messages: Message[] = [];
    private music: Music;
    private score: number = 0;
    private lastReward: number = 0;
    private ship: Ship;
    private transitioning: boolean = false;
    private soundEffects: { [key: string]: Sound };
    private sounds: KeyState = {
        soundOn: true,
        musicOn: true,
    };

    // Default values:
    private asteroidSpeed: number = Config.ASTEROID_SPEED;
    private highScore: number = Number(
        this.localStorage.getItem('highScore') ?? 0
    );
    private lives: number = Config.GAME_NUMBER_OF_LIVES;

    // Element containers:
    private canvasElement: HTMLCanvasElement;
    private currentScoreElement: HTMLElement;
    private gameBoardElement: HTMLElement;
    private highScoreElement: HTMLElement;
    private levelElement: HTMLElement;
    private livesElement: HTMLElement;

    // Public methods:
    public constructor(gameBoard: HTMLElement) {
        this.gameBoardElement = gameBoard;
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

        this.soundEffects = {
            explode: new Sound(this.sounds, Config.SOUND_EXPLODE),
            hit: new Sound(this.sounds, Config.SOUND_HIT),
            laser: new Sound(this.sounds, Config.SOUND_LASER),
            thrust: new Sound(this.sounds, Config.SOUND_THRUST),
        };

        this.music = new Music(this.sounds);

        this.ship = new Ship(this.canvas);
        this.ship.hide();
        this.startDemo();
        this.animate();
    }

    // Private methods:
    private reset(): void {
        this.asteroidCounter.firstLevel = Config.GAME_ASTEROIDS_COUNT;
        this.asteroidSpeed = Config.ASTEROID_SPEED;
        this.lives = 3;
        this.score = 0;
        this.lastReward = 0;
        this.level = 1;
        this.bullets = [];
        this.asteroids = [];
        this.explosions = [];
        this.messages = [];
        this.actions.RotateLeft = false;
        this.actions.RotateRight = false;
        this.toggleThrust(false);
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
                this.soundEffects.thrust.volumeOn();

                if (!this.actions.Demo) {
                    this.refreshLivesDisplay();
                }
            }
        }
    }

    private endLife(): void {
        this.ship.hide();
        this.soundEffects.thrust.volumeOff();
        this.soundEffects.explode.play();
        this.explosions.push(
            new Explosion(this.canvas, this.ship.getCenterPosition())
        );

        if (!this.actions.Demo) {
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
        this.actions.Demo = true;
        this.mute();
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
                        this.toggleThrust();
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
                            this.actions.RotateLeft = true;
                            this.actions.RotateRight = false;
                        } else if (dir > 0) {
                            this.actions.RotateLeft = false;
                            this.actions.RotateRight = true;
                        } else {
                            this.actions.RotateLeft = false;
                            this.actions.RotateRight = false;
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
        this.actions.Demo = false;
    }

    private async startGame(): Promise<void> {
        if (!this.actions.Demo) {
            return;
        }

        this.canvasElement.classList.remove('click-to-start');
        this.endDemo();
        this.reset();
        this.refreshLivesDisplay();
        this.unmute();
        this.startLevel();
    }

    private async endGame(): Promise<void> {
        this.transitioning = true;
        this.ship.hide();
        this.music.mute();
        this.messages.push(
            new Message(
                this.canvas,
                getCenterCoordinatesOfCanvas(this.canvas),
                'Game Over'
            )
        );
        await wait(5000);
        this.messages = [];
        this.mute();
        this.startDemo();
        this.canvasElement.classList.add('click-to-start');
    }

    private async startLevel(): Promise<void> {
        this.transitioning = true;
        this.refreshLevelDisplay();

        if (!this.actions.Demo) {
            this.messages.push(
                new Message(
                    this.canvas,
                    getCenterCoordinatesOfCanvas(this.canvas),
                    'Get Ready'
                )
            );
            await wait(2000);
            this.messages = [];
        }

        // get asteroids build request array
        const buildRequest: AsteroidBuildRequest[] =
            this.getAsteroidBuildRequest();

        // count total pieces of asteroids to destroy
        let piecesCounter: number = 0;

        // loops through build request to total number of pieces
        buildRequest.forEach((item: AsteroidBuildRequest): void => {
            piecesCounter += item.count * asteroidPieceCountByLevel(item.level);
        });

        this.asteroidCounter.total = piecesCounter;
        this.asteroidCounter.remaining = piecesCounter;

        // fullfill asteroids request order
        buildRequest.forEach((item: AsteroidBuildRequest): void => {
            for (let i = 0; i < item.count; i++) {
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

                this.pushAsteroid(randomCoordinates, item.level);
            }
        });

        this.setTempo();
        this.transitioning = false;
    }

    private async endLevel(): Promise<void> {
        this.transitioning = true;

        if (!this.actions.Demo) {
            this.level++;
            this.asteroidCounter.firstLevel += Config.GAME_ASTEROIDS_COUNT_GROW;
            this.asteroidSpeed += Config.GAME_ASTEROID_SPEED_INCREASE;

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
            await wait(2000);
            this.messages = [];
        }

        this.startLevel();
    }

    private getAsteroidBuildRequest(): AsteroidBuildRequest[] {
        const numberOfLevels: number =
            Object.keys(AsteroidLevelTypes).length / 2;
        const firstLevel: number = Math.floor(this.asteroidCounter.firstLevel);
        const remaining: number = Math.floor(
            (this.asteroidCounter.firstLevel - firstLevel) /
                (1 / numberOfLevels)
        );
        const remainingLevel: AsteroidLevelTypes =
            AsteroidLevelTypes[AsteroidLevelTypes[numberOfLevels - remaining]];

        const asteroids: AsteroidBuildRequest[] = [];

        if (firstLevel > 0) {
            asteroids.push({
                level: AsteroidLevelTypes.LEVEL1,
                count: firstLevel,
            });
        }

        if (remaining > 0) {
            asteroids.push({ level: remainingLevel, count: 1 });
        }

        return asteroids;
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
            this.soundEffects.laser.play();
        }
    }

    private setScore(score: number): void {
        if (this.actions.Demo) {
            return;
        }

        this.score += score;

        // check for extra life reward
        const reward: number = this.score - this.lastReward;

        if (
            this.lives < Config.GAME_MAX_LIVES &&
            reward >= Config.GAME_EXTRA_LIFE_REWARD
        ) {
            this.lives++;
            this.refreshLivesDisplay();
            this.lastReward = this.score;
        }

        this.currentScoreElement.innerHTML = String(this.score);

        if (this.score > this.highScore) {
            this.highScore = this.score;
            this.highScoreElement.innerHTML = String(this.highScore);
            this.localStorage.setItem('highScore', String(this.highScore));
        }
    }

    private toggleThrust(thrust?: boolean): void {
        this.actions.Thrust =
            thrust !== undefined ? thrust : !this.actions.Thrust;
        this.ship.toggleThrust(this.actions.Thrust);
        if (this.actions.Thrust) {
            this.soundEffects.thrust.play();
        } else {
            this.soundEffects.thrust.stop();
        }
    }

    private toggleSound(soundOn?: boolean): void {
        soundOn = soundOn !== undefined ? soundOn : !this.sounds.soundOn;

        this.sounds.soundOn = soundOn;
        this.sounds.musicOn = soundOn;
    }

    private mute(): void {
        const soundKeys: string[] = Object.keys(this.soundEffects);

        soundKeys.forEach((key: string): void => {
            this.soundEffects[key].mute();
        });

        this.music.mute();
    }

    private unmute(): void {
        const soundKeys: string[] = Object.keys(this.soundEffects);

        soundKeys.forEach((key: string): void => {
            this.soundEffects[key].unmute();
        });

        this.music.unmute();
    }

    private setTempo(): void {
        this.music.setTempoByRatio(
            this.asteroidCounter.remaining / this.asteroidCounter.total
        );
    }

    private animate(): void {
        if (this.actions.Pause) {
            return;
        }

        this.canvas.context.clearRect(
            0,
            0,
            this.canvas.width,
            this.canvas.height
        );

        if (this.actions.RotateLeft) {
            this.ship.rotate(-1);
        }

        if (this.actions.RotateRight) {
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

        this.music.render();

        requestAnimationFrame(this.animate.bind(this));
    }

    private breakupAsteroid(asteroid: Asteroid): void {
        const { x, y }: Coordinates2D = asteroid.getCenterPosition();

        let nextLevel: AsteroidLevelTypes;

        switch (asteroid.getLevel()) {
            case AsteroidLevelTypes.LEVEL1:
                nextLevel = AsteroidLevelTypes.LEVEL2;
                break;

            case AsteroidLevelTypes.LEVEL2:
                nextLevel = AsteroidLevelTypes.LEVEL3;
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

        this.soundEffects.hit.play();
        this.asteroidCounter.remaining--;
        this.setTempo();
    }

    private pushAsteroid(
        coordinates?: Coordinates2D,
        level?: AsteroidLevelTypes
    ): void {
        coordinates = coordinates || getRandomCanvasCoordinates(this.canvas);

        level = level || AsteroidLevelTypes.LEVEL1;

        this.asteroids.push(
            new Asteroid(this.canvas, coordinates, level, this.asteroidSpeed)
        );
    }

    private keyDownHandler($event: KeyboardEvent) {
        if (this.actions.Demo) {
            return;
        }

        if (Config.KEYS_SHIP_ROTATE_LEFT.includes($event.code)) {
            this.actions.RotateLeft = true;
        }

        if (Config.KEYS_SHIP_ROTATE_RIGHT.includes($event.code)) {
            this.actions.RotateRight = true;
        }

        if (Config.KEYS_SHIP_THRUST.includes($event.code)) {
            this.toggleThrust(true);
        }
    }

    private keyUpHandler($event: KeyboardEvent) {
        if (Config.KEYS_GAME_PAUSE.includes($event.code)) {
            this.actions.Pause = !this.actions.Pause;

            if (!this.actions.Pause) {
                requestAnimationFrame(this.animate.bind(this));
            }
        }

        if (this.actions.Demo) {
            return;
        }

        if (Config.KEYS_SHIP_ROTATE_LEFT.includes($event.code)) {
            this.actions.RotateLeft = false;
        }

        if (Config.KEYS_SHIP_ROTATE_RIGHT.includes($event.code)) {
            this.actions.RotateRight = false;
        }

        if (Config.KEYS_SHIP_THRUST.includes($event.code)) {
            this.toggleThrust(false);
        }

        if (Config.KEYS_BULLET_FIRE.includes($event.code)) {
            this.fireBullet();
            this.setScore(Config.SCORE_FIRE_BULLET);
        }

        if (Config.KEYS_GAME_SOUND.includes($event.code)) {
            this.toggleSound();
        }
    }
}

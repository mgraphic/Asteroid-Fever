import { Config } from '../config';
import { CanvasContext, Coordinates2D, MessageConfigurator } from '../models';
import { AbstractSprite } from './abstract-sprite';

export class Message extends AbstractSprite {
    protected angle: number;
    private config: MessageConfigurator;
    private display: boolean = true;
    private font: string;
    private textWidth: number;

    private static defaultConfig: MessageConfigurator = {
        font: Config.MESSAGE_DEFAULT_FONT,
        size: Config.MESSAGE_DEFAULT_SIZE,
        style: Config.MESSAGE_DEFAULT_STYLE,
        blink: false,
        scroll: false,
        scrollSpeed: 1,
        fillStyle: Config.MESSAGE_DEFAULT_FILL_STYLE,
        strokeStyle: Config.MESSAGE_DEFAULT_STROKE_STYLE,
        textAlign: 'center',
        textBaseline: 'middle',
    };

    constructor(
        protected canvas: CanvasContext,
        protected centerPosition: Coordinates2D,
        private message: string,
        private settings: MessageConfigurator = {}
    ) {
        super();
    }

    public setFont(font: string): Message {
        this.config.font = font;
        return this;
    }

    public setSize(size: string): Message {
        this.config.size = size;
        return this;
    }

    public setStyle(style: string): Message {
        this.config.style = style;
        return this;
    }

    public toggleBlink(blink: boolean): Message {
        this.config.blink = blink;
        return this;
    }

    public finalize(): void {
        if (this.config !== undefined) {
            return;
        }

        this.config = Object.assign({}, Message.defaultConfig, this.settings);

        this.font = [this.config.style, this.config.size, this.config.font]
            .filter((f: string): boolean => f.length > 0)
            .join(' ');

        if (this.config.blink) {
            const loop: () => void = () => {
                setTimeout((): void => {
                    this.display = !this.display;
                    loop();
                }, 800);
            };

            loop();
        }

        if (this.config.scroll) {
            this.config.textAlign = 'start';
            this.centerPosition.x = this.canvas.width;
        }
    }

    public move(): void {
        if (this.config.scroll) {
            if (this.textWidth === undefined) {
                this.canvas.context.font = this.config.font;
                this.textWidth = this.canvas.context.measureText(
                    this.message
                ).width;
            }

            if (this.centerPosition.x + this.textWidth < 0) {
                this.centerPosition.x = this.canvas.width;
            } else {
                this.centerPosition.x -= this.config.scrollSpeed;
            }
        }
    }

    public render(): void {
        if (!this.display) {
            return;
        }

        this.finalize();

        const { x, y }: Coordinates2D = this.centerPosition;

        this.canvas.context.font = this.font;
        this.canvas.context.textAlign = this.config.textAlign;
        this.canvas.context.textBaseline = this.config.textBaseline;

        if (this.config.fillStyle) {
            this.canvas.context.fillStyle = this.config.fillStyle;
            this.canvas.context.fillText(this.message, x, y);
        }

        if (this.config.strokeStyle) {
            this.canvas.context.strokeStyle = this.config.strokeStyle;
            this.canvas.context.strokeText(this.message, x, y);
        }
    }
}

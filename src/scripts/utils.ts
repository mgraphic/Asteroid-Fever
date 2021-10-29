import { CanvasContext, Coordinates2D } from './models';

export function drawSegment(
    className: string | string[],
    gameBoard: HTMLElement,
    elementType: 'div' | 'span' | 'canvas' = 'div'
): HTMLElement | HTMLCanvasElement {
    const gridElement: HTMLElement = document.createElement(elementType);

    if (typeof className === 'string') {
        className = [className];
    }

    gridElement.classList.add(...className);

    gameBoard.appendChild(gridElement);

    return gridElement;
}

export function isBetween(value: number, min: number, max: number): boolean {
    return value >= min && value <= max;
}

export function getCenterCoordinatesOfCanvas(
    canvas: CanvasContext
): Coordinates2D {
    return {
        x: canvas.width / 2,
        y: canvas.height / 2,
    };
}

export function getRandomCanvasCoordinates(
    canvas: CanvasContext
): Coordinates2D {
    return {
        x: Math.floor(Math.random() * canvas.width),
        y: Math.floor(Math.random() * canvas.height),
    };
}

export function getRandomInRange(min: number, max: number): number {
    return Math.random() * (max - min) + min;
}

export function radiusCollision(
    sprite1: Coordinates2D,
    radius1: number,
    sprite2: Coordinates2D,
    radius2: number
): boolean {
    const radiusSum: number = radius1 + radius2;
    const xDiff: number = sprite1.x - sprite2.x;
    const yDiff: number = sprite1.y - sprite2.y;
    return radiusSum > Math.sqrt(xDiff * xDiff + yDiff * yDiff);
}

export function valueOfPercent(
    originalValue: number,
    percentage: number
): number {
    return (originalValue * percentage) / 100;
}
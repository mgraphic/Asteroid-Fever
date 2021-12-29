import {
    AsteroidLevelTypes,
    CanvasContext,
    Coordinates2D,
    MinMax,
} from './models';

export function asteroidPieceCountByLevel(level: AsteroidLevelTypes): number {
    return Math.pow(2, Object.keys(AsteroidLevelTypes).length / 2 - level) - 1;
}

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

export function getAngleOfTwoCoordinates(
    coord1: Coordinates2D,
    coord2: Coordinates2D
): number {
    const angleBase: number = 0.109666;
    const diff: Coordinates2D = {
        x: coord1.x - coord2.x,
        y: coord1.y - coord2.y,
    };

    let theta: number = Math.atan2(diff.y, diff.x);
    theta *= 180 / Math.PI;

    if (theta < 0) {
        theta = 360 + theta;
    }

    return angleBase / (360 / theta);
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

export function minMaxAdjuster(
    minMax: MinMax,
    adjustBy: number,
    allowableMinMax: MinMax = { min: 100, max: 1100 }
): MinMax {
    let { min, max }: MinMax = minMax;

    min += adjustBy;
    if (min < allowableMinMax.min) {
        min = allowableMinMax.min;
    }

    max += adjustBy;
    if (max < allowableMinMax.max) {
        max = allowableMinMax.max;
    }

    return { min, max };
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

export async function wait(timer: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, timer));
}

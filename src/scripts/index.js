import { Game } from './game';

document.addEventListener('DOMContentLoaded', () => {
    const game = new Game(document.querySelector('.gameboard'));
    game.run();
});

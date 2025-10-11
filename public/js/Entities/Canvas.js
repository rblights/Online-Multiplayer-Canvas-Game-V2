export class Canvas {
  constructor(width, height) {
    this.canvas = document.querySelector('#gameCanvas');
    this.context = this.canvas.getContext('2d');

    this.canvas.width = width
    this.canvas.height = height

    this.context.fillStyle = 'black'
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }
}
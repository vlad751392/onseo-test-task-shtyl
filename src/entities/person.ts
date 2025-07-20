import { Container, Graphics } from 'pixi.js';
import { Tween, Easing, Group } from '@tweenjs/tween.js';
import * as PIXI from 'pixi.js';
import { Direction } from '../enums/direction';

const tweenGroup = new Group();

export class Person extends Container {
  targetFloor: number;
  direction: Direction;

  constructor(currentFloor: number, targetFloor: number) {
    super();

    this.targetFloor = targetFloor;
    this.direction = targetFloor > currentFloor ? Direction.UP : Direction.DOWN;

    const width = 20;
    const height = 30;

    const borderColor = this.direction === Direction.UP ? 0x0000ff : 0x00cc00;

    const rect = new Graphics()
      .lineStyle(2, borderColor)
      .beginFill(0xffffff) // белый фон
      .drawRect(0, 0, width, height)
      .endFill();

    const text = new PIXI.Text(`${targetFloor+1}`, {
      fontSize: 14,
      fill: 0x000000
    });

    text.anchor.set(0.5);
    text.x = width / 2;
    text.y = height / 2;

    this.addChild(rect,text);
  }

  moveTo(targetX: number, onComplete: () => void) {
    new Tween(this.position, tweenGroup)
      .to({ x: targetX }, 2000)
      .easing(Easing.Linear.None)
      .onComplete(onComplete)
      .start();
  }

  update() {
        tweenGroup.update();
    }
}



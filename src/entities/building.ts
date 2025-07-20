import { Container } from 'pixi.js';
import * as PIXI from 'pixi.js';
import { Floor } from './floor';
import { FLOOR_HEIGHT, FLOOR_SPACING, NUM_FLOORS } from '../config/constant';
import { Elevator } from './elevator';

export class Building extends Container {
  floors: Floor[] = [];
  elevator: Elevator;

  constructor(app: PIXI.Application) {
    super();
    this.x = 200;

    for (let i = 0; i < NUM_FLOORS; i++) {
      const floorNumber = i;
      const y = (NUM_FLOORS - 1 - i) * (FLOOR_HEIGHT + FLOOR_SPACING);
      const floor = new Floor(floorNumber);
      floor.y = y;
      floor.x = 0;
      this.floors.push(floor);
      this.addChild(floor);

      floor.startPeopleGeneration();
    }

    this.elevator = new Elevator();
    this.elevator.x = 0;
    this.elevator.y = (NUM_FLOORS-1) * FLOOR_HEIGHT;

    this.addChild(this.elevator);
  }

  startElevator() {
    this.elevator.startMoving();
  }

  update() {
  this.elevator.update();
}
}

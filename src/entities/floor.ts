import { FLOOR_CAPCITY, FLOOR_HEIGHT, FLOOR_WIDTH, MAX_PERSON_SPAWN_TIME, MIN_PERSON_SPAWN_TIME, NUM_FLOORS } from '../config/constant';
import { Container, Graphics, Text } from 'pixi.js';
import { Person } from './person';
import { Tween, Easing, Group } from '@tweenjs/tween.js';

const tweenGroup = new Group();

export class Floor extends Container {
  floorNumber: number;
  people: Person[] = [];
  waitingQueue: Person[] = [];
  private waitingSlotsX: number[];

  constructor(floorNumber: number) {
    super();

    this.floorNumber = floorNumber;
    this.waitingSlotsX = this.generateWaitingSlots(FLOOR_CAPCITY);

    const bg = new Graphics()
      .lineStyle(1, 0xaaaaaa)
      .beginFill(0xf2f2f2)
      .drawRect(0, 0, FLOOR_WIDTH, FLOOR_HEIGHT)
      .endFill();

    const label = new Text(`Floor ${floorNumber+1}`, {
      fontSize: 14,
      fill: 0x333333,
    });

    label.x = 10;
    label.y = 10;

    this.addChild(bg, label);

    const maskShape = new Graphics()
      .lineStyle(1, 0xaaaaaa)
      .beginFill(0xf2f2f2)
      .drawRect(0, 0, FLOOR_WIDTH, FLOOR_HEIGHT)
      .endFill();
    this.addChild(maskShape);
    this.mask = maskShape

  }

  async removePerson(person: Person) {
    this.removeChild(person);
    this.people = this.people.filter(p => p !== person);
    this.waitingQueue = this.waitingQueue.filter(p => p !== person);
  }

  async startPeopleGeneration() {
    setInterval(async () => {
      if (this.people.length >= FLOOR_CAPCITY) {
        return;
      }

      let targetFloor: number;
      do {
        targetFloor = Math.floor(Math.random() * 6);
      } while (targetFloor === this.floorNumber);

      const person = new Person(this.floorNumber, targetFloor);
      person.x = 400;
      person.y = 0;

      this.people.push(person);


      this.addChild(person);
      await this.updateWaitingQueuePositions();
      const firstFreeSlotX = this.findFirstFreeSlotX();

      person.moveTo(firstFreeSlotX, () => {
        this.waitingQueue.push(person);
      });
    }, Math.random() * (MAX_PERSON_SPAWN_TIME - MIN_PERSON_SPAWN_TIME) + MIN_PERSON_SPAWN_TIME);
  }

  findFirstFreeSlotX(): number {
    const usedPositions = this.waitingQueue.map(p => p.x);
    for (const slotX of this.waitingSlotsX) {
      if (!usedPositions.some(x => Math.abs(x - slotX) < 5)) {
        return slotX;
      }
    }

    return -25;
  }

  async updateWaitingQueuePositions(): Promise<void> {
    const promises = this.waitingQueue.map((person, index) => {
      const targetX = this.waitingSlotsX[index];

      return new Promise<void>((resolve) => {
        new Tween(person, tweenGroup)
          .to({ x: targetX }, 300)
          .onComplete(() => resolve())
          .start();
      });
    });

    await Promise.all(promises);
  }

  private generateWaitingSlots(count: number): number[] {
    const slots: number[] = [];
    const slotWidth = 25;
    const startX = 10;

    for (let i = 0; i < count; i++) {
      slots.push(startX + i * slotWidth);
    }

    return slots;
  }

  update() {
    this.people.forEach(person => person.update());
    tweenGroup.update();
  }

}


import { Direction } from '../enums/direction';
import { Container, Graphics } from 'pixi.js';
import { ELEVATOR_WIDTH, ELEVATOR_HEIGHT, NUM_FLOORS, ELEVATOR_CAPACITY, FLOOR_WIDTH, ELEVATOR_IDLE_TIME, ELEVATOR_MOVE_TIME } from '../config/constant';
import { Tween, Easing, Group } from '@tweenjs/tween.js';
import type { Person } from './person';
import type { Floor } from './floor';

const tweenGroup = new Group();

export class Elevator extends Container {
    passengers: Person[] = [];
    currentFloor: number;
    direction: Direction;
    targetFloor: number | null = null;
    private elevatorSlotsX: number[];
    currentTween: Tween | null = null;


    constructor() {
        super();

        const box = new Graphics()
            .beginFill(0x999999)
            .drawRect(0, 0, ELEVATOR_WIDTH * ELEVATOR_CAPACITY, ELEVATOR_HEIGHT)
            .endFill();

        this.direction = Direction.UP;
        this.elevatorSlotsX = this.generatePassengerSlots(ELEVATOR_CAPACITY);

        this.currentFloor = 0;
        box.x = -ELEVATOR_WIDTH * ELEVATOR_CAPACITY;
        this.addChild(box);
    }

    startMoving() {
        this.moveNextFloor();
    }

    private onArrived: ((floor: number) => Promise<void>) | null = null;

    setArrivalCallback(callback: (floor: number) => Promise<void>) {
        this.onArrived = callback;
    }

    moveNextFloor() {
        this.reorderPassengers();

        this.currentFloor += this.direction === Direction.DOWN ? -1 : 1;
        const targetY = (NUM_FLOORS - 1 - this.currentFloor) * ELEVATOR_HEIGHT;

        this.currentTween = new Tween(this.position, tweenGroup)
            .to({ y: targetY }, ELEVATOR_MOVE_TIME)
            .easing(Easing.Quadratic.InOut)
            .onComplete(async () => {

                if (this.currentFloor === 0) {
                    this.direction = Direction.UP;
                } else if (this.currentFloor === NUM_FLOORS - 1) {
                    this.direction = Direction.DOWN;
                }

                if (this.onArrived) {
                    await this.onArrived(this.currentFloor);
                }
            })
            .start();
    }

    async boardPassenger(person: Person) {
        const targetX = this.findFirstFreeSlotX();

        this.passengers.push(person);
        person.y = 5;

        await new Promise<void>((resolve) => {
            new Tween(person, tweenGroup)
                .to({ x: targetX, y: 30 }, 200)
                .easing(Easing.Quadratic.Out)
                .onComplete(() => {
                    this.addChild(person);
                    resolve();
                })
                .start();
        });
    }

    unboardPassengers(floor: Floor) {
        const exitedPassengers = this.passengers.filter(p => p.targetFloor === this.currentFloor);
        for (let i = 0; i < exitedPassengers.length; i++) {
            const p = exitedPassengers[i];

            new Tween(p, tweenGroup)
                .to({ x: 0 }, 0)
                .easing(Easing.Quadratic.Out)
                .onComplete(() => {
                    floor.addChild(p);
                    this.removeChild(p);
                    new Tween(p, tweenGroup)
                        .to({ x: floor.width + 10 })
                        .duration(2000)
                        .delay(i * 100)
                        .onComplete(() => {
                            floor.removeChild(p)
                        })
                        .start();
                })
                .start();
        };
        this.passengers = this.passengers.filter(p => p.targetFloor !== this.currentFloor);;
    }


    getCurrentPassengersAmount() {
        return this.passengers.length + 1;
    }

    private findFirstFreeSlotX(): number | null {
        const usedPositions = this.passengers.map(p => p.x);
        for (const slotX of this.elevatorSlotsX) {
            if (!usedPositions.some(x => Math.abs(x - slotX) < 5)) {
                return slotX;
            }
        }
        return null;
    }

    private reorderPassengers() {
        if (this.passengers.length >= this.elevatorSlotsX.length) {
            return;
        }

        this.passengers.forEach((passenger, index) => {
            const targetX = this.elevatorSlotsX[index];

            new Tween(passenger, tweenGroup)
                .to({ x: targetX }, 200)
                .easing(Easing.Quadratic.Out)
                .start();
        });
    }

    private generatePassengerSlots(capacity: number): number[] {
        const slots: number[] = [];
        const slotSpacing = -26;
        const startX = -25;

        for (let i = 0; i < capacity; i++) {
            slots.push(startX + i * slotSpacing);
        }

        return slots;
    }


    update() {
        tweenGroup.update();
    }
}

import type { Building } from "../entities/building";
import type { Elevator } from '../entities/elevator';
import type { Floor } from '../entities/floor';
import { getApp } from '../globals';
import { wait } from "../utils/wait";
import { ELEVATOR_CAPACITY, ELEVATOR_IDLE_TIME } from "../config/constant";

export class SimulationController {
  private building: Building;
  private elevator: Elevator;
  private floors: Floor[];
  private currentFloor: Floor;

  constructor(building: Building) {
    this.building = building;
    this.elevator = building.elevator;
    this.floors = building.floors;
    this.currentFloor = this.floors[0];

    // @ts-ignore
    window.elevator = this.elevator;

    this.initTicker();
    this.initElevatorCallback();
  }

  private initTicker() {
    getApp().ticker.add(() => {
      this.building.update();
      this.floors.forEach(floor => floor.update());
    });
  }

  private initElevatorCallback() {
    this.elevator.setArrivalCallback(async (floorIndex: number) => {
      this.currentFloor = this.floors[floorIndex];

      const needStop = this.shouldStopAtFloor(floorIndex);

      if (needStop) {
        await Promise.all([
          wait(ELEVATOR_IDLE_TIME),
          this.elevator.unboardPassengers(this.currentFloor),
          this.boardPassengers()
        ]);
      }

      this.elevator.moveNextFloor();
    });
  }

  private shouldStopAtFloor(floorIndex: number): boolean {
    const queue = this.floors[floorIndex].waitingQueue;

    const needUnboard = this.elevator.passengers.some(
      p => p.targetFloor === floorIndex
    );

    const needBoard = queue.some(
      person =>
        person.direction === this.elevator.direction &&
        this.elevator.getCurrentPassengersAmount() <= ELEVATOR_CAPACITY
    );

    return needUnboard || needBoard;
  }

  private async boardPassengers(): Promise<void> {
    const queue = [...this.currentFloor.waitingQueue];

    for (const person of queue) {
      if (
        person.direction === this.elevator.direction &&
        this.elevator.getCurrentPassengersAmount() <= ELEVATOR_CAPACITY
      ) {
        await this.elevator.boardPassenger(person);
        this.currentFloor.removePerson(person);
      }
    }
  }

  start() {
    this.building.startElevator();
  }
}

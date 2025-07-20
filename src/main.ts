import * as PIXI from 'pixi.js';
import { Building } from './entities/building';
import { setApp } from './globals';
import { SimulationController } from './controllers/simulation';


const app = new PIXI.Application<HTMLCanvasElement>({
  width: 1200,
  height: 1200,
  backgroundColor: 0xffffff,
});
document.body.appendChild(app.view);


(globalThis as any).__PIXI_APP__ = app;

setApp(app);

const building = new Building(app);
app.stage.addChild(building);

const simulation = new SimulationController(building);
simulation.start();
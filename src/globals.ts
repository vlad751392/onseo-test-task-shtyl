import * as PIXI from 'pixi.js';

export let app: PIXI.Application | null = null;

export function setApp(application: PIXI.Application) {
  app = application;
}

export function getApp(): PIXI.Application {
  if (!app) throw new Error('App is not initialized!');
  return app;
}

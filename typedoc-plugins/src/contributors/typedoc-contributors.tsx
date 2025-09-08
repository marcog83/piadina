/* eslint-disable @typescript-eslint/no-unused-vars */
/** @jsx JSX.createElement */
/** @jsxFrag JSX.Fragment */

import { Application, JSX } from 'typedoc';

import { PiadinaTheme } from './piadina-theme';

export function load(app: Application) {
  app.renderer.defineTheme('piadina-theme', PiadinaTheme);
}

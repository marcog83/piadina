/* eslint-disable @typescript-eslint/no-unused-vars */
/** @jsx JSX.createElement */
/** @jsxFrag JSX.Fragment */

import { Application, JSX } from 'typedoc';

import { TritoTheme } from './trito-theme';

export function load(app: Application) {
  app.renderer.defineTheme('trito-theme', TritoTheme);
}

/* eslint-disable react/no-unknown-property */
/* eslint-disable react/style-prop-object */
/* eslint-disable jsx-a11y/anchor-has-content */
/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable @typescript-eslint/no-unused-vars */
/** @jsx JSX.createElement */
/** @jsxFrag JSX.Fragment */

import { Application, JSX } from 'typedoc';

import { PestoTheme } from './pesto-theme';

export async function load(app: Application) {
  app.renderer.defineTheme('pesto-theme', PestoTheme);
}

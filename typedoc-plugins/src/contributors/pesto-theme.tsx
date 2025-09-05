/* eslint-disable react/no-unknown-property */
/* eslint-disable class-methods-use-this */
/* eslint-disable max-classes-per-file */
/* eslint-disable @typescript-eslint/no-unused-vars */
/** @jsx JSX.createElement */
/** @jsxFrag JSX.Fragment */

import { DefaultTheme, DefaultThemeRenderContext, PageEvent, Reflection, JSX, ReflectionKind, Renderer } from 'typedoc';

class PestoThemeContext extends DefaultThemeRenderContext {
  // Important: If you use `this`, this function MUST be bound! Template functions
  // are free to destructure the context object to only grab what they care about.
  override footer = () => (
    <footer>
      {this.hook('footer.begin', this)}

      {this.hook('footer.end', this)}
    </footer>
  );
}

export class PestoTheme extends DefaultTheme {
  constructor(renderer: Renderer) {
    super(renderer);
    this.icons = {
      'pesto-package-icon': () => (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          class="tsd-kind-icon"
          aria-label="Module"
        >
          <text
            font-size="22"
            fill="var(--color-icon-text)"
            x="50%"
            y="50%"
            dominant-baseline="central"
            text-anchor="middle"
          >
            📦
          </text>
        </svg>
      ),
      'pesto-kit-icon': () => (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          class="tsd-kind-icon"
          aria-label="Module Kit"
        >
          <text
            font-size="22"
            fill="var(--color-icon-text)"
            x="50%"
            y="50%"
            dominant-baseline="central"
            text-anchor="middle"
          >
            🧩
          </text>
        </svg>
      ),
      'pesto-react-icon': () => (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          class="tsd-kind-icon"
          aria-label="Module React"
        >
          <text
            font-size="22"
            fill="var(--color-icon-text)"
            x="50%"
            y="50%"
            dominant-baseline="central"
            text-anchor="middle"
          >
            ⚛️
          </text>
        </svg>
      ),
      'pesto-document-icon': () => (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          class="tsd-kind-icon"
          aria-label="Module React"
        >
          <text
            font-size="22"
            fill="var(--color-icon-text)"
            x="50%"
            y="50%"
            dominant-baseline="central"
            text-anchor="middle"
          >
            📚
          </text>
        </svg>
      ),
      ...this.icons,
    };
  }

  getRenderContext(pageEvent: PageEvent<Reflection>) {
    return new PestoThemeContext(this.router, this, pageEvent, this.application.options);
  }

  override getReflectionIcon(reflection: Reflection) {
    if (reflection.kind === ReflectionKind.Module) {
      if (reflection.name.match('Kit')) {
        return 'pesto-kit-icon';
      } if (reflection.name.match('React')) {
        return 'pesto-react-icon';
      }

      return 'pesto-package-icon';
    } if (reflection.kind === ReflectionKind.Document) {
      return 'pesto-document-icon';
    }

    return reflection.kind;
  }
}

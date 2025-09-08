/* eslint-disable react/no-unknown-property */
/* eslint-disable class-methods-use-this */
/* eslint-disable max-classes-per-file */
/* eslint-disable @typescript-eslint/no-unused-vars */
/** @jsx JSX.createElement */
/** @jsxFrag JSX.Fragment */

import { DefaultTheme, DefaultThemeRenderContext, PageEvent, Reflection, JSX, ReflectionKind, Renderer } from 'typedoc';

class TritoThemeContext extends DefaultThemeRenderContext {
  // Important: If you use `this`, this function MUST be bound! Template functions
  // are free to destructure the context object to only grab what they care about.
  override footer = () => (
    <footer>
      {this.hook('footer.begin', this)}

      {this.hook('footer.end', this)}
    </footer>
  );
}

export class TritoTheme extends DefaultTheme {
  constructor(renderer: Renderer) {
    super(renderer);
    this.icons = {
      'Trito-package-icon': () => (
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
      'Trito-kit-icon': () => (
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
      'Trito-react-icon': () => (
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
      'Trito-document-icon': () => (
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
    return new TritoThemeContext(this.router, this, pageEvent, this.application.options);
  }

  override getReflectionIcon(reflection: Reflection) {
    if (reflection.kind === ReflectionKind.Module) {
      if (reflection.name.match('Kit')) {
        return 'Trito-kit-icon';
      } if (reflection.name.match('React')) {
        return 'Trito-react-icon';
      }

      return 'Trito-package-icon';
    } if (reflection.kind === ReflectionKind.Document) {
      return 'Trito-document-icon';
    }

    return reflection.kind;
  }
}

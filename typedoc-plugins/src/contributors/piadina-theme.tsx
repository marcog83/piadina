/* eslint-disable react/no-unknown-property */
/** @jsx JSX.createElement */
/** @jsxFrag JSX.Fragment */

import { DefaultTheme, DefaultThemeRenderContext, PageEvent, Reflection, JSX, ReflectionKind, Renderer } from 'typedoc';

class PiadinaThemeContext extends DefaultThemeRenderContext {
  // Important: If you use `this`, this function MUST be bound! Template functions
  // are free to destructure the context object to only grab what they care about.
  override footer = () => (
    <footer>
      {this.hook('footer.begin', this)}

      {this.hook('footer.end', this)}
    </footer>
  );
}

export class PiadinaTheme extends DefaultTheme {
  constructor(renderer: Renderer) {
    super(renderer);
    this.icons = {
      'Piadina-package-icon': () => (
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
      'Piadina-kit-icon': () => (
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
      'Piadina-react-icon': () => (
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
      'Piadina-document-icon': () => (
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
    return new PiadinaThemeContext(this.router, this, pageEvent, this.application.options);
  }

  override getReflectionIcon(reflection: Reflection) {
    if (reflection.kind === ReflectionKind.Module) {
      if (reflection.name.match('Kit')) {
        return 'Piadina-kit-icon';
      } if (reflection.name.match('React')) {
        return 'Piadina-react-icon';
      }

      return 'Piadina-package-icon';
    } if (reflection.kind === ReflectionKind.Document) {
      return 'Piadina-document-icon';
    }

    return reflection.kind;
  }
}

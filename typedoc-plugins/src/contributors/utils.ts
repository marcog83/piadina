import { DeclarationReflection, ProjectReflection, Reflection } from 'typedoc';

export function getDisplayName(refl: Reflection): string {
  let version = '';

  if ((refl instanceof DeclarationReflection || refl instanceof ProjectReflection) && refl.packageVersion) {
    version = ` - v${ refl.packageVersion }`;
  }

  return `${ refl.name }${ version }`;
}

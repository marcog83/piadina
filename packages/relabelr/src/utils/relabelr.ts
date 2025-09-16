 

const MAX_SAFE_SMALL_INTEGER = 2 ** 28;

function splitFileName(name: string): { namePrefix: string, extSuffix: string } {
  const lastDotIndex = name.lastIndexOf('.');

  if (lastDotIndex > 0 && lastDotIndex < name.length - 1) {
    return {
      namePrefix: name.slice(0, lastDotIndex),
      extSuffix: name.slice(lastDotIndex),
    };
  }

  return { namePrefix: name, extSuffix: '' };
}

function incrementFileName(name: string): string {
  const { namePrefix, extSuffix } = splitFileName(name.trim());

  // name copy 5(.txt) => name copy 6(.txt)
  // name copy(.txt) => name copy 2(.txt)
  const suffixRegex = /^(.+ copy)( \d+)?$/i;

  if (suffixRegex.test(namePrefix)) {
    return namePrefix.replace(suffixRegex, (_, g1?, g2?) => {
      const number = (g2 ? parseInt(g2 as string, 10) : 1);

      return number === 0
        ? `${ g1 }`
        : (number < MAX_SAFE_SMALL_INTEGER
          ? `${ g1 } ${ number + 1 }`
          : `${ g1 }${ g2 } copy`);
    }) + extSuffix;
  }

  // name(.txt) => name copy(.txt)
  return `${ namePrefix } copy${ extSuffix }`;
}

/**
 * Generate a new unique label by checking if the label exists and appending "Copy" with index if needed
 */
export const generateNewLabel = (
  proposedLabel: string,
  labels: string[],
): string => {
  const label: string = proposedLabel.trim() || 'Column Set';
  const existing = new Set(labels);

  if (!existing.has(label)) {
    return label;
  }

  let candidate = incrementFileName(label);

  while (existing.has(candidate)) {
    candidate = incrementFileName(candidate);
  }

  return candidate;
};

 

const MAX_SAFE_SMALL_INTEGER = 2 ** 28;

export interface CopyFormat {
  /** The copy keyword (e.g., "copy", "Copy") */
  copyWord: string;
  /** Format for the first copy (no number). Use {copyWord} as placeholder. */
  firstCopyFormat: string;
  /** Format for numbered copies. Use {copyWord} and {number} as placeholders. */
  numberedCopyFormat: string;
}

const DEFAULT_COPY_FORMAT: CopyFormat = {
  copyWord: 'copy',
  firstCopyFormat: '{copyWord}',
  numberedCopyFormat: '{copyWord} {number}',
};

// Predefined formats for common use cases
export const COPY_FORMATS = {
  /** "copy", "copy 2", "copy 3" */
  DEFAULT: DEFAULT_COPY_FORMAT,
  /** "Copy", "Copy 2", "Copy 3" */
  CAPITALIZED: {
    copyWord: 'Copy',
    firstCopyFormat: '{copyWord}',
    numberedCopyFormat: '{copyWord} {number}',
  } as CopyFormat,
  /** "copy", "copy 1", "copy 2" */
  START_WITH_ONE: {
    copyWord: 'copy',
    firstCopyFormat: '{copyWord} 1',
    numberedCopyFormat: '{copyWord} {number}',
  } as CopyFormat,
  /** "Copy (1)", "Copy (2)", "Copy (3)" */
  PARENTHESES: {
    copyWord: 'Copy',
    firstCopyFormat: '{copyWord} (1)',
    numberedCopyFormat: '{copyWord} ({number})',
  } as CopyFormat,
  /** "(1)", "(2)", "(3)" */
  NUMBERS_ONLY: {
    copyWord: '',
    firstCopyFormat: '(1)',
    numberedCopyFormat: '({number})',
  } as CopyFormat,
} as const;

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

function formatCopy(format: string, copyWord: string, number?: number): string {
  return format
    .replace('{copyWord}', copyWord)
    .replace('{number}', number?.toString() ?? '');
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function createRegexPattern(format: string, copyWord: string): string {
  // Create a pattern by replacing placeholders and escaping the result
  let pattern = format;
  
  // Replace placeholders with temporary markers
  pattern = pattern
    .replace('{copyWord}', '___COPYWORD___')
    .replace('{number}', '___NUMBER___');
    
  // Escape the entire pattern
  pattern = escapeRegex(pattern);
  
  // Replace temporary markers with actual regex patterns
  pattern = pattern
    .replace('___COPYWORD___', escapeRegex(copyWord))
    .replace('___NUMBER___', '(\\d+)');
    
  return pattern;
}

export function incrementFileName(name: string, copyFormat: CopyFormat = COPY_FORMATS.DEFAULT): string {
  const { namePrefix, extSuffix } = splitFileName(name.trim());

  // Handle special case where copyWord is empty (like NUMBERS_ONLY format)
  const hasEmptyCopyWord = copyFormat.copyWord === '';
  
  // Create patterns for matching numbered copies
  const numberedPattern = createRegexPattern(copyFormat.numberedCopyFormat, copyFormat.copyWord);
  const numberedRegex = new RegExp(`^(.+)\\s+${numberedPattern}$`, 'i');
  const numberedMatch = namePrefix.match(numberedRegex);
  
  if (numberedMatch) {
    const [, baseName, numberStr] = numberedMatch;
    const number = parseInt(numberStr || '0', 10);
    
    if (number < MAX_SAFE_SMALL_INTEGER) {
      const newSuffix = formatCopy(copyFormat.numberedCopyFormat, copyFormat.copyWord, number + 1);
      return `${baseName} ${newSuffix}${extSuffix}`;
    } else {
      // If number is too large, append another copy
      const newSuffix = formatCopy(copyFormat.firstCopyFormat, copyFormat.copyWord);
      return `${namePrefix} ${newSuffix}${extSuffix}`;
    }
  }
  
  // Try to match first copy format (only if copyWord is not empty)
  if (!hasEmptyCopyWord || copyFormat.firstCopyFormat !== copyFormat.numberedCopyFormat) {
    const firstCopyPattern = createRegexPattern(copyFormat.firstCopyFormat, copyFormat.copyWord);
    const firstCopyRegex = new RegExp(`^(.+)\\s+${firstCopyPattern}$`, 'i');
    const firstCopyMatch = namePrefix.match(firstCopyRegex);
    
    if (firstCopyMatch) {
      const [, baseName] = firstCopyMatch;
      // Determine the next number based on the format
      let nextNumber = 2;
      if (copyFormat === COPY_FORMATS.START_WITH_ONE || copyFormat === COPY_FORMATS.PARENTHESES || copyFormat === COPY_FORMATS.NUMBERS_ONLY) {
        nextNumber = 2;
      }
      const newSuffix = formatCopy(copyFormat.numberedCopyFormat, copyFormat.copyWord, nextNumber);
      return `${baseName} ${newSuffix}${extSuffix}`;
    }
  }

  // No copy suffix found, add first copy
  const newSuffix = formatCopy(copyFormat.firstCopyFormat, copyFormat.copyWord);
  return `${namePrefix} ${newSuffix}${extSuffix}`;
}

/**
 * Generate a new unique label by checking if the label exists and appending "Copy" with index if needed
 */
export const relabelr = (
  proposedLabel: string,
  labels: string[],
  copyFormat: CopyFormat = COPY_FORMATS.DEFAULT,
): string => {
  const label: string = proposedLabel.trim() || 'Unnamed'; // Fallback to 'Unnamed' if empty
  const existing = new Set(labels);

  if (!existing.has(label)) {
    return label;
  }

  let candidate = incrementFileName(label, copyFormat);

  while (existing.has(candidate)) {
    candidate = incrementFileName(candidate, copyFormat);
  }

  return candidate;
};

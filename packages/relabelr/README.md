# relabelr

Smart label duplication and name conflict resolution with customizable copy formats.

`My Label` → `My Label Copy`, `My Label Copy (1)`, `My Label (2)`, etc.

## Features

- 🔄 **Smart incrementing**: Automatically detects existing copy numbers and increments them
- 🎨 **Multiple formats**: Support for different copy suffix styles
- 📁 **File extension aware**: Preserves file extensions when incrementing  
- 🛡️ **Type safe**: Full TypeScript support with proper type definitions
- ⚡ **Performance**: Efficient collision detection using Set for O(1) lookups
- 🌐 **Universal**: Works in browser and Node.js
- 📦 **Lightweight**: Zero dependencies

## Install

```bash
npm install @piadina/relabelr
# or
yarn add @piadina/relabelr
```

## Quick Start

```typescript
import { relabelr, incrementFileName, COPY_FORMATS } from '@piadina/relabelr';

// Basic usage
const uniqueLabel = relabelr('My Document', ['My Document', 'My Document copy']);
// Result: "My Document copy 2"

// With custom format
const uniqueLabel2 = relabelr('My Document', ['My Document'], COPY_FORMATS.PARENTHESES);
// Result: "My Document Copy (1)"
```

## Copy Formats

### Predefined Formats

```typescript
// Default: "copy", "copy 2", "copy 3"
COPY_FORMATS.DEFAULT

// Capitalized: "Copy", "Copy 2", "Copy 3"  
COPY_FORMATS.CAPITALIZED

// Start with one: "copy 1", "copy 2", "copy 3"
COPY_FORMATS.START_WITH_ONE

// Parentheses: "Copy (1)", "Copy (2)", "Copy (3)"
COPY_FORMATS.PARENTHESES

// Numbers only: "(1)", "(2)", "(3)"
COPY_FORMATS.NUMBERS_ONLY
```

### Custom Formats

```typescript
const customFormat: CopyFormat = {
  copyWord: 'duplicate',
  firstCopyFormat: '{copyWord}',           // "duplicate" 
  numberedCopyFormat: '{copyWord}-{number}', // "duplicate-2", "duplicate-3"
};

incrementFileName('Document', customFormat);
// Result: "Document duplicate"
```

## API Reference

### `relabelr(proposedLabel, existingLabels, copyFormat?)`

Generates a unique label by checking against existing labels and appending copy suffixes as needed.

**Parameters:**
- `proposedLabel: string` - The desired label name
- `existingLabels: string[]` - Array of existing labels to check against
- `copyFormat?: CopyFormat` - Optional copy format (defaults to `COPY_FORMATS.DEFAULT`)

**Returns:** `string` - A unique label that doesn't conflict with existing labels

### `incrementFileName(name, copyFormat?)`

Increments a file name by adding or incrementing a copy suffix.

**Parameters:**
- `name: string` - The file name to increment
- `copyFormat?: CopyFormat` - Optional copy format (defaults to `COPY_FORMATS.DEFAULT`)

**Returns:** `string` - The incremented file name

## Examples

### File Name Incrementing

```typescript
import { incrementFileName, COPY_FORMATS } from '@piadina/relabelr';

// Default format
incrementFileName('document.pdf');        // "document copy.pdf"
incrementFileName('document copy.pdf');   // "document copy 2.pdf" 
incrementFileName('document copy 5.pdf'); // "document copy 6.pdf"

// Parentheses format
incrementFileName('document.pdf', COPY_FORMATS.PARENTHESES);     // "document Copy (1).pdf"
incrementFileName('document Copy (1).pdf', COPY_FORMATS.PARENTHESES); // "document Copy (2).pdf"
```

### Label Generation with Collision Detection

```typescript
import { relabelr, COPY_FORMATS } from '@piadina/relabelr';

const existingLabels = ['Report', 'Report copy', 'Report copy 3'];

// Find next available name  
relabelr('Report', existingLabels);
// Result: "Report copy 2" (fills the gap)

// Use different format
relabelr('Report', ['Report'], COPY_FORMATS.PARENTHESES);
// Result: "Report Copy (1)"
```

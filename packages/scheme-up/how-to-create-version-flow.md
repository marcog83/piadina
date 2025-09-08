---
title: How to create a Version Flow
---
# How to create a Version Flow

This tutorial demonstrates how to use the VersionFlow class to validate and migrate schemas across different versions of your data structures.

## Prerequisites

Before starting, install the required dependencies:

```bash
npm install @pesto/scheme-up zod
```

We'll use [Zod](https://zod.dev/) for runtime validation in our advanced examples, as it provides:
- **Type-safe schema validation** with automatic TypeScript inference
- **Composable validation logic** for complex nested structures  
- **Rich error messages** with detailed path information
- **Declarative syntax** that's more maintainable than manual validation

## Section 1: Basic Setup with V1 Schema
Let's start with a practical example where you have Custom User Preferences that follow a V1 schema.

### Define Your Data Types

**Purpose**: Establish the structure for your versioned data schema with strict TypeScript types.

```tsx
// types/user-preferences.ts
export interface UserPreferencesV1Data {
  // Simple string for theme preference
  theme: string;
  // User's preferred language code
  language: string;  
  // Numeric font size in pixels
  fontSize: number;        
}

export interface UserPreferencesV1 {
  // Explicit version field for schema identification
  version: '1.0.0';
  // Actual preference data wrapped in a data field                    
  data: UserPreferencesV1Data;        
}
```

**Key Implementation Notes**:
- The `version` field uses a literal type (`'1.0.0'`) to ensure exact version matching
- Separating `Data` and main interfaces allows for cleaner type composition later
- The versioned wrapper pattern (`{ version, data }`) is essential for the migration system

### Create Validation Functions

**Purpose**: Implement runtime type validation to ensure data integrity before processing.
It is a custom `Assert Type function`. Later in the tutorial we will see how to integrate 3rd party libraries like `zod` to handle the schema validation.

```tsx
// validators/user-preferences.ts
import type { UserPreferencesV1 } from '../types/user-preferences';

export function assertUserPreferencesV1(input: unknown): UserPreferencesV1 {
  // First-level validation: ensure we have an object to work with
  if (!input || typeof input !== 'object') {
    throw new Error('Input must be an object');
  }

  const obj = input as Record<string, unknown>;

  // Version validation: critical for migration chain selection
  if (obj.version !== '1.0.0') {
    throw new Error('Expected version 1.0.0');
  }

  // Data container validation
  if (!obj.data || typeof obj.data !== 'object') {
    throw new Error('Data must be an object');
  }

  const data = obj.data as Record<string, unknown>;

  // Field-by-field validation with specific error messages
  if (typeof data.theme !== 'string') {
    throw new Error('Data.theme must be a string');
  }

  if (typeof data.language !== 'string') {
    throw new Error('Data.language must be a string');
  }

  if (typeof data.fontSize !== 'number') {
    throw new Error('Data.fontSize must be a number');
  }

  // TypeScript assertion: tells the compiler this function validates the type
  return input as UserPreferencesV1;
}
```

**Key Implementation Notes**:
- Acts as a **type guard** - validates unknown input and narrows TypeScript types
- **Progressive validation** from container to specific fields prevents runtime errors
- **Explicit error messages** help with debugging validation failures
- **Version checking** is crucial for the migration system to select the correct chain

### Setup Version Flow and Fetch User Preferences

**Purpose**: Create the validation pipeline and integrate it with data fetching logic.

```tsx
// Create version flow for V1
const preferencesFlow = new VersionFlow<UserPreferencesV1>()
  .add<UserPreferencesV1>((builder) => {
    builder
      // Schema version this node handles
      .version('1.0.0')
      // Semantic version range (compatible with 1.x.x)                    
      .semverRange('^1.0.0') 
      // Validation function to run
      .assert(assertUserPreferencesV1);    
  });

export async function fetchUserPreferences() {
  try {
    // Standard API call to fetch user data
    const response = await fetch('/api/user-preferences');
    const rawData = await response.json();

    // Execute validation through the version flow
    const schemaResult = preferencesFlow.execute(rawData);
    const [ isSuccess, result ] = schemaResult;

    if (!isSuccess) {
      console.error('Validation failed:', result.message);
      // Return the error tuple
      return schemaResult; 
    }

    // Extract validated data from the wrapper
    return [ true, result.data ] as const;
  } catch (error) {
    // Handle network/parsing errors separately from validation errors
    return [
      false,
      new Error(`Fetch failed: ${ error instanceof Error ? error.message : 'Unknown error' }`),
    ] as const;
  }
}

// Usage example
async function loadUserPreferences() {
  const [ isSuccess, result ] = await fetchUserPreferences();

  if (!isSuccess) {
    console.error('Failed to load preferences:', result.message);
    // Handle error case
    return; 
  }

  // TypeScript now knows `result` is UserPreferencesV1Data
  console.log('User theme:', result.theme);
  console.log('User language:', result.language);
  console.log('Font size:', result.fontSize);
}
```

**Key Implementation Notes**:
- **Builder pattern** allows for fluent API configuration
- **Semver ranges** provide flexibility in version compatibility (^1.0.0 accepts 1.0.1, 1.1.0, etc.)
- **Tuple return pattern** `[boolean, T | Error]` enables clean error handling without exceptions
- **Type safety** is maintained throughout - TypeScript knows the exact type after successful validation

## Section 2: Upgrading to V2 with Migration Strategy
Now let's upgrade your User Preferences to V2 and add a migration strategy.

### Define V2 Schema

**Purpose**: Evolve your data structure while maintaining backward compatibility through versioning.

```tsx
// types/user-preferences.ts (updated)
export interface UserPreferencesV1Data {
  theme: string;
  language: string;
  fontSize: number;
}

export interface UserPreferencesV2Data {
  // Reorganized into logical groups for better UX
  appearance: {
    // More specific theme options
    theme: 'light' | 'dark' | 'auto';           
    // Human-readable size names
    fontSize: 'small' | 'medium' | 'large';    
  };
  locale: {
    // Moved to locale group
    language: string;
    // Added region support                           
    region: string;                            
  };
  accessibility: {
    // New accessibility feature
    highContrast: boolean;                     
  };
}

export interface UserPreferencesV1 {
  version: '1.0.0';
  data: UserPreferencesV1Data;
}

export interface UserPreferencesV2 {
  // Bumped major version
  version: '2.0.0';                           
  data: UserPreferencesV2Data;
}
```

**Key Implementation Notes**:
- **Breaking changes** warrant a major version bump (1.0.0 → 2.0.0)
- **Grouped properties** improve organization and future extensibility
- **Enum-like unions** (`'light' | 'dark' | 'auto'`) provide better type safety than free strings
- **Additive changes** like new fields require migration logic to handle legacy data

### Create V2 Validator
**Purpose**: Implement validation logic for the new V2 schema using Zod for more concise and powerful validation. 
We use `zod` library to create an validate the schema.

```tsx
// validators/user-preferences.ts (updated)
import { z } from 'zod';
import type { UserPreferencesV1, UserPreferencesV2 } from '../types/user-preferences';

// ... existing V1 validator ...

// Define Zod schema for V2 validation
const UserPreferencesV2Schema = z.object({
  // Exact version match
  version: z.literal('2.0.0'),                    
  data: z.object({
    appearance: z.object({
      // Enum validation with clear options
      theme: z.enum(['light', 'dark', 'auto']),   
      fontSize: z.enum(['small', 'medium', 'large']),
    }),
    locale: z.object({
      // Non-empty string validation
      language: z.string().min(1),                
      region: z.string().min(1),
    }),
    accessibility: z.object({
       // Strict boolean validation
      highContrast: z.boolean(),                 
    }),
  }),
});

export function assertUserPreferencesV2(input: unknown): asserts input is UserPreferencesV2 {
  try {
    // throw if invalid
    UserPreferencesV2Schema.parse(input); 
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.errors.map(err =>
        `${err.path.join('.')}: ${err.message}`
      ).join(', ');
      throw new Error(`V2 schema validation failed: ${errorMessages}`);
    }

    throw error;
  }
}

```

**Key Implementation Notes**:
- **Declarative schema** - Zod schema reads like documentation and is much more concise
- **Built-in type inference** - Zod automatically infers TypeScript types from the schema
- **Rich validation** - `z.enum()`, `z.literal()`, and `z.string().min(1)` provide precise validation
- **Better error messages** - Zod provides detailed path-based error reporting
- **Composable validation** - Nested `z.object()` calls naturally handle complex structures
- **Two validation approaches** - `parse()` throws errors, `safeParse()` returns result objects
- **Type safety** - The validated result is automatically typed as `UserPreferencesV2`
   
### Update Version Flow with Migration

**Purpose**: Create a migration chain that automatically upgrades V1 data to V2 format.

```tsx
// Updated version flow with V1 to V2 migration
const preferencesFlow = new VersionFlow<UserPreferencesV2>()
  .add<UserPreferencesV1, UserPreferencesV2>((builder) => {
    builder
    // Source version
      .version('1.0.0')                          
      // Accepts any 1.x.x version 
      .semverRange('^1.0.0')  
      // Validate input as V1                   
      .assert(assertUserPreferencesV1)  
// Transform V1 → V2
      .migrate((v1) => {                         
        
        // Migration logic with explicit mappings
        const fontSizeMap: Record<number, 'small' | 'medium' | 'large'> = {
          12: 'small',
          14: 'medium',
          16: 'large',
        };

        const themeMap: Record<string, 'light' | 'dark' | 'auto'> = {
          light: 'light',
          dark: 'dark',
           // Map old 'system' to new 'auto'
          system: 'auto',                        
        };

        return {
           // Target version
          version: '2.0.0',                     
          data: {
            appearance: {
              // Fallback to 'auto'
              theme: themeMap[v1.data.theme] || 'auto',      
              // Fallback to 'medium'
              fontSize: fontSizeMap[v1.data.fontSize] || 'medium', 
            },
            locale: {
              language: v1.data.language,
              // Smart region defaulting
              region: v1.data.language === 'en' ? 'US' : 'GB',     
            },
            accessibility: {
              // Default value for new field
              highContrast: false,                 
            },
          },
        };
      });
  })
  // Handle native V2 data
  .add<UserPreferencesV2>((builder) => {          
    builder
      // Accepts any 2.x.x version
      .version('2.0.0')
      .semverRange('^2.0.0')                     
      // Just validate, no migration needed
      .assert(assertUserPreferencesV2);          
  });

// Usage example
async function loadUserPreferences() {
  const [ isSuccess, result ] = await fetchUserPreferences();

  if (!isSuccess) {
    console.error('Failed to load preferences:', result.message);
    return;
  }

  // Access V2 structure regardless of input version
  console.log('Theme:', result.appearance.theme);
  console.log('Font size:', result.appearance.fontSize);
  console.log('Language:', result.locale.language);
  console.log('Region:', result.locale.region);
  console.log('High contrast:', result.accessibility.highContrast);
}
```

**Key Implementation Notes**:
- **Migration chain** processes data sequentially: V1 input → V1 validation → V1→V2 migration → V2 validation
- **Explicit mapping objects** make transformation logic clear and maintainable
- **Fallback values** handle edge cases where direct mapping isn't possible
- **Smart defaults** for new fields (like region based on language) improve user experience
- **Final output** is always the target type (V2), regardless of input version

## Section 3: Error Handling with Catch

### Simple Error Catching

**Purpose**: Add basic error handling to log validation failures without breaking the application flow.

```tsx
// services/user-preferences.ts (with error handling)
import { VersionFlow } from '@pesto/scheme-up';
import type { UserPreferencesV2Data } from '../types/user-preferences';

const preferencesFlow = new VersionFlow<UserPreferencesV2>()
  .catch((error) => {
    // Simple error logging without recovery
    console.error('Schema validation error:', error);
    
    // Don't return a value - let the error propagate
    // This approach is useful for debugging and monitoring
  })
  .add<UserPreferencesV1, UserPreferencesV2>((builder) => {
    builder
      .version('1.0.0')
      .semverRange('^1.0.0')
      .assert(assertUserPreferencesV1)
      .migrate((v1) => ({
        version: '2.0.0',
        data: {
          appearance: {
            // Simple fallback values
            theme: 'auto',                         
            fontSize: 'medium',
          },
          locale: {
            language: v1.data.language,
            region: 'US',
          },
          accessibility: {
            highContrast: false,
          },
        },
      }));
  })
  .add<UserPreferencesV2>((builder) => {
    builder
      .version('2.0.0')
      .semverRange('^2.0.0')
      .assert(assertUserPreferencesV2);
  });
```

**Key Implementation Notes**:
- **Logging-only approach** - catches errors for monitoring but doesn't recover
- **Error propagation** - the original error continues up the call stack
- **Useful for debugging** - provides visibility into validation failures
- **No fallback data** - application must handle the error case explicitly

### Error Recovery with Fallback

**Purpose**: Implement graceful degradation by providing fallback data when validation fails.

```tsx
// services/user-preferences.ts (with fallback recovery)
const preferencesFlow = new VersionFlow<UserPreferencesV2>()
  .catch((error) => {
    console.error('Schema validation failed, using fallback preferences:', error);
    
    // Return complete fallback user preferences
    return {
      version: '2.0.0',
      data: {
        appearance: {
          // Safe default theme
          theme: 'light',                        
          // Safe default size
          fontSize: 'medium',                    
        },
        locale: {
          // Default to English
          language: 'en',                       
          // Default to US region 
          region: 'US',                         
        },
        accessibility: {
          // Conservative accessibility default
          highContrast: false,                  
        },
      },
    } as UserPreferencesV2;
  })
  .add<UserPreferencesV1, UserPreferencesV2>((builder) => {
    builder
      .version('1.0.0')
      .semverRange('^1.0.0')
      .assert(assertUserPreferencesV1)
      .migrate((v1) => ({
        version: '2.0.0',
        data: {
          appearance: {
            // More sophisticated migration logic
            theme: v1.data.theme === 'dark' ? 'dark' : 'light',
            fontSize: v1.data.fontSize > 14 ? 'large' : 'medium',
          },
          locale: {
            language: v1.data.language,
            // Default **region**
            region: 'US',                       
          },
          accessibility: {
            highContrast: false,
          },
        },
      }));
  })
  .add<UserPreferencesV2>((builder) => {
    builder
      .version('2.0.0')
      .semverRange('^2.0.0')
      .assert(assertUserPreferencesV2);
  });
```

**Key Implementation Notes**:
- **Graceful degradation** - application continues with sensible defaults when data is invalid
- **Complete fallback object** - provides all required fields for the target schema
- **Conservative defaults** - chooses safe, widely-compatible values
- **Error recovery** - transforms failures into successful results with fallback data
- **User experience** - prevents application crashes due to data validation issues

## Summary

This tutorial demonstrates how to:

1. **Start simple** with basic validation and error handling
   - Define strict TypeScript interfaces with explicit version fields
   - Create comprehensive validation functions that act as type guards
   - Set up basic version flows for single-version scenarios

2. **Evolve your schema** while maintaining backward compatibility through migrations
   - Design new schema versions with logical grouping and improved types
   - Implement migration functions that transform old data to new formats
   - Use mapping objects and fallback values for robust data transformation

3. **Handle errors** gracefully with both simple logging and sophisticated fallback strategies
   - Log validation errors for debugging and monitoring
   - Provide fallback data to ensure application resilience
   - Choose between error propagation and graceful degradation based on use case

4. **Build resilient applications** that work even when data validation fails
   - Implement tuple-based error handling for clean, functional error management
   - Maintain type safety throughout the validation and migration process
   - Create flexible semver-based version ranges for forward compatibility

**Core Benefits of the VersionFlow Pattern**:
- **Type Safety**: TypeScript ensures correctness at compile time
- **Runtime Validation**: Protects against invalid data from external sources
- **Schema Evolution**: Enables gradual migration of data structures
- **Error Resilience**: Provides multiple strategies for handling validation failures
- **Developer Experience**: Fluent API makes complex validation chains readable

The `VersionFlow` class provides a foundation for managing schema evolution in your applications while ensuring type safety and graceful error handling.
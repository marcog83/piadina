# Installation

`Scheme-up` is a full working **framework-agnostic**, **type-safe**, **semver-compatible**, **auto-upgrading**, versioned API response handler.

```bash
npm install @piadina/scheme-up
```

## Why use scheme-up?

`scheme-up` helps you safely evolve JSON data structures and API responses over time, with type safety, semver, and automated migrations. It’s ideal when you need to manage breaking changes gracefully and maintain compatibility across versions.

### Key Use Cases

1. **Versioned API Responses**: When your backend evolves but older clients still exist, scheme-up ensures responses are validated and upgraded automatically.
   1. Example: migrating user preferences from V1 → V2 without breaking older apps.
2. **Data Schema Migrations**: For persisted data (local storage, DB JSON fields, config files) that evolves over time, scheme-up applies a controlled migration flow.
   * Example: upgrading settings structure in a local app without losing user data.
3. **Framework-Agnostic Validation**: Works in React, Node, Deno, or any JS runtime without tying you to a framework
   * Example: validating microservice payloads before processing or forwarding.
4. **Backward Compatibility with Semver**: Handles *major/minor/patch* changes automatically, selecting the right validation/migration path based on semver ranges.
   * Example: supporting multiple versions of a shared internal API safely.
5. **Safe Data Pipelines**: When combining data from multiple sources or external APIs, scheme-up guarantees that only valid and compatible data flows through.
   * Example: streaming JSONL data that evolves over time, with older rows automatically upgraded.
6. **Type-Safe Development**: Prevents runtime errors by ensuring TypeScript knows exactly which type is returned after validation and migration.
   * Example: confidently accessing new fields added in a later schema version.

## Usage
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

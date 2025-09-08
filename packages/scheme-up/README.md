# Installation

`Scheme-up` is a full working **framework-agnostic**, **type-safe**, **semver-compatible**, **auto-upgrading**, versioned API response handler.

```bash
npm install @piadina/scheme-up
```

# Usage
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

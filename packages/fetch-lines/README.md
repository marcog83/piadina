# Fetch Lines

Stream and parse (**JSON Lines**)[https://jsonlines.org/] directly with fetch.
Yields parsed JSON objects one line at a time.

## Install

```sh
npm install @piadina/fetch-jsonl
```

## Usage

```tsx
import fetcher from "@piadina/fetch-jsonl";

interface TestItem {
  id: number;
  name: string;
  createdAt?: string;
}

for await (const obj of fetcher.get<TestItem>("https://example.com/data.jsonl")) {
  console.log(obj.id, obj.name);
}
```

## API

```ts
fetcher.get<T = unknown, TError extends Error = Error>(url: RequestInfo | URL, init?: RequestInit): AsyncGenerator<Awaited<T>, void, unknown>

fetcher.post<T = unknown, TError extends Error = Error>(url: RequestInfo | URL, init?: RequestInit): AsyncGenerator<Awaited<T>, void, unknown>

fetcher.put<T = unknown, TError extends Error = Error>(url: RequestInfo | URL, init?: RequestInit): AsyncGenerator<Awaited<T>, void, unknown>

fetcher.patch<T = unknown, TError extends Error = Error>(url: RequestInfo | URL, init?: RequestInit): AsyncGenerator<Awaited<T>, void, unknown>

fetcher.delete<T = unknown, TError extends Error = Error>(url: RequestInfo | URL, init?: RequestInit): AsyncGenerator<Awaited<T>, void, unknown>
```

* **T** – type of parsed objects (default unknown)
* **TError** – error type thrown on invalid JSON (default Error)
* **url** – fetch input (URL or Request)
* **init** – optional fetch init options

Returns an async generator that yields one parsed JSON object per line.

### Example: Handling errors

```tsx 
try {
 
  for await (const obj of fetcher.get<TestItem>('https://api.test/get-data.jsonl')) {
    console.log(obj);
  }
} catch (err) {
  console.error("Invalid JSON line:", err);
}
```

### Example: Handling interceptors

You can modify requests before they're sent using `beforeRequest` hooks. This is useful for adding authentication headers, request IDs, or other common request modifications.

```ts
const addAuthHook = (request: Request) => {
  const newRequest = new Request(request, {
    headers: {
      ...Object.fromEntries(request.headers.entries()),
      'Authorization': 'Bearer test-token',
    },
  });
  return newRequest;
};

const fetcher = createInstance({
  hooks: {
    beforeRequest: [addAuthHook],
  },
});

for await (const obj of fetcher.get<TestItem>('https://api.test/get-data.jsonl')) {
  console.log(obj);
}
```

**How it works:**
- `beforeRequest` hooks receive the original `Request` object
- Each hook can return a new `Request` object with modifications
- Multiple hooks are applied in order, each receiving the result of the previous hook
- If a hook returns `void`, the request passes through unchanged


### Example: Handling Response JSON reviver

Transform JSON data during parsing using a custom reviver function. This is useful for converting string dates to Date objects, parsing numbers, or transforming any data structure during JSON parsing.

```ts
interface TestItemWithDate {
  id: number;
  name: string;
  createdAt?: Date;
}

const reviver = (key: string, value: unknown): unknown => {
  if (key === 'createdAt' && typeof value === 'string') {
    return new Date(value);
  }
  return value;
};

const fetcher = createInstance({ reviver });

for await (const obj of fetcher.get<TestItemWithDate>('https://api.test/get-data.jsonl')) {
  console.log(obj.createdAt instanceof Date); // true - automatically converted!
}
```

**How it works:**
- The reviver function is called for every property during JSON parsing
- Receives the property `key` and its `value` as parameters
- Return the transformed value, or return the original value unchanged
- Perfect for converting ISO date strings to Date objects, parsing stringified numbers, or any custom data transformation

### Example: Handling custom fetch implementation

Use a custom fetch implementation instead of the browser's built-in fetch. This is useful for adding custom retry logic, advanced authentication, request/response interceptors, or when working with libraries like `ky`, `axios`, or `node-fetch`.

```ts
import ky from 'ky';

const fetcher = createInstance({ fetchImpl: ky });

for await (const obj of fetcher.get<TestItem>('https://api.test/get-data.jsonl')) {
  console.log(obj);
}
```

**How it works:**
- Replace the default `fetch` with any compatible HTTP client
- The custom fetch must have the same signature as the standard `fetch` API
- Useful for libraries like `ky` (lightweight HTTP client), `node-fetch` (Node.js), or custom fetch wrappers
- Enables advanced features like automatic retries, request timeouts, or custom error handling

## Why JSON Lines?

1. Works well for streaming APIs and large datasets
2. You can start processing before the entire file downloads
3. Friendly for incremental logs, events, and messages

## Related

* [JSONLines](https://jsonlines.org) – spec
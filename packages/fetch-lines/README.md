# Fetch Lines

Stream and parse (**JSON Lines**)[https://jsonlines.org/] directly with fetch.
Yields parsed JSON objects one line at a time.

## Install

```sh
npm install @piadina/fetch-jsonl
```

## Usage

```tsx
import fetchJSONLines from "@piadina/fetch-jsonl";

type Item = { id: number; name: string };

for await (const obj of fetchJSONLines<Item>("https://example.com/data.jsonl")) {
  console.log(obj.id, obj.name);
}
```

## API

```ts
fetchJSONLines<T = unknown, TError extends Error = Error>(input: RequestInfo | URL, init?: RequestInit): AsyncGenerator<T>
```

* **T** – type of parsed objects (default unknown)
* **TError** – error type thrown on invalid JSON (default Error)
* **input** – fetch input (URL or Request)
* **init** – optional fetch init options

Returns an async generator that yields one parsed JSON object per line.

### Example: Handling errors

```tsx 
try {
  for await (const obj of fetchJSONLines("https://example.com/data.jsonl")) {
    console.log(obj);
  }
} catch (err) {
  console.error("Invalid JSON line:", err);
}
```

## Why JSON Lines?

1. Works well for streaming APIs and large datasets
2. You can start processing before the entire file downloads
3. Friendly for incremental logs, events, and messages

## Related

* [JSONLines](https://jsonlines.org) – spec
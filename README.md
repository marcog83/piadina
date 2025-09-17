# 🫓 Piadina
flatbread from Romagna, Italian street food classic, pronounced [pjaˈdiːna] — like *pya-DEE-nah*. It is collection of small, flavorful utilities for modern JavaScript/TypeScript projects.

It’s a base (you can fill it with anything) → exactly like each package. — mix only what you need.

## Packages

* **@piadina/scheme-up**
  * Type-safe, versioned API response handler with automatic migrations and semver support. Perfect for evolving JSON contracts over time.
  * [Full tutorial & examples](packages/scheme-up/how-to-create-version-flow.md)
* **@piadina/fetch-jsonl**
  * Stream and parse JSON Lines (JSONL/NDJSON) directly with fetch. Yields parsed JSON objects one line at a time using async generators.
  * Perfect for handling large datasets, streaming APIs, and real-time data processing.
  * [README & usage](packages/fetch-lines/README.md)
* **@piadina/relabelr**
  * Smart label and filename conflict resolution with customizable copy formats. Automatically generates unique names like "Copy", "Copy (1)", or custom patterns.
  * Ideal for file management systems, document editors, and preventing duplicate names in UIs.
  * [README & usage](packages/relabelr/README.md)

## Installation

```sh
npm install @piadina/scheme-up
npm install @piadina/fetch-jsonl
npm install @piadina/relabelr
```

## License

MIT

## Philosophy

Piadina is about:

* **Small portions** → each package solves one problem.

* **Composable recipes** → utilities can be combined freely.

* **Simple ingredients** → minimal dependencies, clear APIs.


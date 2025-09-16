import { LinesTransformer } from "./lines-transformer";

export interface FetchJSONLOptions {
  fetchImpl?: typeof fetch;
  reviver?: Parameters<typeof JSON.parse>[1];
  hooks?: {
    beforeRequest?: Array<(request: Request) => Request | void | Promise<Request | void>>;
  };
}

export class FetchJSONL {
  private static instance: FetchJSONL;
  #fetchImpl: typeof fetch;
  #reviver?: FetchJSONLOptions["reviver"];
  private hooks: NonNullable<FetchJSONLOptions["hooks"]> = { beforeRequest: [] };

  constructor(options: FetchJSONLOptions = {}) {
    this.#fetchImpl = options.fetchImpl ?? fetch;
    this.#reviver = options.reviver;
    this.hooks = { ...this.hooks, ...(options?.hooks ?? {}) };
  }

  private parseJSON<T>(input: string): T {
    return JSON.parse(input, this.#reviver) as T;
  }

  private async applyBeforeRequestHooks(request: Request): Promise<Request> {
    let req = request;
    for (const hook of this.hooks.beforeRequest ?? []) {
      const result = await hook(req);
      if (result instanceof Request) {
        req = result;
      }
    }
    return req;
  }

  async *stream<T = unknown, TError extends Error = Error>(
    input: RequestInfo | URL,
    init?: RequestInit,
  ): AsyncGenerator<T, void, unknown> {
    let request = input instanceof Request ? input : new Request(input, init);
    request = await this.applyBeforeRequestHooks(request);

    const response = await this.#fetchImpl(request);

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    if (!response.body) {
      throw new Error("Response body is null");
    }

    const ts = new TransformStream<Uint8Array, string>(new LinesTransformer());
    const rs = response.body.pipeThrough(ts);
    const reader = rs.getReader();

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        try {
          yield this.parseJSON<T>(value);
        } catch (e) {
          throw e as TError;
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  #validateRequestMethod(input: RequestInfo | URL, expected: string) {
    if (input instanceof Request && input.method.toUpperCase() !== expected) {
      throw new Error(
        `Request method mismatch: expected ${expected}, got ${input.method}`,
      );
    }
  }

  get<T = unknown, TError extends Error = Error>(url: RequestInfo | URL, init?: RequestInit) {
    this.#validateRequestMethod(url, "GET");
    return this.stream<T, TError>(url, { ...init, method: "GET" });
  }

  post<T = unknown, TError extends Error = Error>(url: RequestInfo | URL, init?: RequestInit) {
    this.#validateRequestMethod(url, "POST");
    return this.stream<T, TError>(url, { ...init, method: "POST" });
  }

  put<T = unknown, TError extends Error = Error>(url: RequestInfo | URL, init?: RequestInit) {
    this.#validateRequestMethod(url, "PUT");
    return this.stream<T, TError>(url, { ...init, method: "PUT" });
  }

  patch<T = unknown, TError extends Error = Error>(url: RequestInfo | URL, init?: RequestInit) {
    this.#validateRequestMethod(url, "PATCH");
    return this.stream<T, TError>(url, { ...init, method: "PATCH" });
  }

  delete<T = unknown, TError extends Error = Error>(url: RequestInfo | URL, init?: RequestInit) {
    this.#validateRequestMethod(url, "DELETE");
    return this.stream<T, TError>(url, { ...init, method: "DELETE" });
  }
}

// --- createInstance factory ---
export const createInstance = (defaults: FetchJSONLOptions = {}) => {
  return new FetchJSONL(defaults);
};

// default export
const fetchJSONL = createInstance();

export default fetchJSONL;
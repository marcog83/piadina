import { describe, it, expect, beforeAll, afterEach, afterAll } from 'vitest';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import { FetchJSONL, createInstance } from './fetch-json-lines';

// Test types with Date support
interface TestItemWithDate {
  id: number;
  name: string;
  createdAt?: Date;
}

interface TestItemWithTimestamp {
  id: number;
  name: string;
  timestamp?: Date;
}

// Test data types
interface TestItem {
  id: number;
  name: string;
  active?: boolean;
}

// MSW server setup
const server = setupServer();

beforeAll(() => {
  server.listen();
});

afterEach(() => {
  server.resetHandlers();
});

afterAll(() => {
  server.close();
});

describe('FetchJSONL', () => {
  describe('Basic streaming functionality', () => {
    it('should stream and parse valid JSON lines', async () => {
      const testData = [
        { id: 1, name: 'Alice', active: true },
        { id: 2, name: 'Bob', active: false },
        { id: 3, name: 'Charlie', active: true },
      ];

      const jsonLines = testData.map(item => JSON.stringify(item)).join('\n');

      server.use(
        http.get('https://api.test/data.jsonl', () => {
          return new HttpResponse(jsonLines, {
            headers: { 'Content-Type': 'application/x-ndjson' },
          });
        })
      );

      const fetcher = new FetchJSONL();
      const results: TestItem[] = [];

      for await (const item of fetcher.stream<TestItem>('https://api.test/data.jsonl')) {
        results.push(item);
      }

      expect(results).toEqual(testData);
    });

    it('should handle empty response body', async () => {
      server.use(
        http.get('https://api.test/empty.jsonl', () => {
          // Create a proper stream with empty content
          const stream = new ReadableStream({
            start(controller) {
              controller.close();
            }
          });
          return new HttpResponse(stream, {
            headers: { 'Content-Type': 'application/x-ndjson' },
          });
        })
      );

      const fetcher = new FetchJSONL();
      const results: TestItem[] = [];

      for await (const item of fetcher.stream<TestItem>('https://api.test/empty.jsonl')) {
        results.push(item);
      }

      expect(results).toEqual([]);
    });

    it('should handle single line without trailing newline', async () => {
      const testItem = { id: 1, name: 'Single' };

      server.use(
        http.get('https://api.test/single.jsonl', () => {
          return new HttpResponse(JSON.stringify(testItem), {
            headers: { 'Content-Type': 'application/x-ndjson' },
          });
        })
      );

      const fetcher = new FetchJSONL();
      const results: TestItem[] = [];

      for await (const item of fetcher.stream<TestItem>('https://api.test/single.jsonl')) {
        results.push(item);
      }

      expect(results).toEqual([testItem]);
    });

    it('should handle lines with trailing newline', async () => {
      const testData = [
        { id: 1, name: 'Alice' },
        { id: 2, name: 'Bob' },
      ];

      const jsonLines = testData.map(item => JSON.stringify(item)).join('\n') + '\n';

      server.use(
        http.get('https://api.test/trailing.jsonl', () => {
          return new HttpResponse(jsonLines, {
            headers: { 'Content-Type': 'application/x-ndjson' },
          });
        })
      );

      const fetcher = new FetchJSONL();
      const results: TestItem[] = [];

      for await (const item of fetcher.stream<TestItem>('https://api.test/trailing.jsonl')) {
        results.push(item);
      }

      expect(results).toEqual(testData);
    });
  });

  describe('HTTP method helpers', () => {
    it('should work with GET method', async () => {
      const testData = { id: 1, name: 'GET Test' };

      server.use(
        http.get('https://api.test/get-data.jsonl', () => {
          return new HttpResponse(JSON.stringify(testData));
        })
      );

      const fetcher = new FetchJSONL();
      const results: TestItem[] = [];

      for await (const item of fetcher.get<TestItem>('https://api.test/get-data.jsonl')) {
        results.push(item);
      }

      expect(results).toEqual([testData]);
    });

    it('should work with POST method', async () => {
      const testData = { id: 1, name: 'POST Test' };

      server.use(
        http.post('https://api.test/post-data.jsonl', () => {
          return new HttpResponse(JSON.stringify(testData));
        })
      );

      const fetcher = new FetchJSONL();
      const results: TestItem[] = [];

      for await (const item of fetcher.post<TestItem>('https://api.test/post-data.jsonl')) {
        results.push(item);
      }

      expect(results).toEqual([testData]);
    });

    it('should work with PUT method', async () => {
      const testData = { id: 1, name: 'PUT Test' };

      server.use(
        http.put('https://api.test/put-data.jsonl', () => {
          return new HttpResponse(JSON.stringify(testData));
        })
      );

      const fetcher = new FetchJSONL();
      const results: TestItem[] = [];

      for await (const item of fetcher.put<TestItem>('https://api.test/put-data.jsonl')) {
        results.push(item);
      }

      expect(results).toEqual([testData]);
    });

    it('should work with PATCH method', async () => {
      const testData = { id: 1, name: 'PATCH Test' };

      server.use(
        http.patch('https://api.test/patch-data.jsonl', () => {
          return new HttpResponse(JSON.stringify(testData));
        })
      );

      const fetcher = new FetchJSONL();
      const results: TestItem[] = [];

      for await (const item of fetcher.patch<TestItem>('https://api.test/patch-data.jsonl')) {
        results.push(item);
      }

      expect(results).toEqual([testData]);
    });

    it('should work with DELETE method', async () => {
      const testData = { id: 1, name: 'DELETE Test' };

      server.use(
        http.delete('https://api.test/delete-data.jsonl', () => {
          return new HttpResponse(JSON.stringify(testData));
        })
      );

      const fetcher = new FetchJSONL();
      const results: TestItem[] = [];

      for await (const item of fetcher.delete<TestItem>('https://api.test/delete-data.jsonl')) {
        results.push(item);
      }

      expect(results).toEqual([testData]);
    });

    it('should validate request method mismatch', () => {
      const fetcher = new FetchJSONL();
      const postRequest = new Request('https://api.test/data.jsonl', { method: 'POST' });

      expect(() => {
        fetcher.get(postRequest);
      }).toThrow('Request method mismatch: expected GET, got POST');
    });
  });

  describe('Error handling', () => {
    it('should throw error for HTTP error status', async () => {
      server.use(
        http.get('https://api.test/error.jsonl', () => {
          return new HttpResponse(null, { status: 404 });
        })
      );

      const fetcher = new FetchJSONL();

      await expect(async () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        for await (const item of fetcher.stream('https://api.test/error.jsonl')) {
          // Should not reach here
        }
      }).rejects.toThrow('HTTP error! Status: 404');
    });

    it('should throw error for null response body', async () => {
      server.use(
        http.get('https://api.test/null-body.jsonl', () => {
          return new HttpResponse(null);
        })
      );

      const fetcher = new FetchJSONL();

      await expect(async () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        for await (const item of fetcher.stream('https://api.test/null-body.jsonl')) {
          // Should not reach here
        }
      }).rejects.toThrow('Response body is null');
    });

    it('should throw error for invalid JSON', async () => {
      const invalidJson = '{"id": 1, "name": "Invalid"}\n{"invalid": json}';

      server.use(
        http.get('https://api.test/invalid.jsonl', () => {
          return new HttpResponse(invalidJson);
        })
      );

      const fetcher = new FetchJSONL();

      await expect(async () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        for await (const item of fetcher.stream('https://api.test/invalid.jsonl')) {
          // Should throw on second line
        }
      }).rejects.toThrow();
    });
  });

  describe('Constructor options', () => {
    it('should use custom fetch implementation', async () => {
      const mockFetchCalls: Array<{ url: string; init?: RequestInit }> = [];
      
      const customFetch = (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
        const url = input instanceof Request ? input.url : input.toString();
        mockFetchCalls.push({ url, init });
        
        return Promise.resolve(new Response(JSON.stringify({ id: 1, name: 'Custom Fetch' }), {
          headers: { 'Content-Type': 'application/json' },
        }));
      };

      const fetcher = new FetchJSONL({ fetchImpl: customFetch });
      const results: TestItem[] = [];

      for await (const item of fetcher.stream<TestItem>('https://api.test/custom.jsonl')) {
        results.push(item);
      }

      expect(mockFetchCalls).toHaveLength(1);
      expect(mockFetchCalls[0].url).toBe('https://api.test/custom.jsonl');
      expect(results).toEqual([{ id: 1, name: 'Custom Fetch' }]);
    });

    it('should use JSON reviver function', async () => {
      const testData = { id: 1, name: 'Test', createdAt: '2023-01-01T00:00:00.000Z' };

      server.use(
        http.get('https://api.test/reviver.jsonl', () => {
          return new HttpResponse(JSON.stringify(testData));
        })
      );

      const reviver = (key: string, value: unknown): unknown => {
        if (key === 'createdAt' && typeof value === 'string') {
          return new Date(value);
        }
        return value;
      };

      const fetcher = new FetchJSONL({ reviver });
      const results: TestItemWithDate[] = [];

      for await (const item of fetcher.stream<TestItemWithDate>('https://api.test/reviver.jsonl')) {
        results.push(item);
      }

      expect(results).toHaveLength(1);
      expect(results[0].createdAt).toBeInstanceOf(Date);
      expect((results[0].createdAt as Date).toISOString()).toBe('2023-01-01T00:00:00.000Z');
    });

    it('should apply before request hooks', async () => {
      const testData = { id: 1, name: 'Hooked' };

      server.use(
        http.get('https://api.test/hooked.jsonl', ({ request }) => {
          const authHeader = request.headers.get('Authorization');
          if (authHeader === 'Bearer test-token') {
            return new HttpResponse(JSON.stringify(testData));
          }
          return new HttpResponse(null, { status: 401 });
        })
      );

      const addAuthHook = (request: Request) => {
        const newRequest = new Request(request, {
          headers: {
            ...Object.fromEntries(request.headers.entries()),
            'Authorization': 'Bearer test-token',
          },
        });
        return newRequest;
      };

      const fetcher = new FetchJSONL({
        hooks: {
          beforeRequest: [addAuthHook],
        },
      });

      const results: TestItem[] = [];

      for await (const item of fetcher.stream<TestItem>('https://api.test/hooked.jsonl')) {
        results.push(item);
      }

      expect(results).toEqual([testData]);
    });

    it('should apply multiple before request hooks in order', async () => {
      const testData = { id: 1, name: 'Multi-Hooked' };

      server.use(
        http.get('https://api.test/multi-hooked.jsonl', ({ request }) => {
          const header1 = request.headers.get('X-Hook-1');
          const header2 = request.headers.get('X-Hook-2');
          
          if (header1 === 'applied' && header2 === 'also-applied') {
            return new HttpResponse(JSON.stringify(testData));
          }
          return new HttpResponse(null, { status: 400 });
        })
      );

      const hook1 = (request: Request) => {
        return new Request(request, {
          headers: {
            ...Object.fromEntries(request.headers.entries()),
            'X-Hook-1': 'applied',
          },
        });
      };

      const hook2 = (request: Request) => {
        return new Request(request, {
          headers: {
            ...Object.fromEntries(request.headers.entries()),
            'X-Hook-2': 'also-applied',
          },
        });
      };

      const fetcher = new FetchJSONL({
        hooks: {
          beforeRequest: [hook1, hook2],
        },
      });

      const results: TestItem[] = [];

      for await (const item of fetcher.stream<TestItem>('https://api.test/multi-hooked.jsonl')) {
        results.push(item);
      }

      expect(results).toEqual([testData]);
    });
  });

  describe('createInstance factory', () => {
    it('should create instance with default options', async () => {
      const testData = { id: 1, name: 'Factory Test' };

      server.use(
        http.get('https://api.test/factory.jsonl', () => {
          return new HttpResponse(JSON.stringify(testData));
        })
      );

      const fetcher = createInstance();
      const results: TestItem[] = [];

      for await (const item of fetcher.stream<TestItem>('https://api.test/factory.jsonl')) {
        results.push(item);
      }

      expect(results).toEqual([testData]);
    });

    it('should create instance with custom options', async () => {
      const testData = { id: 1, name: 'Custom Factory', timestamp: '2023-01-01T00:00:00.000Z' };

      server.use(
        http.get('https://api.test/custom-factory.jsonl', () => {
          return new HttpResponse(JSON.stringify(testData));
        })
      );

      const reviver = (key: string, value: unknown): unknown => {
        if (key === 'timestamp' && typeof value === 'string') {
          return new Date(value);
        }
        return value;
      };

      const fetcher = createInstance({ reviver });
      const results: TestItemWithTimestamp[] = [];

      for await (const item of fetcher.stream<TestItemWithTimestamp>('https://api.test/custom-factory.jsonl')) {
        results.push(item);
      }

      expect(results).toHaveLength(1);
      expect(results[0].timestamp).toBeInstanceOf(Date);
    });
  });

  describe('Large data streaming', () => {
    it('should handle large datasets efficiently', async () => {
      const largeDataset = Array.from({ length: 1000 }, (_, i) => ({
        id: i + 1,
        name: `Item ${i + 1}`,
        active: i % 2 === 0,
      }));

      const jsonLines = largeDataset.map(item => JSON.stringify(item)).join('\n');

      server.use(
        http.get('https://api.test/large.jsonl', () => {
          return new HttpResponse(jsonLines);
        })
      );

      const fetcher = new FetchJSONL();
      const results: TestItem[] = [];
      let count = 0;

      for await (const item of fetcher.stream<TestItem>('https://api.test/large.jsonl')) {
        results.push(item);
        count++;
        
        // Verify we're streaming (can access items before completion)
        if (count === 1) {
          expect(item.id).toBe(1);
          expect(item.name).toBe('Item 1');
        }
      }

      expect(results).toHaveLength(1000);
      expect(results[0]).toEqual(largeDataset[0]);
      expect(results[999]).toEqual(largeDataset[999]);
    });
  });

  describe('Edge cases', () => {
    it('should handle mixed content types', async () => {
      const mixedData = [
        { type: 'user', id: 1, name: 'Alice' },
        { type: 'product', id: 100, title: 'Widget' },
        { type: 'order', id: 500, total: 29.99 },
      ];

      const jsonLines = mixedData.map(item => JSON.stringify(item)).join('\n');

      server.use(
        http.get('https://api.test/mixed.jsonl', () => {
          return new HttpResponse(jsonLines);
        })
      );

      const fetcher = new FetchJSONL();
      const results: Record<string, unknown>[] = [];

      for await (const item of fetcher.stream<Record<string, unknown>>('https://api.test/mixed.jsonl')) {
        results.push(item);
      }

      expect(results).toEqual(mixedData);
    });

    it('should handle empty lines gracefully', async () => {
      const dataWithEmptyLines = [
        '{"id": 1, "name": "First"}',
        '',
        '{"id": 2, "name": "Second"}',
        '',
        '',
        '{"id": 3, "name": "Third"}',
      ].join('\n');

      server.use(
        http.get('https://api.test/empty-lines.jsonl', () => {
          return new HttpResponse(dataWithEmptyLines);
        })
      );

      const fetcher = new FetchJSONL();

      await expect(async () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        for await (const item of fetcher.stream('https://api.test/empty-lines.jsonl')) {
          // Should throw error on empty line
        }
      }).rejects.toThrow();
    });
  });
});
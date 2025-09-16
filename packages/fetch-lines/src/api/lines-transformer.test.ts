import { LinesTransformer } from './lines-transformer';
import {describe, it, expect} from 'vitest';
describe('LinesTransformer', () => {
  const encoder = new TextEncoder();

  function createMockController() {
    const chunks: string[] = [];
    const controller = {
      enqueue: (chunk: string) => {
        chunks.push(chunk);
      },
    } as TransformStreamDefaultController<string>;

    return { controller, chunks };
  }

  it('should split lines within a single chunk', () => {
    const transformer = new LinesTransformer();
    const { controller, chunks } = createMockController();

    const text = 'line1\nline2\nline3';
    const chunk = encoder.encode(text);

    transformer.transform(chunk, controller);
    transformer.flush(controller);

    expect(chunks).toEqual([ 'line1', 'line2', 'line3' ]);
  });

  it('should handle lines split across multiple chunks', () => {
    const transformer = new LinesTransformer();
    const { controller, chunks } = createMockController();

    const text1 = 'line1\nline';
    const text2 = '2\nline3';
    const chunk1 = encoder.encode(text1);
    const chunk2 = encoder.encode(text2);

    transformer.transform(chunk1, controller);
    transformer.transform(chunk2, controller);
    transformer.flush(controller);

    expect(chunks).toEqual([ 'line1', 'line2', 'line3' ]);
  });

  it('should handle different newline characters', () => {
    const transformer = new LinesTransformer();
    const { controller, chunks } = createMockController();

    const text = 'line1\r\nline2\rline3\nline4';
    const chunk = encoder.encode(text);

    transformer.transform(chunk, controller);
    transformer.flush(controller);

    expect(chunks).toEqual([ 'line1', 'line2', 'line3', 'line4' ]);
  });

  it('should handle incomplete JSON values at the end of chunks', () => {
    const transformer = new LinesTransformer();
    const { controller, chunks } = createMockController();

    // JSON objects split across chunks
    const text1 = '{"id":1,"name":"Alice"}\n{"id":2,"name":"B';
    const text2 = 'ob"}\n{"id":3,"name":"Charlie"}';
    const chunk1 = encoder.encode(text1);
    const chunk2 = encoder.encode(text2);

    transformer.transform(chunk1, controller);
    transformer.transform(chunk2, controller);
    transformer.flush(controller);

    expect(chunks).toEqual([
      '{"id":1,"name":"Alice"}',
      '{"id":2,"name":"Bob"}',
      '{"id":3,"name":"Charlie"}',
    ]);
  });

  it('should handle empty input', () => {
    const transformer = new LinesTransformer();
    const { controller, chunks } = createMockController();

    transformer.flush(controller);

    expect(chunks).toEqual([]);
  });

  it('should handle chunks ending with newline', () => {
    const transformer = new LinesTransformer();
    const { controller, chunks } = createMockController();

    const text1 = 'line1\nline2\n';
    const text2 = 'line3\nline4\n';
    const chunk1 = encoder.encode(text1);
    const chunk2 = encoder.encode(text2);

    transformer.transform(chunk1, controller);
    transformer.transform(chunk2, controller);
    transformer.flush(controller);

    expect(chunks).toEqual([ 'line1', 'line2', 'line3', 'line4' ]);
  });

  it('should handle chunks with no newline', () => {
    const transformer = new LinesTransformer();
    const { controller, chunks } = createMockController();

    const text1 = 'line1';
    const text2 = 'line2';
    const chunk1 = encoder.encode(text1);
    const chunk2 = encoder.encode(text2);

    transformer.transform(chunk1, controller);
    transformer.transform(chunk2, controller);
    transformer.flush(controller);

    expect(chunks).toEqual([ 'line1line2' ]);
  });

  it('should handle multiple newline characters in a row', () => {
    const transformer = new LinesTransformer();
    const { controller, chunks } = createMockController();

    const text = 'line1\n\nline2\n\n\nline3';
    const chunk = encoder.encode(text);

    transformer.transform(chunk, controller);
    transformer.flush(controller);

    expect(chunks).toEqual([ 'line1', '', 'line2', '', '', 'line3' ]);
  });

  it('should handle large data split across many chunks', () => {
    const transformer = new LinesTransformer();
    const { controller, chunks } = createMockController();

    const linesInput = Array.from({ length: 1000 }, (_, i) => `line${ i + 1 }`);
    const text = linesInput.join('\n');
    const encodedText = encoder.encode(text);
    const chunkSize = 1024; // 1KB

    // Split the encoded text into chunks
    for (let i = 0; i < encodedText.length; i += chunkSize) {
      const chunk = encodedText.subarray(i, i + chunkSize);

      transformer.transform(chunk, controller);
    }

    transformer.flush(controller);

    expect(chunks).toEqual(linesInput);
  });
});
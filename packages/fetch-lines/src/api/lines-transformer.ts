const LINE_SPLIT_REGEX = /\r\n|[\r\n]/g;

export class LinesTransformer implements Transformer<Uint8Array, string> {
  lastString = '';

  decoder = new TextDecoder();

  transform(chunk: Uint8Array, controller: TransformStreamDefaultController<string>) {
    const string = `${ this.lastString }${ this.decoder.decode(chunk, { stream: true }) }`;
    const lines = string.split(LINE_SPLIT_REGEX);

    this.lastString = lines.pop() || '';

    lines.forEach((line) => {
      controller.enqueue(line);
    });
  }

  flush(controller: TransformStreamDefaultController<string>) {
    if (this.lastString) {
      controller.enqueue(this.lastString);
    }
  }
}

import { parseZOptions } from './parse-options';

describe('parseZOptions', () => {
  it('recognizes all options by default', async () => {

    const recognized = await parseZOptions(['some', '--test', 'val1', 'val2', '-tVALUE', '--test', 'val3']);

    expect(recognized).toEqual({
      some: [],
      '--test': ['val1', 'val2', 'val3'],
      '-tVALUE': [],
    });
  });
  it('recognizes all positional options', async () => {

    const recognized = await parseZOptions(['some', 'other', 'third', '--test', 'val1', 'val2']);

    expect(recognized).toEqual({
      some: [],
      other: [],
      third: [],
      '--test': ['val1', 'val2'],
    });
  });
  it('recognizes `--name=value` syntax', async () => {

    const recognized = await parseZOptions(['--name=value']);

    expect(recognized).toEqual({
      '--name': ['value'],
    });
  });
  it('recognizes `-name=value` syntax', async () => {

    const recognized = await parseZOptions(['-name=value', '-n=v']);

    expect(recognized).toEqual({
      '-name': ['value'],
      '-n': ['v'],
    });
  });
  it('recognizes short options syntax', async () => {

    const recognized = await parseZOptions(['-name', 'value', '-nop']);

    expect(recognized).toEqual({
      '-name': ['value'],
      '-nop': [],
    });
  });
});

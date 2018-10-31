import newRegExp from '../src';

describe('newRegExp(expression)', () => {
  it('should detect expression with flags', async () => {
    expect(newRegExp('/hello/mgiyu')).toEqual(/hello/gimuy);
  });

  it('should detect expression without flags', async () => {
    expect(newRegExp('/hello/')).toEqual(/hello/);
  });

  it('should detect empty expression', async () => {
    expect(newRegExp('//')).toEqual(new RegExp(''));
  });

  it('should detect empty expression with flags', async () => {
    expect(newRegExp('//mgiyu')).toEqual(new RegExp('', 'mgiyu'));
  });

  it('should work end to end', async () => {
    expect(newRegExp('/hello/').test('hello')).toBe(true);
  });

  it('should fail when invalid flags', async () => {
    try {
      newRegExp('//abc');
      expect(true).toBe(true);
    } catch (err) {
      expect(err).toEqual(
        new Error("Invalid flags supplied to RegExp constructor 'abc'")
      );
    }
  });
});

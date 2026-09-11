import { describe, it, expect } from 'vitest';
import '../__tests__/setup/env';
import { PermissionError } from '@/lib/permissions';

describe('PermissionError', () => {
  it('is an instance of Error with the right name', () => {
    const err = new PermissionError('Missing EDIT permission on SETTINGS.');
    expect(err).toBeInstanceOf(Error);
    expect(err.name).toBe('PermissionError');
    expect(err.message).toBe('Missing EDIT permission on SETTINGS.');
  });

  it('is distinguishable from a generic Error via instanceof', () => {
    const permissionErr = new PermissionError('nope');
    const genericErr = new Error('nope');
    expect(permissionErr instanceof PermissionError).toBe(true);
    expect(genericErr instanceof PermissionError).toBe(false);
  });
});

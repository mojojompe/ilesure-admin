import { vi } from 'vitest';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// @hugeicons/react ships ~3,900 icon modules; transforming them makes every test run
// slow. Tests never assert on icons, so each named icon becomes an empty component.
vi.mock('@hugeicons/react', () => {
  const Icon = () => null;
  return new Proxy({ __esModule: true }, {
    get: (target, key) => (key in target ? (target as any)[key] : key === 'then' ? undefined : Icon),
    has: () => true,
  });
});

afterEach(() => cleanup());

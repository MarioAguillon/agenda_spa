import { describe, it, expect, vi } from 'vitest';

const { findMany } = vi.hoisted(() => ({ findMany: vi.fn(async () => []) }));
vi.mock('../../src/config/database', () => ({ prisma: { servicio: { findMany } } }));

import { serviciosRepository } from '../../src/repositories/servicios.repository';

describe('Catálogo público de servicios', () => {
  it('no expone el precio a las clientas', async () => {
    await serviciosRepository.findPublicos('neg-1');
    const args = (findMany.mock.calls[0] as any[])[0];
    expect(args.select).toBeDefined();
    expect(args.select.precio).toBeUndefined();
    expect(args.where).toMatchObject({ negocioId: 'neg-1', activo: true });
  });
});

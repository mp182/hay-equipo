import { Player } from '../models/player.interface';

export type AdminRole = 'admin' | 'superadmin';

/**
 * Sin rol: `true` para admins y superadmins (igual que `isAdmin()` en las reglas de Firestore).
 * Con un rol: solo ese rol (por ejemplo, lo que es exclusivo del superadmin).
 */
export function hasAdminRole(player: Pick<Player, 'roles'> | null | undefined, role?: AdminRole): boolean {
  const roles = player?.roles ?? [];
  return role ? roles.includes(role) : roles.includes('admin') || roles.includes('superadmin');
}

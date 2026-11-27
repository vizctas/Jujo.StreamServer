// What the signed-in person may do on this server. `permissions` comes from /api/auth/status
// (launch | guests | admin; ["admin"] = full). Older servers omit it: only a 'viewer' guest is limited then.
export interface Access {
  permissions?: string[];
  guestRole?: string;
}

export const canLaunch = (a: Access): boolean =>
  a.permissions ? a.permissions.some((p) => p === 'launch' || p === 'admin') : a.guestRole !== 'viewer';

/**
 * Static-site session helpers.
 *
 * The Fittrust Medicals frontend no longer uses Prisma,
 * database sessions, or server-side authentication.
 */

export async function getCurrentUser() {
  return null;
}

export function requireAuth(user: any) {
  if (!user) {
    return { error: 'Unauthorized', status: 401 };
  }

  return null;
}

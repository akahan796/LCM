// Vercel Edge Function — signs the user out on the SERVER.
// The session cookie is HttpOnly (not reachable from browser JS), so clearing it
// must happen here: we overwrite it with an expired cookie and bounce to login.

export const config = { runtime: 'edge' };

export default function handler(request) {
  const origin = new URL(request.url).origin;
  return new Response(null, {
    status: 303,
    headers: {
      'Location': origin + '/login.html',
      'Set-Cookie': 'lcm_auth=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0',
      'Cache-Control': 'no-store',
    },
  });
}

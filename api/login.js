// Vercel Edge Function — validates the password on the SERVER.
// Reads ACCESS_PASSWORD and SESSION_TOKEN from environment variables (set in
// the Vercel dashboard; never shipped to the browser). On a correct password it
// sets an HttpOnly, Secure, session cookie (no expiry -> cleared when the
// browser session ends) and redirects to the app. Otherwise it bounces back to
// the login page with an error flag.

export const config = { runtime: 'edge' };

export default async function handler(request) {
  const origin = new URL(request.url).origin;
  if (request.method !== 'POST') {
    return Response.redirect(origin + '/login.html', 302);
  }

  let password = '';
  try {
    const ct = request.headers.get('content-type') || '';
    if (ct.includes('application/json')) {
      password = (await request.json()).password || '';
    } else {
      const form = await request.formData();
      password = form.get('password') || '';
    }
  } catch (e) { /* ignore malformed body */ }

  const expected = process.env.ACCESS_PASSWORD;
  const token = process.env.SESSION_TOKEN;

  if (expected && token && password === expected) {
    return new Response(null, {
      status: 303,
      headers: {
        'Location': origin + '/',
        'Set-Cookie': `lcm_auth=${token}; Path=/; HttpOnly; Secure; SameSite=Lax`,
        'Cache-Control': 'no-store',
      },
    });
  }

  return new Response(null, {
    status: 303,
    headers: { 'Location': origin + '/login.html?e=1', 'Cache-Control': 'no-store' },
  });
}

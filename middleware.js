// Vercel Edge Middleware — server-side gate.
// Every request (except the login page, the auth API, and login assets) must
// carry a valid session cookie whose value matches SESSION_TOKEN (a secret set
// as a Vercel Environment Variable). No valid cookie -> redirect to /login.html.
//
// The protected pages are never served without the cookie, and the cookie value
// is a server-only secret, so this is enforced on the server — not in the browser.

export const config = {
  matcher: ['/((?!api/|login\\.html|fonts/|logo\\.png|favicon\\.ico|robots\\.txt).*)'],
};

export default function middleware(request) {
  const cookie = request.headers.get('cookie') || '';
  const m = cookie.match(/(?:^|;\s*)lcm_auth=([^;]+)/);
  const token = m ? m[1] : '';
  const secret = process.env.SESSION_TOKEN;

  if (secret && token && token === secret) {
    return; // authenticated — let the request through
  }
  return Response.redirect(new URL('/login.html', request.url), 302);
}

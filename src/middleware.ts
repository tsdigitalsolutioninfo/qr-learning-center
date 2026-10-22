import { createServerClient, type SetAllCookies } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

const PUBLIC = ['/login', '/unauthorized'];

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });
  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (list: Parameters<SetAllCookies>[0]) => {
        list.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        list.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });
  const { data: { user } } = await supabase.auth.getUser(); // refreshes expired sessions
  const path = request.nextUrl.pathname;
  if (!user && path !== '/' && !PUBLIC.some((p) => path.startsWith(p))) {
    const url = request.nextUrl.clone(); url.pathname = '/login'; url.search = '';
    return NextResponse.redirect(url);
  }
  return response;
}
// Public files in /public (such as the brand logo) must bypass auth redirects.
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico|woff|woff2|ttf|otf|pdf)$).*)'],
};

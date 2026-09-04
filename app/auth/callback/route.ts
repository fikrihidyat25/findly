import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@/src/lib/supabase/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/dashboard';

  if (code) {
    try {
      const cookieStore = await cookies();
      const supabase = createClient(cookieStore);
      const { error } = await supabase.auth.exchangeCodeForSession(code);

      if (!error) {
        const forwardedHost = request.headers.get('x-forwarded-host');
        const isLocalEnv = process.env.NODE_ENV === 'development';

        if (isLocalEnv) {
          return NextResponse.redirect(`${origin}${next}`);
        } else if (forwardedHost) {
          return NextResponse.redirect(`https://${forwardedHost}${next}`);
        } else {
          return NextResponse.redirect(`${origin}${next}`);
        }
      }
      console.error('Supabase exchangeCodeForSession error:', error.message);
    } catch (err) {
      console.error('Callback error:', err);
    }
  }

  // Jika gagal tukar code atau tidak ada code, alihkan ke login dengan notifikasi
  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}

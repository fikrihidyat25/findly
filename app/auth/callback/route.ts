import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@/src/lib/supabase/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const token_hash = searchParams.get('token_hash');
  const type = searchParams.get('type');
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');
  const next = searchParams.get('next') ?? '/login?verified=true';

  // Jika provider mengembalikan error
  if (error || errorDescription) {
    const errorMsg = errorDescription || error || 'Otentikasi dibatalkan atau gagal.';
    console.error('Auth callback provider error:', errorMsg);
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(errorMsg)}`);
  }

  // Jika konfirmasi email menggunakan token_hash (OTP email confirmation)
  if (token_hash && type) {
    try {
      const cookieStore = await cookies();
      const supabase = createClient(cookieStore);
      const { error: verifyError } = await supabase.auth.verifyOtp({
        token_hash,
        type: type as any,
      });

      if (!verifyError) {
        if (next.includes('login') || type === 'signup' || type === 'email') {
          await supabase.auth.signOut();
        }
        return NextResponse.redirect(`${origin}${next}`);
      }
      console.error('Verify OTP error:', verifyError.message);
    } catch (err) {
      console.error('Verify OTP exception:', err);
    }
  }

  // Jika menggunakan kode otentikasi (PKCE flow)
  if (code) {
    try {
      const cookieStore = await cookies();
      const supabase = createClient(cookieStore);
      const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

      if (!exchangeError) {
        if (next.includes('login') || type === 'signup' || type === 'email') {
          await supabase.auth.signOut();
        }
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

      console.error('Supabase exchangeCodeForSession error:', exchangeError.message);

      const errLower = exchangeError.message.toLowerCase();
      // Jika error karena PKCE (link dibuka dari browser/tab berbeda seperti temp-mail):
      // Konfirmasi email di Supabase sebenarnya SUDAH BERHASIL di server.
      // Cukup arahkan user ke login dengan status verified=true agar user tinggal login.
      if (errLower.includes('pkce') || errLower.includes('code verifier') || errLower.includes('storage')) {
        return NextResponse.redirect(`${origin}/login?verified=true`);
      }

      return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(exchangeError.message)}`);
    } catch (err) {
      console.error('Callback error:', err);
      return NextResponse.redirect(`${origin}/login?verified=true`);
    }
  }

  // Jika tidak ada code
  return NextResponse.redirect(`${origin}/login?verified=true`);
}

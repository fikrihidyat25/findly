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
  const source = searchParams.get('source'); // 'login' | 'register'
  const next = searchParams.get('next') ?? '/dashboard';

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
        return NextResponse.redirect(`${origin}${next}`);
      }
      console.error('Verify OTP error:', verifyError.message);
    } catch (err) {
      console.error('Verify OTP exception:', err);
    }
  }

  // Jika menggunakan kode otentikasi (PKCE flow / OAuth Google)
  if (code) {
    try {
      const cookieStore = await cookies();
      const supabase = createClient(cookieStore);
      const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

      if (!exchangeError) {
        const user = data?.user;

        if (user) {
          const createdAt = new Date(user.created_at).getTime();
          const now = Date.now();
          const isBrandNewAccount = (now - createdAt) < 60000;
          const isExplicitlyRegistered = Boolean(
            user.user_metadata?.is_registered || user.user_metadata?.tipe_akun
          );

          // JIKA user melakukan login Google langsung dari halaman Login (source=login),
          // TETAPI akun ini baru terbuat (belum terdaftar) atau belum pernah melalui proses registrasi:
          // JANGAN LANGSUNG ACCEPT! Arahkan user untuk mendaftar terlebih dahulu.
          if (source === 'login' && (isBrandNewAccount || !isExplicitlyRegistered)) {
            try {
              // Hapus record profil default jika terlanjur dibuat otomatis oleh trigger
              await supabase.from('profil_pengguna').delete().eq('id', user.id);
              // Sign out agar sesi login tidak tersimpan di browser
              await supabase.auth.signOut();
            } catch (cleanupErr) {
              console.error('Gagal membersihkan user belum terdaftar:', cleanupErr);
            }

            const errorMsg = encodeURIComponent(
              'Akun Google ini belum terdaftar di Findly. Silakan lakukan pendaftaran (registrasi) akun baru terlebih dahulu.'
            );
            const userEmail = encodeURIComponent(user.email || '');
            return NextResponse.redirect(`${origin}/register?error=${errorMsg}&email=${userEmail}`);
          }

          // JIKA user mendaftar melalui tombol Google di halaman Register (source=register):
          if (source === 'register') {
            try {
              await supabase.auth.updateUser({
                data: {
                  is_registered: true,
                  registration_source: 'google',
                  tipe_akun: user.user_metadata?.tipe_akun || 'community',
                },
              });
            } catch (updateErr) {
              console.error('Gagal memperbarui metadata registrasi Google:', updateErr);
            }
          }
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

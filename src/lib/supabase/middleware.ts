import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const createClient = (request: NextRequest) => {
    let supabaseResponse = NextResponse.next({
        request: {
            headers: request.headers,
        },
    });

    const supabase = createServerClient(
        supabaseUrl!,
        supabaseKey!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
                    supabaseResponse = NextResponse.next({
                        request,
                    });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    );
                },
            },
        },
    );
    return { supabase, response: supabaseResponse };
};

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request: {
            headers: request.headers,
        },
    });

    const supabase = createServerClient(
        supabaseUrl!,
        supabaseKey!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
                    supabaseResponse = NextResponse.next({
                        request,
                    });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    );
                },
            },
        },
    );

    // IMPORTANT: Revalidate auth session via getUser (never use getSession for security)
    const {
        data: { user },
    } = await supabase.auth.getUser();

    const { pathname, search } = request.nextUrl;

    // Public routes allowed for unauthenticated guests
    const isPublicRoute =
        pathname === "/" ||
        pathname.startsWith("/find") ||
        pathname.startsWith("/cari-barang") ||
        pathname.startsWith("/safe-zones") ||
        pathname.startsWith("/bantuan") ||
        pathname.startsWith("/help") ||
        pathname.startsWith("/auth");

    const isAuthRoute =
        pathname.startsWith("/login") ||
        pathname.startsWith("/register");

    const isAdminSession = request.cookies.get('findly_admin_session')?.value === 'true';

    // 1. Guest attempting to access protected routes (dashboard, subpaths, admin, messages, etc.)
    if (!user && !isAdminSession && !isPublicRoute && !isAuthRoute) {
        const url = request.nextUrl.clone();
        url.pathname = "/login";

        const target = pathname + search;
        if (target && target !== "/") {
            url.searchParams.set("redirect", target);
        }

        const redirectResponse = NextResponse.redirect(url);
        supabaseResponse.cookies.getAll().forEach((cookie) => {
            redirectResponse.cookies.set(cookie.name, cookie.value, cookie);
        });
        return redirectResponse;
    }

    // 2. Logged-in user visiting /login or /register -> Redirect to /admin or /dashboard
    // Kecuali jika terdapat parameter notice seperti verified=true atau registered=true
    const hasAuthNotice =
        request.nextUrl.searchParams.has("verified") ||
        request.nextUrl.searchParams.has("registered");

    if ((user || isAdminSession) && isAuthRoute && !hasAuthNotice) {
        const url = request.nextUrl.clone();
        url.pathname = isAdminSession ? "/admin" : "/dashboard";
        url.search = "";
        return NextResponse.redirect(url);
    }

    return supabaseResponse;
}
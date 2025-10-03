// middleware.ts
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

async function safeJson(res: Response) {
  const ct = res.headers.get("content-type") || "";
  if (!ct.includes("application/json")) {
    const txt = await res.text();
    throw new Error(`Expected JSON, got ${res.status} ${res.statusText} (${ct}). Body: ${txt.slice(0, 200)}`);
  }
  return res.json();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const url = new URL(request.url);
  const { pathname, search } = url;
  const origin = url.origin;
  const cookie = request.headers.get("cookie") ?? "";

  const isAuthRoute = pathname === "/login" || pathname === "/sign-up";
  const { data: { user } } = await supabase.auth.getUser();

  // If already logged in, keep auth routes unreachable
  if (isAuthRoute && user) {
    return NextResponse.redirect(new URL("/notes", request.url));
  }

  const hitsNotes = pathname === "/notes" || pathname === "/";

  // 🔒 Gate: guests cannot hit / or /notes
  if (hitsNotes && !user) {
    const next = `${pathname}${search || ""}`;
    const dest = new URL("/login", request.url);
    dest.searchParams.set("next", next); // for post-login redirect
    return NextResponse.redirect(dest);
  }

  // Logged-in behavior: attach newest note (or create), then land on /notes?noteId=...
  if (user && hitsNotes) {
    const hasNoteId = url.searchParams.has("noteId");

    if (!hasNoteId) {
      // 1) Try newest
      const newestRes = await fetch(
        `${origin}/api/fetch-newest-note?userId=${user.id}`,
        { headers: { accept: "application/json", cookie } },
      );

      let newestNoteId: string | null = null;
      try {
        const newest = await safeJson(newestRes);
        newestNoteId = newest?.newestNoteId ?? null;
      } catch {}

      const target = new URL("/notes", request.url);
      if (newestNoteId) {
        target.searchParams.set("noteId", newestNoteId);
        return NextResponse.redirect(target);
      }

      // 2) Create new note
      const createRes = await fetch(
        `${origin}/api/create-new-note?userId=${user.id}`,
        {
          method: "POST",
          headers: {
            "content-type": "application/json",
            accept: "application/json",
            cookie,
          },
        },
      );

      const created = await safeJson(createRes);
      target.searchParams.set("noteId", created.noteId);
      return NextResponse.redirect(target);
    }

    // If user is at "/" (even with noteId), canonicalize to /notes
    if (pathname === "/") {
      const target = new URL("/notes" + search, request.url);
      return NextResponse.redirect(target);
    }
  }

  return supabaseResponse;
}

// import { createServerClient } from "@supabase/ssr";
// import { NextResponse, type NextRequest } from "next/server";

// export async function middleware(request: NextRequest) {
//   return await updateSession(request);
// }

// export const config = {
//   matcher: [
//     /*
//      * Match all request paths except for the ones starting with:
//      * - _next/static (static files)
//      * - _next/image (image optimization files)
//      * - favicon.ico (favicon file)
//      * Feel free to modify this pattern to include more paths.
//      */
//     "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
//   ],
// };

// export async function updateSession(request: NextRequest) {
//   let supabaseResponse = NextResponse.next({
//     request,
//   });

//   // console.log("Middleware running");
//   // console.log("NEXT URL:", process.env.NEXT_PUBLIC_BASE_URL);
//   // console.log("SUPABASE_ANON_KEY URL:", process.env.SUPABASE_ANON_KEY);
//   // console.log("SUPABASE_URL URL:", process.env.SUPABASE_URL);
//   const supabase = createServerClient(
//     process.env.SUPABASE_URL!,
//     process.env.SUPABASE_ANON_KEY!,
//     {
//       cookies: {
//         getAll() {
//           return request.cookies.getAll();
//         },
//         setAll(cookiesToSet) {
//           cookiesToSet.forEach(({ name, value }) =>
//             request.cookies.set(name, value),
//           );
//           supabaseResponse = NextResponse.next({
//             request,
//           });
//           cookiesToSet.forEach(({ name, value, options }) =>
//             supabaseResponse.cookies.set(name, value, options),
//           );
//         },
//       },
//     },
//   );

//   const isAuthRoute =
//     request.nextUrl.pathname === "/login" ||
//     request.nextUrl.pathname === "/sign-up";

//   if (isAuthRoute) {
//     const {
//       data: { user },
//     } = await supabase.auth.getUser();

//     if (user) {
//       return NextResponse.redirect(
//         new URL("/", process.env.NEXT_PUBLIC_BASE_URL),
//       );
//     }
//   }

//   // If URL has no noteId, it will go to the latest note, if they don't have any notes it will create a note
//   const { searchParams, pathname } = new URL(request.url);

//   if (!searchParams.get("noteId") && pathname === "/notes") {
//     const {
//       data: { user },
//     } = await supabase.auth.getUser();
//     if (user) {
//       const { newestNoteId } = await fetch(
//         `${process.env.NEXT_PUBLIC_BASE_URL}/api/fetch-newest-note?userId=${user.id}`,
//       ).then((res) => res.json()); // prisma doesn't work directly in middleware so we create and call an API endpoint
//       if (newestNoteId) {
//         const url = request.nextUrl.clone();
//         url.searchParams.set("noteId", newestNoteId);
//         return NextResponse.redirect(url);
//       } else {
//         const { noteId } = await fetch(
//           `${process.env.NEXT_PUBLIC_BASE_URL}/api/create-new-note?userId=${user.id}`,
//           {
//             method: "POST",
//             headers: {
//               "Content-Type": "application/json",
//             },
//           },
//         ).then((res) => res.json());
//         const url = request.nextUrl.clone();
//         url.searchParams.set("noteId", noteId);
//         return NextResponse.redirect(url);
//       }
//     }
//   }

//   return supabaseResponse;
// }

import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Add this tiny helper
async function safeJson(res: Response) {
  const ct = res.headers.get("content-type") || "";
  if (!ct.includes("application/json")) {
    const txt = await res.text();
    // This throws with a helpful message if the API ever returns HTML/redirect/etc.
    throw new Error(
      `Expected JSON, got ${res.status} ${res.statusText} (${ct}). ` +
      `Body: ${txt.slice(0, 200)}`
    );
  }
  return res.json();
}

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

export async function updateSession(request: NextRequest) {
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

  const isAuthRoute =
    request.nextUrl.pathname === "/login" ||
    request.nextUrl.pathname === "/sign-up";

  if (isAuthRoute) {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      // Use the real request URL as base, not an env var
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  const { searchParams, pathname } = new URL(request.url);

  if (!searchParams.get("noteId") && pathname === "/notes") {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      // 👇 Build a guaranteed-correct absolute URL + forward cookies
      const origin = request.nextUrl.origin;
      const cookie = request.headers.get("cookie") ?? "";
      console.log("Middleware /notes detected, user:", user.id);

      // 1) Try newest note
      const newestRes = await fetch(
        `${origin}/api/fetch-newest-note?userId=${user.id}`,
        { method: "GET", headers: { accept: "application/json", cookie } },
      );

      let newestNoteId: string | null = null;
      try {
        const newest = await safeJson(newestRes);
        newestNoteId = newest?.newestNoteId ?? null;
      } catch (e) {
        // swallow to fall through to create; logs help if needed
        // console.error("fetch-newest-note returned non-JSON:", e);
      }

      if (newestNoteId) {
        const url = request.nextUrl.clone();
        url.searchParams.set("noteId", newestNoteId);
        return NextResponse.redirect(url);
      }

      // 2) Create note
      const createRes = await fetch(
        `${origin}/api/create-new-note?userId=${user.id}`,
        {
          method: "POST",
          headers: {
            "content-type": "application/json",
            accept: "application/json",
            cookie, // 👈 forward cookies here too
          },
        },
      );

      const created = await safeJson(createRes); // throws if not JSON
      const url = request.nextUrl.clone();
      url.searchParams.set("noteId", created.noteId);
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}

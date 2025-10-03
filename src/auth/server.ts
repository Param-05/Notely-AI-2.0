import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  const client = createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
  return client
}

export async function getUser() {
    const {auth} = await createClient()
    const userObject = await auth.getUser()

    if (userObject.error) {
        console.error(userObject.error)
        return null
    }
    return userObject.data.user
}

// // src/auth/server.ts
// import { createServerClient } from '@supabase/ssr'
// import { cookies } from 'next/headers'

/**
 * Server-side Supabase client with cookie adapters.
 * Works in Server Components, Server Actions, and Route Handlers.
 */
// export function createClient() {
//   // NOTE: cookies() is synchronous — do NOT await it.
//   const cookieStore = cookies()

//   return createServerClient(
//     // Use whatever env names you’ve actually set.
//     // If you prefer NEXT_PUBLIC_* for a single source of truth, change both lines accordingly.
//     process.env.SUPABASE_URL!,       // or process.env.NEXT_PUBLIC_SUPABASE_URL!
//     process.env.SUPABASE_ANON_KEY!,  // or process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
//     {
//       cookies: {
//         get(name: string) {
//           return cookieStore.get(name)?.value
//         },
//         set(name: string, value: string, options: any) {
//           cookieStore.set(name, value, options)
//         },
//         remove(name: string, options: any) {
//           cookieStore.set(name, '', { ...options, maxAge: 0 })
//         },
//       },
//     }
//   )
// }

// /**
//  * Optional user helper — use on public pages (login/sign-up)
//  * Returns `null` when no session (no error spam).
//  */
// export async function getOptionalUser() {
//   const supabase = createClient()
//   const { data: { session } } = await supabase.auth.getSession()
//   return session?.user ?? null
// }

// /**
//  * Required user helper — use on protected pages.
//  * If you call this on a page and it returns null, redirect in the caller.
//  */
// export async function getRequiredUser() {
//   const supabase = createClient()
//   const { data: { user } } = await supabase.auth.getUser()
//   return user
// }

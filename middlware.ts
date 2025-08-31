// middleware.ts (alternative approach)
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isDashboard = createRouteMatcher(['/dashboard(.*)'])
const ADMIN_EMAILS = new Set(['dfsturge@gmail.com'])

export default clerkMiddleware(async (auth, req) => {
  if (isDashboard(req)) {
    // This will automatically redirect to sign-in if not authenticated
    const { sessionClaims } = await auth.protect()

    const role = (sessionClaims?.publicMetadata as any)?.role
    const email =
      (sessionClaims as any)?.email ??
      (sessionClaims as any)?.email_address ??
      (sessionClaims as any)?.email_addresses?.[0]
    const isAdmin = role === 'admin' || (email && ADMIN_EMAILS.has(email))

    if (!isAdmin) return Response.redirect(new URL('/', req.url))
  }
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}
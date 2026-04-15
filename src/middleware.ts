import { auth } from "~/server/auth"
import { NextResponse } from "next/server"

// Routes that require authentication
const protectedRoutes = [
  "/dashboard",
  "/profile",
  "/settings",
  "/analysis",
  "/rooms",
  "/matches",
]

// Routes that should redirect to dashboard if already authenticated
const authRoutes = ["/login", "/register", "/forgot-password"]

export default auth((req) => {
  const { nextUrl } = req
  const isLoggedIn = !!req.auth

  const isProtectedRoute = protectedRoutes.some((route) =>
    nextUrl.pathname.startsWith(route)
  )
  const isAuthRoute = authRoutes.some((route) =>
    nextUrl.pathname.startsWith(route)
  )

  // Redirect to login if accessing protected route while not logged in
  if (isProtectedRoute && !isLoggedIn) {
    const loginUrl = new URL("/login", nextUrl.origin)
    loginUrl.searchParams.set("callbackUrl", nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Redirect to dashboard if accessing auth routes while logged in
  if (isAuthRoute && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", nextUrl.origin))
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api routes (api/*)
     * - static files (_next/static/*, _next/image/*, favicon.ico, etc.)
     * - public assets (images, etc.)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|icons).*)",
  ],
}

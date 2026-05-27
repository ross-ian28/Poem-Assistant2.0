import { auth } from "@/auth"

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const isOnDashboard = req.nextUrl.pathname.startsWith("/dashboard")

  if (isOnDashboard && !isLoggedIn) {
    return Response.redirect(new URL("/", req.url))
  }
})

export const config = {
  matcher: ["/dashboard/:path*"],
}
import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import { NextResponse } from "next/server";

// Define protected routes and roles (Case insensitive matching)
const rolePermissions: Record<string, string[]> = {
    "/admin": ["ceo", "admin"],
    "/hr": ["ceo", "hr manager", "cfo", "admin"],
    "/finance": ["ceo", "cfo", "admin"],
    "/crm": ["ceo", "sales manager", "salesperson", "cmo", "admin"],
    "/projects": ["ceo", "project manager", "pm", "ops", "operations manager", "admin"],
    "/operations": ["ceo", "ops", "operations manager", "admin"],
    "/academy": ["ceo", "academy head", "program director", "academy ops manager", "admin"],
};

const { auth } = NextAuth(authConfig);

export default auth((req: any) => {
    const isLoggedIn = !!req.auth
    const { nextUrl } = req
    const userRole = (req.auth?.user?.role as string | undefined)?.toLowerCase();

    // Redirect to login if accessing protected paths while not logged in
    const protectedPaths = ["/dashboard", "/crm", "/hr", "/finance", "/projects", "/admin", "/operations", "/academy", "/kpi", "/my-tasks"];
    const isProtected = protectedPaths.some(path => nextUrl.pathname.startsWith(path));

    if (isProtected) {
        if (!isLoggedIn) {
            return NextResponse.redirect(new URL("/login", nextUrl))
        }
    }

    // RBAC Checks
    const path = nextUrl.pathname;
    let requiredRoles: string[] = [];

    // Find the most specific matching prefix
    // Sorted by length to match longest specific path first if needed, but here they are distinct top-level mostly.
    for (const [prefix, roles] of Object.entries(rolePermissions)) {
        if (path.startsWith(prefix)) {
            requiredRoles = roles;
            break;
        }
    }

    if (requiredRoles.length > 0) {
        // userRole is already lowercased. distinct roles should be lowercased in config or here.
        // We defined config as lowercase above.
        if (!userRole || !requiredRoles.includes(userRole)) {
            // Unauthorized
            console.log(`[Middleware] Unauthorized Access: ${userRole} tried to access ${path}`);
            return NextResponse.rewrite(new URL("/403", nextUrl))
        }
    }

    return NextResponse.next();
})

export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder
         * - /courses (Public Academy Pages)
         * - /view (Public View Pages)
         */
        "/((?!api|_next/static|_next/image|favicon.ico|courses|view|.*\\..*|login|register).*)",
    ],
}

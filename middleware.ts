import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import { NextResponse } from "next/server";

// Define protected routes and roles
const rolePermissions: Record<string, string[]> = {
    "/admin": ["CEO", "Admin", "admin"],
    "/hr": ["CEO", "HR Manager", "CFO", "Admin", "admin"], // Example: CFO might need access to payroll in HR
    "/finance": ["CEO", "CFO", "Admin", "admin"],
    "/crm": ["CEO", "Sales Manager", "Salesperson", "Admin", "admin"],
    "/projects": ["CEO", "Project Manager", "Ops", "Admin", "admin"],
};

const { auth } = NextAuth(authConfig);

export default auth((req: any) => {
    const isLoggedIn = !!req.auth
    const { nextUrl } = req
    const userRole = req.auth?.user?.role as string | undefined

    // Redirect to login if accessing dashboard paths while not logged in
    if (nextUrl.pathname.startsWith("/dashboard") || nextUrl.pathname.startsWith("/crm") || nextUrl.pathname.startsWith("/hr") || nextUrl.pathname.startsWith("/finance") || nextUrl.pathname.startsWith("/projects") || nextUrl.pathname.startsWith("/admin")) {
        if (!isLoggedIn) {
            return NextResponse.redirect(new URL("/login", nextUrl))
        }
    }

    // RBAC Checks
    // Check if the current path requires specific roles
    const path = nextUrl.pathname;
    let requiredRoles: string[] = [];

    // Simple prefix check (can be improved with regex or pattern matching)
    for (const [prefix, roles] of Object.entries(rolePermissions)) {
        if (path.startsWith(prefix)) {
            requiredRoles = roles;
            break;
        }
    }

    if (requiredRoles.length > 0) {
        if (!userRole || !requiredRoles.includes(userRole)) {
            // Unauthorized
            return NextResponse.rewrite(new URL("/403", nextUrl)) // Or redirect to dashboard
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
         */
        "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|login|register).*)",
    ],
}

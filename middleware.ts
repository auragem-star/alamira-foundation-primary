import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const COOKIE_NAME = "amira_session";

function getSecret() {
  return new TextEncoder().encode(process.env.AUTH_SECRET ?? "");
}

const roleForPath: { prefix: string; role: string; loginPath: string }[] = [
  { prefix: "/student/dashboard", role: "STUDENT", loginPath: "/student/login" },
  { prefix: "/student/homework", role: "STUDENT", loginPath: "/student/login" },
  { prefix: "/parent/dashboard", role: "PARENT", loginPath: "/parent/login" },
  { prefix: "/teacher/dashboard", role: "TEACHER", loginPath: "/teacher/login" },
  { prefix: "/teacher/homework", role: "TEACHER", loginPath: "/teacher/login" },
  { prefix: "/admin/dashboard", role: "ADMIN", loginPath: "/admin/login" },
];

export async function middleware(req: NextRequest) {
  const match = roleForPath.find((r) => req.nextUrl.pathname.startsWith(r.prefix));
  if (!match) return NextResponse.next();

  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) {
    return NextResponse.redirect(new URL(match.loginPath, req.url));
  }

  try {
    const { payload } = await jwtVerify(token, getSecret());
    if (payload.role !== match.role) {
      return NextResponse.redirect(new URL(match.loginPath, req.url));
    }
  } catch {
    return NextResponse.redirect(new URL(match.loginPath, req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/student/dashboard/:path*",
    "/student/homework/:path*",
    "/parent/dashboard/:path*",
    "/teacher/dashboard/:path*",
    "/teacher/homework/:path*",
    "/admin/dashboard/:path*",
  ],
};

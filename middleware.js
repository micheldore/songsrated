import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

export async function middleware(request) {
    const token = await getToken({
        req: request,
        secret: process.env.JWT_SECRET,
    });

    const { pathname, origin } = request.nextUrl;

    if (pathname.includes(`/api/auth`) || token) {
        return NextResponse.next();
    } else if (pathname == "/") {
        return NextResponse.rewrite(new URL("/login", request.url));
    }
}

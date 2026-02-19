import { type NextRequest, NextResponse } from "next/server";

// Auth protection is handled client-side in dashboard/layout.tsx
export function middleware(request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};

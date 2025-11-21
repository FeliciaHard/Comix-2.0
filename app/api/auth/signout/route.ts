import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ message: "Signed Out" });

  // Clear the token cookie
  response.cookies.set({
    name: "token",
    value: "",
    httpOnly: true,
    // secure: process.env.NODE_ENV === "production",
    secure: false,
    path: "/",
    maxAge: 0,
    sameSite: "lax",
  });

  return response;
}

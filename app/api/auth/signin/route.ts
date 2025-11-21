import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import crypto from "crypto";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

function doubleMd5(input: string) {
  let hash = crypto.createHash("md5").update(input).digest("hex");
  hash = crypto.createHash("md5").update(hash).digest("hex");
  return hash;
}

export async function POST(request: Request) {
  try {
    console.log("📩 Received signin POST request");

    const { name, password } = await request.json();
    console.log("🔍 Parsed body:", { name, password: password ? "******" : null });

    if (!name || !password) {
      console.log("⚠️ Missing username or password");
      return NextResponse.json({ error: "Missing username or password" }, { status: 400 });
    }

    const hashedPassword = doubleMd5(password);
    console.log("🔐 Double hashed password:", hashedPassword);

    const user = await prisma.tbl_user.findFirst({
      where: { name },
    });

    console.log("👤 User found:", user ? { id: user.id, name: user.name } : null);

    if (!user) {
      console.log("❌ No user found with this username");
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    if (user.pass_inc !== hashedPassword) {
      console.log("❌ Password mismatch");
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    console.log("✅ User authenticated successfully");

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error("❗ JWT_SECRET not set in environment");
    } else {
      // console.log("JWT_SECRET:", process.env.JWT_SECRET);
    }

    const token = jwt.sign(
      {
        userId: user.id,
        name: user.name,
      },
      secret,
      { expiresIn: "1h" }
    );

    console.log("🎫 JWT token created:", token);

    // Create response and set cookie
    const response = NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        profile: user.profile,
      },
    });

    response.cookies.set({
      name: "token",
      value: token,
      httpOnly: true,
      // secure: process.env.NODE_ENV === "production",
      secure: false,
      path: "/",
      maxAge: 60 * 60, // 1 hour in seconds
      sameSite: "lax",
    });

    return response;
  } catch (error) {
    console.error("💥 Error in signin API:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

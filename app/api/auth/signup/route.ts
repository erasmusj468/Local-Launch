import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export const runtime = "nodejs"

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 })
    }

    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      return NextResponse.json({ error: "User already exists." }, { status: 400 })
    }

    const passwordHash = await bcrypt.hash(password, 10)
    const isOwner = email === process.env.OWNER_EMAIL

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        role: isOwner ? "OWNER" : "CUSTOMER",
      },
    })

    return NextResponse.json({ message: "Account created successfully!", userId: user.id })
  } catch (err) {
    return NextResponse.json({ error: "Failed to create account." }, { status: 500 })
  }
}

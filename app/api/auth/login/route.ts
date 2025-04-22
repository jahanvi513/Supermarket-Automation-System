import { NextResponse } from "next/server"

// Mock user database
const users = [
  { id: 1, username: "employee1", password: "password123", role: "employee" },
  { id: 2, username: "manager1", password: "password123", role: "manager" },
]

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { username, password, role } = body

    // Find user in mock database
    const user = users.find((u) => u.username === username && u.password === password && u.role === role)

    if (user) {
      // In a real application, you would generate a JWT token here
      return NextResponse.json({
        success: true,
        token: "mock-jwt-token",
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
        },
      })
    } else {
      return NextResponse.json({ success: false, message: "Invalid credentials" }, { status: 401 })
    }
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}

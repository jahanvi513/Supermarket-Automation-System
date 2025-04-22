import { NextResponse } from "next/server"

// Mock customer database
const customers = [
  { id: 1, name: "John Doe", email: "john@example.com", phone: "123-456-7890", credits: 50 },
  { id: 2, name: "Jane Smith", email: "jane@example.com", phone: "987-654-3210", credits: 25 },
  { id: 3, name: "Bob Johnson", email: "bob@example.com", phone: "555-123-4567", credits: 75 },
]

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const id = Number.parseInt(params.id)
  const customer = customers.find((c) => c.id === id)

  if (!customer) {
    return NextResponse.json({ success: false, message: "Customer not found" }, { status: 404 })
  }

  return NextResponse.json(customer)
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number.parseInt(params.id)
    const updatedCustomer = await request.json()

    // In a real application, you would update the database here
    // For now, we'll just return the updated customer
    return NextResponse.json({ ...updatedCustomer, id })
  } catch (error) {
    console.error("Error updating customer:", error)
    return NextResponse.json({ success: false, message: "Failed to update customer" }, { status: 500 })
  }
}

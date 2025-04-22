import { NextResponse } from "next/server"

// Mock invoices
const invoices = [
  {
    id: 1,
    date: "2023-01-15T10:30:00Z",
    customerId: 1,
    customerName: "John Doe",
    items: [
      { productId: 1, name: "Milk", quantity: 2, price: 3.99 },
      { productId: 2, name: "Bread", quantity: 1, price: 2.49 },
    ],
    subtotal: 10.47,
    tax: 0.52,
    total: 10.99,
  },
  {
    id: 2,
    date: "2023-01-16T14:45:00Z",
    customerId: 2,
    customerName: "Jane Smith",
    items: [
      { productId: 3, name: "Eggs", quantity: 1, price: 4.99 },
      { productId: 4, name: "Apples", quantity: 3, price: 1.99 },
    ],
    subtotal: 10.96,
    tax: 0.55,
    total: 11.51,
  },
]

export async function GET() {
  // Simulate a slight delay to mimic a real API call
  await new Promise((resolve) => setTimeout(resolve, 500))

  return NextResponse.json(invoices)
}

export async function POST(request: Request) {
  try {
    const invoice = await request.json()

    // In a real application, you would save to a database here
    // For now, we'll just return the invoice with a new ID
    const newInvoice = {
      ...invoice,
      id: invoices.length + 1,
      date: new Date().toISOString(),
    }

    return NextResponse.json(newInvoice)
  } catch (error) {
    console.error("Error creating invoice:", error)
    return NextResponse.json({ success: false, message: "Failed to create invoice" }, { status: 500 })
  }
}

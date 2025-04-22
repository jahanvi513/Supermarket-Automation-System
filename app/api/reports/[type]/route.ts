import { NextResponse } from "next/server"

// Mock sales data for reports
const sales = [
  {
    id: 1,
    date: "2023-01-15T10:30:00Z",
    customerId: 1,
    items: [
      { productId: 1, quantity: 2, price: 3.99 },
      { productId: 2, quantity: 1, price: 2.49 },
    ],
    total: 10.47,
  },
  {
    id: 2,
    date: "2023-01-16T14:45:00Z",
    customerId: 2,
    items: [
      { productId: 3, quantity: 1, price: 4.99 },
      { productId: 4, quantity: 3, price: 1.99 },
    ],
    total: 10.96,
  },
  {
    id: 3,
    date: "2023-01-17T09:15:00Z",
    customerId: 3,
    items: [
      { productId: 5, quantity: 1, price: 8.99 },
      { productId: 1, quantity: 1, price: 3.99 },
    ],
    total: 12.98,
  },
  {
    id: 4,
    date: "2023-01-18T16:20:00Z",
    customerId: 1,
    items: [
      { productId: 2, quantity: 2, price: 2.49 },
      { productId: 4, quantity: 2, price: 1.99 },
    ],
    total: 8.96,
  },
  {
    id: 5,
    date: "2023-01-19T11:10:00Z",
    customerId: 2,
    items: [
      { productId: 3, quantity: 2, price: 4.99 },
      { productId: 5, quantity: 1, price: 8.99 },
    ],
    total: 18.97,
  },
]

export async function GET(request: Request, { params }: { params: { type: string } }) {
  const { type } = params
  const { searchParams } = new URL(request.url)
  const startDate = searchParams.get("startDate") || "2023-01-01"
  const endDate = searchParams.get("endDate") || "2023-12-31"

  // Simulate a slight delay to mimic a real API call
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // Filter sales by date range
  const filteredSales = sales.filter((sale) => {
    const saleDate = new Date(sale.date)
    return saleDate >= new Date(startDate) && saleDate <= new Date(endDate)
  })

  // Generate different types of reports
  switch (type) {
    case "sales":
      return NextResponse.json({
        type: "Sales Report",
        dateRange: { startDate, endDate },
        totalSales: filteredSales.length,
        totalRevenue: filteredSales.reduce((sum, sale) => sum + sale.total, 0),
        sales: filteredSales,
      })

    case "inventory":
      // Mock inventory report
      return NextResponse.json({
        type: "Inventory Report",
        dateRange: { startDate, endDate },
        items: [
          { productId: 1, name: "Milk", initialStock: 120, currentStock: 100, sold: 20 },
          { productId: 2, name: "Bread", initialStock: 80, currentStock: 50, sold: 30 },
          { productId: 3, name: "Eggs", initialStock: 100, currentStock: 75, sold: 25 },
          { productId: 4, name: "Apples", initialStock: 250, currentStock: 200, sold: 50 },
          { productId: 5, name: "Chicken", initialStock: 60, currentStock: 30, sold: 30 },
        ],
      })

    case "customers":
      // Mock customer report
      return NextResponse.json({
        type: "Customer Report",
        dateRange: { startDate, endDate },
        customers: [
          { id: 1, name: "John Doe", visits: 2, totalSpent: 19.43 },
          { id: 2, name: "Jane Smith", visits: 2, totalSpent: 29.93 },
          { id: 3, name: "Bob Johnson", visits: 1, totalSpent: 12.98 },
        ],
      })

    default:
      return NextResponse.json({ success: false, message: "Invalid report type" }, { status: 400 })
  }
}

"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"
import { getProducts, getInventory, getSales } from "@/lib/api"

export default function ManagerDashboard() {
  const [dashboardData, setDashboardData] = useState({
    totalProducts: 0,
    lowStockItems: 0,
    totalSales: 0,
    recentSales: [],
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    setIsLoading(true)
    try {
      // Fetch products
      const products = await getProducts()

      // Fetch inventory
      const inventory = await getInventory()

      // Count low stock items
      const lowStockItems = inventory.filter((item: any) => item.currentQuantity < item.minimumThreshold).length

      // Fetch recent sales
      const today = new Date()
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(today.getDate() - 30)

      const sales = await getSales(thirtyDaysAgo.toISOString().split("T")[0], today.toISOString().split("T")[0])

      // Calculate total sales amount
      const totalSales = sales.reduce((sum: number, sale: any) => sum + sale.total, 0)

      setDashboardData({
        totalProducts: products.length,
        lowStockItems,
        totalSales,
        recentSales: sales.slice(0, 5), // Get 5 most recent sales
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch dashboard data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return <div className="text-center py-8">Loading dashboard data...</div>
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{dashboardData.totalProducts}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Low Stock Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{dashboardData.lowStockItems}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Sales (30 days)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">${dashboardData.totalSales.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Sales</CardTitle>
          </CardHeader>
          <CardContent>
            {dashboardData.recentSales.length > 0 ? (
              <div className="space-y-4">
                {dashboardData.recentSales.map((sale: any) => (
                  <div key={sale.id} className="flex justify-between items-center border-b pb-2">
                    <div>
                      <div className="font-medium">Order #{sale.id}</div>
                      <div className="text-sm text-gray-500">{new Date(sale.date).toLocaleDateString()}</div>
                    </div>
                    <div className="font-medium">${sale.total.toFixed(2)}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500">No recent sales data available.</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4">
              <Button
                variant="outline"
                className="justify-start"
                onClick={() => (window.location.href = "/manager/inventory")}
              >
                Manage Inventory
              </Button>
              <Button
                variant="outline"
                className="justify-start"
                onClick={() => (window.location.href = "/manager/products")}
              >
                Update Products
              </Button>
              <Button
                variant="outline"
                className="justify-start"
                onClick={() => (window.location.href = "/manager/reports")}
              >
                Generate Reports
              </Button>
              <Button
                variant="outline"
                className="justify-start"
                onClick={() => (window.location.href = "/manager/promotions")}
              >
                Manage Promotions
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

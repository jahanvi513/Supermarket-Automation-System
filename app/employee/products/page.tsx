"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"
import { getProducts } from "@/lib/api"
import { getStoreLayout } from "@/lib/api"

export default function EmployeeProducts() {
  const [products, setProducts] = useState<any[]>([])
  const [filteredProducts, setFilteredProducts] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [storeLayout, setStoreLayout] = useState<any>(null)

  useEffect(() => {
    fetchProducts()
  }, [])

  useEffect(() => {
    const fetchLayout = async () => {
      try {
        const layout = await getStoreLayout()
        setStoreLayout(layout)
      } catch (err) {
        console.error("Error fetching store layout", err)
      }
    }
  
    fetchLayout()
  }, [])

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredProducts(products)
    } else {
      const lowercaseSearch = searchTerm.toLowerCase()
      const filtered = products.filter(
        (product) =>
          product.id.toString().includes(lowercaseSearch) ||
          product.name.toLowerCase().includes(lowercaseSearch) ||
          product.category.toLowerCase().includes(lowercaseSearch),
      )
      setFilteredProducts(filtered)
    }
  }, [searchTerm, products])

  const fetchProducts = async () => {
    setIsLoading(true)
    try {
      const data = await getProducts()
      setProducts(data)
      setFilteredProducts(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch products. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getAisleInfo = (productId: string) => {
    if (!storeLayout) return "N/A"
  
    for (const section of storeLayout.sections) {
      const match = section.products?.find((p: any) => p.id === productId)
      if (match) {
        return `Aisle ${match.aisle} (${section.name})`
      }
    }
    return "N/A"
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Products</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <Input
            placeholder="Search by ID, name, or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />
        </div>

        {isLoading ? (
          <div className="text-center py-8">Loading products...</div>
        ) : filteredProducts.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Location</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>{product.id}</TableCell>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>{product.category}</TableCell>
                  <TableCell>${product.price.toFixed(2)}</TableCell>
                 <TableCell>{product.stockQuantity ?? "N/A"}</TableCell>
                <TableCell>
                    {product.stockQuantity > 0 ? (
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        In Stock
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                        Out of Stock
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                  {/* Dummy location based on product ID or name */}
                  {(() => {
                    switch (product.name.toLowerCase()) {
                      case "milk":
                        return "Aisle 1 - Dairy Section"
                      case "bread":
                        return "Aisle 2 - Bakery"
                      case "eggs":
                        return "Aisle 3 - Produce"
                      case "apples":
                        return "Aisle 3 - Produce"
                      case "chicken":
                        return "Aisle 4 - Meat"
                      default:
                        return "N/A"
                    }
                  })()}
                </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-8 text-gray-500">No products found matching your search.</div>
        )}
      </CardContent>
    </Card>
  )
}

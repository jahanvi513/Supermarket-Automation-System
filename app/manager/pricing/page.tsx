"use client"

import { useEffect, useState } from "react"
import ManagerLayout from "@/components/layouts/manager-layout"
import {
  Card, CardContent, CardHeader, CardTitle
} from "@/components/ui/card"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"

interface Product {
  id: string
  name: string
  category: string
  price: number
}

const mockProducts: Product[] = [
  { id: "P001", name: "Milk", category: "Dairy", price: 30.0 },
  { id: "P002", name: "Chicken", category: "Meat", price: 120.0 },
  { id: "P003", name: "Bread", category: "Bakery", price: 25.0 },
]

export default function ManagerPricing() {
  const [products, setProducts] = useState<Product[]>([])
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [newPrice, setNewPrice] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  useEffect(() => {
    // Replace with real API call like: getProducts()
    setProducts(mockProducts)
  }, [])

  const openPriceDialog = (product: Product) => {
    setSelectedProduct(product)
    setNewPrice(product.price.toString())
    setIsDialogOpen(true)
  }

  const handlePriceUpdate = () => {
    if (!selectedProduct || isNaN(Number(newPrice))) {
      toast({ title: "Error", description: "Invalid price entered.", variant: "destructive" })
      return
    }

    const updatedProducts = products.map((p) =>
      p.id === selectedProduct.id ? { ...p, price: parseFloat(newPrice) } : p
    )

    setProducts(updatedProducts)
    toast({ title: "Success", description: "Price updated successfully." })
    setIsDialogOpen(false)
  }

  return (
    <ManagerLayout>
      <div className="container py-6">
        <Card>
          <CardHeader>
            <CardTitle>Pricing Management</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>{product.id}</TableCell>
                    <TableCell>{product.name}</TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell>${product.price.toFixed(2)}</TableCell>
                    <TableCell>
                      <Button size="sm" onClick={() => openPriceDialog(product)}>Update</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogContent className="sm:max-w-[400px]">
                <DialogHeader>
                  <DialogTitle>Update Price</DialogTitle>
                </DialogHeader>
                {selectedProduct && (
                  <div className="space-y-4 py-2">
                    <div>
                      <Label>Product</Label>
                      <p className="font-medium">{selectedProduct.name} ({selectedProduct.id})</p>
                    </div>
                    <div>
                      <Label htmlFor="new-price">New Price</Label>
                      <Input
                        id="new-price"
                        type="number"
                        value={newPrice}
                        onChange={(e) => setNewPrice(e.target.value)}
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>
                )}
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handlePriceUpdate}>Update Price</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      </div>
    </ManagerLayout>
  )
}

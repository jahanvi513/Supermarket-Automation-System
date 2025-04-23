"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { getProducts, createProduct, updateProduct, deleteProduct } from "@/lib/api"

export default function ManagerProducts() {
  const { toast } = useToast()
  const [products, setProducts] = useState<any[]>([])
  const [filteredProducts, setFilteredProducts] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    category: "",
    price: "",
    description: "",
    discount: "0",
  })

  useEffect(() => {
    fetchProducts()
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const resetForm = () => {
    setFormData({
      id: "",
      name: "",
      category: "",
      price: "",
      description: "",
      discount: "0",
    })
    setIsEditMode(false)
  }

  const handleAddNew = () => {
    resetForm()
    setIsDialogOpen(true)
  }

  const handleEdit = (product: any) => {
    setFormData({
      id: product.id,
      name: product.name,
      category: product.category,
      price: product.price.toString(),
      description: product.description || "",
      discount: product.discount ? product.discount.toString() : "0",
    })
    setIsEditMode(true)
    setIsDialogOpen(true)
  }

  const handleDelete = async (productId: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return

    try {
      await deleteProduct(productId)
      const updatedProducts = products.filter((p) => p.id !== productId)
      setProducts(updatedProducts)
      setFilteredProducts(updatedProducts)
      toast({ title: "Success", description: "Product deleted successfully." })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete product. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleSubmit = async () => {
    if (!formData.name || !formData.category || !formData.price) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    setIsProcessing(true)
    try {
      const productData = {
        ...formData,
        price: Number.parseFloat(formData.price),
        discount: Number.parseFloat(formData.discount || "0"),
      }

      let result
      if (isEditMode) {
        result = await updateProduct(formData.id, productData)
        const updatedProducts = products.map((p) => (p.id === result.id ? result : p))
        setProducts(updatedProducts)
        setFilteredProducts(updatedProducts)
        toast({ title: "Success", description: "Product updated successfully." })
      } else {
        result = await createProduct(productData)

        try {
          await fetch("/api/inventory", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ productId: result.id, quantity: 0 }),
          })
        } catch (invErr) {
          console.warn("Inventory sync failed:", invErr)
        }

        setProducts([...products, result])
        setFilteredProducts([...filteredProducts, result])
        toast({ title: "Success", description: "Product created successfully." })
      }

      setIsDialogOpen(false)
      resetForm()
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${isEditMode ? "update" : "create"} product. Please try again.`,
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Product Management</CardTitle>
          <Button onClick={handleAddNew}>Add New Product</Button>
        </div>
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
                <TableHead>Discount</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>{product.id}</TableCell>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>{product.category}</TableCell>
                  <TableCell>${product.price.toFixed(2)}</TableCell>
                  <TableCell>{product.discount ? `${product.discount}%` : "-"}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(product)} // ✅ confirmed corrected
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-500 hover:text-red-700"
                        onClick={() => handleDelete(product.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-8 text-gray-500">No products found matching your search.</div>
        )}

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{isEditMode ? "Edit Product" : "Add New Product"}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">Name*</Label>
                <Input id="name" name="name" value={formData.name} onChange={handleInputChange} className="col-span-3" required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="category" className="text-right">Category*</Label>
                <Input id="category" name="category" value={formData.category} onChange={handleInputChange} className="col-span-3" required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="price" className="text-right">Price*</Label>
                <Input id="price" name="price" type="number" step="0.01" min="0" value={formData.price} onChange={handleInputChange} className="col-span-3" required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="discount" className="text-right">Discount %</Label>
                <Input id="discount" name="discount" type="number" min="0" max="100" value={formData.discount} onChange={handleInputChange} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">Description</Label>
                <Input id="description" name="description" value={formData.description} onChange={handleInputChange} className="col-span-3" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setIsDialogOpen(false); resetForm() }}>Cancel</Button>
              <Button onClick={handleSubmit} disabled={isProcessing}>
                {isProcessing ? "Processing..." : isEditMode ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}


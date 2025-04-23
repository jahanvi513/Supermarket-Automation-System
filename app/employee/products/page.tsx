"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { getProducts, createProduct, updateProduct, deleteProduct } from "@/lib/api"

export default function ManagerProducts() {
  const { toast } = useToast()
  const [products, setProducts] = useState<any[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [formData, setFormData] = useState<any>({
    id: "",
    name: "",
    category: "",
    price: "",
    unitAvailable: "",
    location: "",
    floatDiscount: "",
    minThreshold: "",
    maxCapacity: "",
  })

  const fetchData = async () => {
    const data = await getProducts()
    setProducts(data)
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleEdit = (product: any) => {
    setIsEditMode(true)
    setFormData(product)
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteProduct(id)
      setProducts((prev) => prev.filter((p) => p.id !== id))  // instant UI update
      toast({ title: "✅ Product deleted successfully" })
    } catch (error) {
      console.error("❌ Error deleting product:", error)
      toast({
        title: "Error deleting product",
        description: String(error),
        variant: "destructive",
      })
    }
  }

  const handleSubmit = async () => {
    try {
      if (isEditMode) {
        await updateProduct(formData.id, formData)
        toast({ title: "✅ Product updated" })
      } else {
        await createProduct(formData)
        toast({ title: "✅ Product created" })
      }
      fetchData()
      setIsDialogOpen(false)
    } catch (error) {
      console.error("❌ Error submitting product:", error)
      toast({
        title: "Error submitting product",
        description: String(error),
        variant: "destructive",
      })
    }
  }

  return (
    <Card>
      <CardHeader className="flex justify-between items-center">
        <CardTitle>Product Management</CardTitle>
        <Button
          onClick={() => {
            setIsEditMode(false)
            setFormData({
              id: "",
              name: "",
              category: "",
              price: "",
              unitAvailable: "",
              location: "",
              floatDiscount: "",
              minThreshold: "",
              maxCapacity: "",
            })
            setIsDialogOpen(true)
          }}
        >
          Add Product
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell>{product.id}</TableCell>
                <TableCell>{product.name}</TableCell>
                <TableCell>{product.category}</TableCell>
                <TableCell>${product.price}</TableCell>
                <TableCell>{product.unitAvailable}</TableCell>
                <TableCell>{product.location}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(product)}>
                      Edit
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(product.id)}>
                      Delete
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{isEditMode ? "Edit Product" : "Add Product"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {["name", "category", "price", "unitAvailable", "location", "floatDiscount", "minThreshold", "maxCapacity"].map((field) => (
              <div key={field}>
                <Label htmlFor={field}>{field}</Label>
                <Input id={field} name={field} value={formData[field]} onChange={handleChange} />
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button onClick={handleSubmit}>{isEditMode ? "Update" : "Create"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}


"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "@/components/ui/use-toast"
import { getProductById, createInvoice, getCustomerById } from "@/lib/api"
import EmployeeLayout from "@/components/layouts/employee-layout"

interface Product {
  id: string
  name: string
  price: number
  category: string
}

interface CartItem extends Product {
  quantity: number
}

export default function Checkout() {
  const [productId, setProductId] = useState("")
  const [customerId, setCustomerId] = useState("")
  const [customer, setCustomer] = useState<any>(null)
  const [cart, setCart] = useState<CartItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isCheckingOut, setIsCheckingOut] = useState(false)
  const router = useRouter()

  // Check if user is logged in
  useEffect(() => {
    const user = localStorage.getItem("user")
    if (!user) {
      router.push("/")
    } else {
      const userData = JSON.parse(user)
      if (userData.role !== "employee") {
        router.push("/")
      }
    }
  }, [router])

  const handleAddProduct = async () => {
    if (!productId.trim()) return

    setIsLoading(true)
    try {
      const product = await getProductById(productId)

      if (!product) {
        toast({
          title: "Product Not Found",
          description: "Please check the product ID and try again",
          variant: "destructive",
        })
        return
      }

      // Check if product is already in cart
      const existingItemIndex = cart.findIndex((item) => item.id === product.id)

      if (existingItemIndex >= 0) {
        // Update quantity if product already in cart
        const updatedCart = [...cart]
        updatedCart[existingItemIndex].quantity += 1
        setCart(updatedCart)
      } else {
        // Add new product to cart
        setCart([...cart, { ...product, quantity: 1 }])
      }

      setProductId("")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add product to cart",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemoveItem = (index: number) => {
    const updatedCart = [...cart]
    updatedCart.splice(index, 1)
    setCart(updatedCart)
  }

  const handleUpdateQuantity = (index: number, newQuantity: number) => {
    if (newQuantity < 1) return

    const updatedCart = [...cart]
    updatedCart[index].quantity = newQuantity
    setCart(updatedCart)
  }

  const handleLookupCustomer = async () => {
    if (!customerId.trim()) return

    setIsLoading(true)
    try {
      const customerData = await getCustomerById(customerId)

      if (!customerData) {
        toast({
          title: "Customer Not Found",
          description: "Please check the customer ID and try again",
          variant: "destructive",
        })
        setCustomer(null)
        return
      }

      setCustomer(customerData)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to lookup customer",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const calculateSubtotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0)
  }

  const calculateTax = () => {
    return calculateSubtotal() * 0.08 // Assuming 8% tax rate
  }

  const calculateDiscount = () => {
    // Apply discount if customer has loyalty points
    if (customer && customer.loyaltyPoints >= 100) {
      return calculateSubtotal() * 0.05 // 5% discount
    }
    return 0
  }

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax() - calculateDiscount()
  }

  const handleCheckout = async () => {
    if (cart.length === 0) {
      toast({
        title: "Empty Cart",
        description: "Please add products to the cart before checkout",
        variant: "destructive",
      })
      return
    }

    setIsCheckingOut(true)
    try {
      const invoice = {
        customerId: customer?.id || "guest",
        items: cart.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
          price: item.price,
        })),
        subtotal: calculateSubtotal(),
        tax: calculateTax(),
        discount: calculateDiscount(),
        total: calculateTotal(),
        paymentMethod: "cash", // Default payment method
      }

      const response = await createInvoice(invoice)

      if (response.success) {
        toast({
          title: "Checkout Successful",
          description: `Invoice #${response.invoiceId} created successfully`,
        })

        // Clear cart and customer after successful checkout
        setCart([])
        setCustomer(null)
        setCustomerId("")
      } else {
        toast({
          title: "Checkout Failed",
          description: "Failed to create invoice",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred during checkout",
        variant: "destructive",
      })
    } finally {
      setIsCheckingOut(false)
    }
  }

  return (
    <EmployeeLayout>
      <div className="container mx-auto py-6">
        <h1 className="text-2xl font-bold mb-6">Checkout</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Shopping Cart</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2 mb-4">
                  <Input
                    placeholder="Enter Product ID"
                    value={productId}
                    onChange={(e) => setProductId(e.target.value)}
                    className="flex-1"
                  />
                  <Button onClick={handleAddProduct} disabled={isLoading}>
                    Add
                  </Button>
                </div>

                {cart.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {cart.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>{item.name}</TableCell>
                          <TableCell>${item.price.toFixed(2)}</TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleUpdateQuantity(index, item.quantity - 1)}
                              >
                                -
                              </Button>
                              <span>{item.quantity}</span>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleUpdateQuantity(index, item.quantity + 1)}
                              >
                                +
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell>${(item.price * item.quantity).toFixed(2)}</TableCell>
                          <TableCell>
                            <Button variant="destructive" size="sm" onClick={() => handleRemoveItem(index)}>
                              Remove
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-muted-foreground">No items in cart</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Customer</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2 mb-4">
                  <Input
                    placeholder="Enter Customer ID"
                    value={customerId}
                    onChange={(e) => setCustomerId(e.target.value)}
                    className="flex-1"
                  />
                  <Button onClick={handleLookupCustomer} disabled={isLoading}>
                    Lookup
                  </Button>
                </div>

                {customer ? (
                  <div className="space-y-2">
                    <p>
                      <strong>Name:</strong> {customer.name}
                    </p>
                    <p>
                      <strong>Loyalty Points:</strong> {customer.loyaltyPoints}
                    </p>
                    <p>
                      <strong>Credit Balance:</strong> ${customer.creditBalance.toFixed(2)}
                    </p>
                  </div>
                ) : (
                  <p className="text-muted-foreground">No customer selected</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>${calculateSubtotal().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax (8%):</span>
                    <span>${calculateTax().toFixed(2)}</span>
                  </div>
                  {calculateDiscount() > 0 && (
                    <div className="flex justify-between">
                      <span>Discount:</span>
                      <span>-${calculateDiscount().toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold pt-2 border-t">
                    <span>Total:</span>
                    <span>${calculateTotal().toFixed(2)}</span>
                  </div>
                </div>

                <Button className="w-full mt-4" onClick={handleCheckout} disabled={isCheckingOut || cart.length === 0}>
                  {isCheckingOut ? "Processing..." : "Complete Checkout"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </EmployeeLayout>
  )
}

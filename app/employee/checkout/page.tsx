"use client"

import { useState, useEffect } from "react"
import {
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "@/components/ui/use-toast"
import {
  getProductById, getCustomerById, updateCustomerCredits, createSale, getPromotions,
} from "@/lib/api"

export default function EmployeeCheckout() {
  const [productId, setProductId] = useState("")
  const [customerId, setCustomerId] = useState("")
  const [customer, setCustomer] = useState<any>(null)
  const [cartItems, setCartItems] = useState<any[]>([])
  const [appliedPromotions, setAppliedPromotions] = useState<any[]>([])
  const [availablePromotions, setAvailablePromotions] = useState<any[]>([])
  const [subtotal, setSubtotal] = useState(0)
  const [tax, setTax] = useState(0)
  const [discount, setDiscount] = useState(0)
  const [total, setTotal] = useState(0)
  const [isCheckingOut, setIsCheckingOut] = useState(false)
  const [useCredits, setUseCredits] = useState(false)

  useEffect(() => {
    const fetchPromotions = async () => {
      try {
        const promotions = await getPromotions()
        setAvailablePromotions(promotions)
      } catch (error) {
        console.error("Error fetching promotions:", error)
      }
    }

    fetchPromotions()
  }, [])

  useEffect(() => {
    calculateTotals()
  }, [cartItems, appliedPromotions, useCredits, customer])

  const handleAddProduct = async () => {
    if (!productId.trim()) return

    try {
      const product = await getProductById(productId)
      const existingIndex = cartItems.findIndex((item) => item.id === product.id)

      if (existingIndex >= 0) {
        const updated = [...cartItems]
        updated[existingIndex].quantity += 1
        setCartItems(updated)
      } else {
        setCartItems([...cartItems, { ...product, quantity: 1 }])
      }

      const promos = checkPromotions(product)

      if (promos.length > 0) {
        toast({
          title: "Promotion Found",
          description: promos.map((p) => p.name).join(", "),
        })
      }

      setProductId("")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add product. Please check the product ID.",
        variant: "destructive",
      })
    }
  }

  const handleRemoveItem = (index: number) => {
    const newItems = [...cartItems]
    newItems.splice(index, 1)
    setCartItems(newItems)
    recalculatePromotions(newItems)
  }

  const handleQuantityChange = (index: number, newQty: number) => {
    if (newQty < 1) return
    const updated = [...cartItems]
    updated[index].quantity = newQty
    setCartItems(updated)
    recalculatePromotions(updated)
  }

  const handleLookupCustomer = async () => {
    if (!customerId.trim()) return

    try {
      const customerData = await getCustomerById(customerId)
      setCustomer(customerData)
      toast({
        title: "Customer Found",
        description: `${customerData.name} has ${customerData.loyaltyPoints} points and $${customerData.creditBalance.toFixed(2)} credits.`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Customer not found. Please check the ID.",
        variant: "destructive",
      })
    }
  }

  const checkPromotions = (product: any) => {
    const promos = availablePromotions.filter(
      (promo) => promo.productId === product.id || promo.category === product.category || promo.applicableToAll,
    )

    const newPromos = promos.filter((p) => !appliedPromotions.some((a) => a.id === p.id))
    if (newPromos.length > 0) {
      setAppliedPromotions([...appliedPromotions, ...newPromos])
    }

    return newPromos
  }

  const recalculatePromotions = (items: any[]) => {
    const updated = appliedPromotions.filter((promo) => {
      if (promo.applicableToAll) return true
      return items.some((item) => promo.productId === item.id || promo.category === item.category)
    })
    setAppliedPromotions(updated)
  }

  const calculateTotals = () => {
    const sub = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
    setSubtotal(sub)

    let disc = 0
    appliedPromotions.forEach((promo) => {
      if (promo.discountType === "percentage") {
        disc += sub * (promo.discountValue / 100)
      } else if (promo.discountType === "fixed") {
        disc += promo.discountValue
      }
    })

    if (useCredits && customer && customer.creditBalance > 0) {
      const creditUsed = Math.min(customer.creditBalance, sub - disc)
      disc += creditUsed
    }

    setDiscount(disc)
    const taxAmount = (sub - disc) * 0.08
    setTax(taxAmount)
    setTotal(sub - disc + taxAmount)
  }

  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      toast({
        title: "Error",
        description: "Cart is empty.",
        variant: "destructive",
      })
      return
    }

    setIsCheckingOut(true)

    try {
      const sale = {
        customerId: customer?.id || null,
        items: cartItems.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
          price: item.price,
        })),
        subtotal,
        tax,
        discount,
        total,
        appliedPromotions: appliedPromotions.map((p) => p.id),
        creditsUsed: useCredits && customer ? Math.min(customer.creditBalance, discount) : 0,
      }

      const result = await createSale(sale)

      if (customer) {
        const earned = Math.floor(total / 10)
        const remaining = useCredits
          ? Math.max(0, customer.creditBalance - Math.min(customer.creditBalance, discount))
          : customer.creditBalance

        await updateCustomerCredits(customer.id, remaining + earned)
      }

      toast({
        title: "Checkout Complete",
        description: `Sale #${result.id} processed successfully.`,
      })
      // Build invoice content
      const invoiceContent = `
      Sale ID: ${result.id}
      Customer: ${customer ? customer.name : "Guest"}
      Date: ${new Date().toLocaleString()}

      Items:
      ${cartItems.map((item) => `- ${item.name} x${item.quantity} @ $${item.price.toFixed(2)}`).join("\n")}

      Subtotal: $${subtotal.toFixed(2)}
      Discount: -$${discount.toFixed(2)}
      Tax: $${tax.toFixed(2)}
      Total: $${total.toFixed(2)}
      `

      // Create blob and download link
      const blob = new Blob([invoiceContent], { type: "text/plain" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `invoice-${result.id}.txt`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      setCartItems([])
      setCustomer(null)
      setCustomerId("")
      setAppliedPromotions([])
      setUseCredits(false)
    } catch (error) {
      toast({
        title: "Checkout Error",
        description: "Failed to process checkout.",
        variant: "destructive",
      })
    } finally {
      setIsCheckingOut(false)
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Cart Panel */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Checkout</CardTitle>
          <CardDescription>Enter product ID to add items</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <Input
              placeholder="Enter Product ID"
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddProduct()}
            />
            <Button onClick={handleAddProduct}>Add</Button>
          </div>

          {cartItems.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Qty</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cartItems.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>${item.price.toFixed(2)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button size="icon" variant="outline" onClick={() => handleQuantityChange(index, item.quantity - 1)}>-</Button>
                        <span>{item.quantity}</span>
                        <Button size="icon" variant="outline" onClick={() => handleQuantityChange(index, item.quantity + 1)}>+</Button>
                      </div>
                    </TableCell>
                    <TableCell>${(item.price * item.quantity).toFixed(2)}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => handleRemoveItem(index)}>×</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-center text-muted mt-6">No items in cart</p>
          )}
        </CardContent>
      </Card>

      {/* Customer & Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Customer */}
          <div className="space-y-2">
            <Label>Customer ID</Label>
            <div className="flex gap-2">
              <Input
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                placeholder="Optional"
              />
              <Button variant="outline" onClick={handleLookupCustomer}>Lookup</Button>
            </div>
            {customer && (
              <div className="text-sm bg-gray-50 p-3 rounded">
                <p><b>{customer.name}</b></p>
                <p>Loyalty Points: {customer.loyaltyPoints}</p>
                <p>Credit Balance: ${customer.creditBalance.toFixed(2)}</p>
                {customer.creditBalance > 0 && (
                  <div className="flex gap-2 items-center mt-2">
                    <input
                      type="checkbox"
                      id="useCredits"
                      checked={useCredits}
                      onChange={(e) => setUseCredits(e.target.checked)}
                    />
                    <Label htmlFor="useCredits">Use credits</Label>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Promotions */}
          {appliedPromotions.length > 0 && (
            <div>
              <h3 className="font-medium mb-2">Applied Promotions</h3>
              <ul className="space-y-1 text-sm">
                {appliedPromotions.map((promo, index) => (
                  <li key={index} className="flex justify-between text-green-700">
                    <span>
                      {promo.name} - {promo.discountType === "percentage"
                        ? `${promo.discountValue}%`
                        : `$${promo.discountValue}`} off
                    </span>
                    <Button variant="outline" size="sm" onClick={() => {
                      const newPromos = [...appliedPromotions]
                      newPromos.splice(index, 1)
                      setAppliedPromotions(newPromos)
                    }}>Remove</Button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Totals */}
          <div className="space-y-1 border-t pt-4">
            <div className="flex justify-between"><span>Subtotal:</span><span>${subtotal.toFixed(2)}</span></div>
            {discount > 0 && <div className="flex justify-between text-green-600"><span>Discount:</span><span>-${discount.toFixed(2)}</span></div>}
            <div className="flex justify-between"><span>Tax (8%):</span><span>${tax.toFixed(2)}</span></div>
            <div className="flex justify-between font-bold"><span>Total:</span><span>${total.toFixed(2)}</span></div>
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={handleCheckout} disabled={isCheckingOut || cartItems.length === 0}>
            {isCheckingOut ? "Processing..." : "Complete Checkout"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

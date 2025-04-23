"use client"

"use client"

import { useState, useEffect } from "react"
import ManagerLayout from "@/components/layouts/manager-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface Customer {
  customerID: string
  loyaltyPoints: number
  userInfo: {
    name: string
    email: string
    phone?: string
  }
}

const mockCustomers: Customer[] = [
  {
    customerID: "CUST001",
    loyaltyPoints: 120,
    userInfo: {
      name: "Alice Sharma",
      email: "alice@example.com",
      phone: "9876543210"
    }
  },
  {
    customerID: "CUST002",
    loyaltyPoints: 75,
    userInfo: {
      name: "Bob Mehta",
      email: "bob@example.com",
      phone: "9123456789"
    }
  }
]

export default function ManagerCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [search, setSearch] = useState("")

  useEffect(() => {
    // Replace this with API call: e.g. fetchCustomers()
    setCustomers(mockCustomers)
  }, [])

  const filteredCustomers = customers.filter((cust) =>
    cust.customerID.toLowerCase().includes(search.toLowerCase()) ||
    cust.userInfo.name.toLowerCase().includes(search.toLowerCase()) ||
    cust.userInfo.email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <ManagerLayout>
      <div className="container py-6">
        <Card>
          <CardHeader>
            <CardTitle>Customer Management</CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              placeholder="Search by name, email, or ID..."
              className="mb-4"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Loyalty Points</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.map((cust) => (
                  <TableRow key={cust.customerID}>
                    <TableCell>{cust.customerID}</TableCell>
                    <TableCell>{cust.userInfo.name}</TableCell>
                    <TableCell>{cust.userInfo.email}</TableCell>
                    <TableCell>{cust.userInfo.phone ?? "N/A"}</TableCell>
                    <TableCell>{cust.loyaltyPoints}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {filteredCustomers.length === 0 && (
              <p className="text-center text-gray-500 mt-6">No matching customers found.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </ManagerLayout>
  )
}

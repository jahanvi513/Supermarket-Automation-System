"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ShoppingCart, Package, Store, LogOut, Search } from "lucide-react"

interface EmployeeLayoutProps {
  children: React.ReactNode
}

export default function EmployeeLayout({ children }: EmployeeLayoutProps) {
  const [username, setUsername] = useState("")
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const user = localStorage.getItem("user")
    if (!user) {
      router.push("/")
    } else {
      const userData = JSON.parse(user)
      if (userData.role !== "employee") {
        router.push("/")
      } else {
        setUsername(userData.username)
      }
    }
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("user")
    router.push("/")
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-bold">SNU-Mart</h1>
          <div className="flex items-center space-x-4">
            <span>Welcome, {username}</span>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        <aside className="w-64 bg-gray-100 border-r">
          <nav className="p-4 space-y-2">
            <Link href="/employee/checkout">
              <Button
                variant={pathname === "/employee/checkout" ? "default" : "ghost"}
                className="w-full justify-start"
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Checkout
              </Button>
            </Link>
            <Link href="/employee/products">
              <Button
                variant={pathname === "/employee/products" ? "default" : "ghost"}
                className="w-full justify-start"
              >
                <Package className="h-4 w-4 mr-2" />
                Products
              </Button>
            </Link>
            <Link href="/employee/store-layout">
              <Button
                variant={pathname === "/employee/store-layout" ? "default" : "ghost"}
                className="w-full justify-start"
              >
                <Store className="h-4 w-4 mr-2" />
                Store Layout
              </Button>
            </Link>
            <Link href="/employee/search">
              <Button variant={pathname === "/employee/search" ? "default" : "ghost"} className="w-full justify-start">
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </Link>
          </nav>
        </aside>

        <main className="flex-1 bg-gray-50">{children}</main>
      </div>
    </div>
  )
}

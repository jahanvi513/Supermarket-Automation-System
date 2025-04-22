// API utility functions
const API_BASE_URL = "/api"

// Auth functions
export async function loginUser(username: string, password: string, role: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password, role }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: "Login failed" }))
      return { success: false, message: errorData.message || "Login failed" }
    }

    return await response.json()
  } catch (error: any) {
    console.error("Login error:", error)
    return { success: false, message: error.message || "An error occurred" }
  }
}

export async function logoutUser() {
  localStorage.removeItem("user")
}

// Alias for backward compatibility
export const login = loginUser

// Product functions
export async function getProducts() {
  try {
    const response = await fetch(`${API_BASE_URL}/products`)

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Error response:", errorText)
      throw new Error("Failed to fetch products")
    }

    return await response.json()
  } catch (error) {
    console.error("Error fetching products:", error)
    return []
  }
}

export async function getProductById(id: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/products/${id}`)

    if (!response.ok) {
      return null
    }

    return await response.json()
  } catch (error) {
    console.error(`Error fetching product ${id}:`, error)
    return null
  }
}

export async function createProduct(productData: any) {
  try {
    const response = await fetch(`${API_BASE_URL}/products`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(productData),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Error response:", errorText)
      throw new Error("Failed to create product")
    }

    return await response.json()
  } catch (error) {
    console.error("Error creating product:", error)
    throw error
  }
}

export async function updateProduct(id: string, productData: any) {
  try {
    const response = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(productData),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Error response:", errorText)
      throw new Error("Failed to update product")
    }

    return await response.json()
  } catch (error) {
    console.error(`Error updating product ${id}:`, error)
    throw error
  }
}

export async function deleteProduct(id: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: "DELETE",
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Error response:", errorText)
      throw new Error("Failed to delete product")
    }

    return await response.json()
  } catch (error) {
    console.error(`Error deleting product ${id}:`, error)
    throw error
  }
}

// Inventory functions
export async function getInventory() {
  try {
    const response = await fetch(`${API_BASE_URL}/inventory`)

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Error response:", errorText)
      throw new Error("Failed to fetch inventory")
    }

    return await response.json()
  } catch (error) {
    console.error("Error fetching inventory:", error)
    return []
  }
}

export async function updateInventory(id: string, quantity: number) {
  try {
    const response = await fetch(`${API_BASE_URL}/inventory/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ quantity }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Error response:", errorText)
      throw new Error("Failed to update inventory item")
    }

    return await response.json()
  } catch (error) {
    console.error(`Error updating inventory item ${id}:`, error)
    throw error
  }
}

// Customer functions
export async function getCustomers() {
  try {
    const response = await fetch(`${API_BASE_URL}/customers`)

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Error response:", errorText)
      throw new Error("Failed to fetch customers")
    }

    return await response.json()
  } catch (error) {
    console.error("Error fetching customers:", error)
    return []
  }
}

export async function getCustomerById(id: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/customers/${id}`)

    if (!response.ok) {
      return null
    }

    return await response.json()
  } catch (error) {
    console.error(`Error fetching customer ${id}:`, error)
    return null
  }
}

export async function updateCustomerCredits(id: string, credits: number) {
  try {
    const response = await fetch(`${API_BASE_URL}/customers/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ credits }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Error response:", errorText)
      throw new Error("Failed to update customer credits")
    }

    return await response.json()
  } catch (error) {
    console.error(`Error updating customer credits ${id}:`, error)
    throw error
  }
}

// Store layout functions
export async function getStoreLayout() {
  try {
    const response = await fetch(`${API_BASE_URL}/store/layout`)

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Error response:", errorText)
      throw new Error("Failed to fetch store layout")
    }

    return await response.json()
  } catch (error) {
    console.error("Error fetching store layout:", error)
    throw error
  }
}

// Report functions
export async function getSales(startDate: string, endDate: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/reports/sales?startDate=${startDate}&endDate=${endDate}`)

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Error response:", errorText)
      throw new Error(`Failed to fetch sales report`)
    }

    return await response.json()
  } catch (error) {
    console.error(`Error fetching sales report:`, error)
    return []
  }
}

export async function generateReport(type: string, startDate: string, endDate: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/reports/${type}?startDate=${startDate}&endDate=${endDate}`)

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Error response:", errorText)
      throw new Error(`Failed to generate ${type} report`)
    }

    return await response.json()
  } catch (error) {
    console.error(`Error generating ${type} report:`, error)
    throw error
  }
}

// Invoice/Sale functions
export async function createSale(saleData: any) {
  try {
    const response = await fetch(`${API_BASE_URL}/invoices`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(saleData),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Error response:", errorText)
      throw new Error("Failed to create sale")
    }

    return await response.json()
  } catch (error) {
    console.error("Error creating sale:", error)
    throw error
  }
}

// Alias for backward compatibility
export const createInvoice = createSale

// Promotion functions
export async function getPromotions() {
  try {
    const response = await fetch(`${API_BASE_URL}/promotions`)

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Error response:", errorText)
      throw new Error("Failed to fetch promotions")
    }

    return await response.json()
  } catch (error) {
    console.error("Error fetching promotions:", error)
    return []
  }
}

export async function createPromotion(promotionData: any) {
  try {
    const response = await fetch(`${API_BASE_URL}/promotions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(promotionData),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Error response:", errorText)
      throw new Error("Failed to create promotion")
    }

    return await response.json()
  } catch (error) {
    console.error("Error creating promotion:", error)
    throw error
  }
}

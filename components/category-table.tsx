"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { MoreHorizontal, Search, FolderOpen, Loader2, X, Pencil } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { categoryAPI, productAPI } from "@/lib/api"

interface Category {
  _id: string
  name: string
  slug: string
  description?: string
  image?: string
  icon?: string
  parentCategory?: {
    _id: string
    name: string
  } | string
  subcategories?: Array<{ _id: string; name: string }> | string[]
  isActive?: boolean
  sortOrder?: number
  productCount?: number
  createdAt?: string | Date
  updatedAt?: string | Date
}

export function CategoryTable() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = React.useState("")
  const [categories, setCategories] = React.useState<Category[]>([])
  const [loading, setLoading] = React.useState(true)
  const [productCounts, setProductCounts] = React.useState<Record<string, number>>({})
  const [loadingCounts, setLoadingCounts] = React.useState(false)
  const fetchingCountsRef = React.useRef(false)

  // Fetch categories on mount
  React.useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      setLoading(true)
      // Fetch all categories including inactive ones for admin view
      const response = await categoryAPI.getAll(true)
      
      if (response.success && response.data?.categories) {
        const categoriesData = Array.isArray(response.data.categories) ? response.data.categories : []
        setCategories(categoriesData)
        
        // Fetch product counts after categories are loaded (with delay to avoid rate limiting)
        // Only fetch if we have categories and not already fetching
        if (categoriesData.length > 0 && !fetchingCountsRef.current) {
          setTimeout(() => {
            fetchProductCounts(categoriesData)
          }, 500) // Small delay to avoid hitting rate limits
        }
      } else {
        console.error("API response error:", response)
        setCategories([])
      }
    } catch (error: any) {
      console.error("Error fetching categories:", error)
      if (error.response?.status === 429) {
        console.warn("Rate limit exceeded. Product counts will not be loaded.")
      }
      setCategories([])
    } finally {
      setLoading(false)
    }
  }

  const fetchProductCounts = async (categoriesList: Category[]) => {
    // Prevent multiple simultaneous calls
    if (fetchingCountsRef.current) {
      return
    }
    
    try {
      fetchingCountsRef.current = true
      setLoadingCounts(true)
      const counts: Record<string, number> = {}
      
      // Initialize all counts to 0 first
      categoriesList.forEach((cat) => {
        counts[cat._id] = 0
      })
      setProductCounts(counts)
      
      // Fetch all products once to count by category
      // Use pagination to get all products
      let allProducts: any[] = []
      let page = 1
      const limit = 100
      let hasMore = true
      
      while (hasMore) {
        try {
          const productsResponse = await productAPI.getAll({ page, limit })
          
          if (productsResponse.success && productsResponse.data) {
            const products = Array.isArray(productsResponse.data) ? productsResponse.data : []
            allProducts = [...allProducts, ...products]
            
            // Check if there are more pages
            const total = productsResponse.meta?.total || 0
            hasMore = allProducts.length < total && products.length === limit
            
            if (hasMore) {
              page++
              // Small delay between requests to avoid rate limiting
              await new Promise(resolve => setTimeout(resolve, 100))
            }
          } else {
            hasMore = false
          }
        } catch (error: any) {
          if (error.response?.status === 429) {
            console.warn("Rate limit exceeded while fetching product counts. Using partial data.")
            hasMore = false
          } else {
            throw error
          }
        }
      }
      
      // Count products per category
      categoriesList.forEach((category) => {
        const categoryId = category._id
        const count = allProducts.filter((product: any) => {
          const productCategory = product.category
          if (typeof productCategory === "string") {
            return productCategory === categoryId
          } else if (productCategory?._id) {
            return productCategory._id === categoryId
          }
          return false
        }).length
        counts[categoryId] = count
      })
      
      setProductCounts(counts)
    } catch (error: any) {
      console.error("Error fetching product counts:", error)
      if (error.response?.status === 429) {
        console.warn("Rate limit exceeded. Product counts unavailable.")
      }
      // Keep existing counts or set to 0
      const counts: Record<string, number> = {}
      categoriesList.forEach((cat) => {
        counts[cat._id] = productCounts[cat._id] || 0
      })
      setProductCounts(counts)
    } finally {
      setLoadingCounts(false)
      fetchingCountsRef.current = false
    }
  }

  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.slug.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getProductCount = (categoryId: string): number => {
    return productCounts[categoryId] ?? 0
  }

  const getStatus = (category: Category): string => {
    return category.isActive ? "active" : "archived"
  }

  return (
    <Card className="border-none shadow-md bg-white overflow-hidden">
      <div className="p-6 border-b border-slate-100">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            type="text"
            placeholder="Search categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full max-w-sm border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-slate-100 hover:bg-transparent">
              <TableHead className="pl-6 py-4 text-slate-600 font-medium">Image</TableHead>
              <TableHead className="text-slate-600 font-medium">Name</TableHead>
              <TableHead className="text-slate-600 font-medium">Slug</TableHead>
              <TableHead className="text-slate-600 font-medium">Products</TableHead>
              <TableHead className="text-slate-600 font-medium">Status</TableHead>
              <TableHead className="text-slate-600 font-medium text-right pr-6">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  <div className="flex flex-col items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-emerald-600 mb-2" />
                    <p className="text-sm text-slate-600">Loading categories...</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredCategories.length > 0 ? (
              filteredCategories.map((category) => (
                <TableRow
                  key={category._id}
                  className="group hover:bg-slate-50/80 transition-colors border-slate-100 cursor-pointer"
                >
                  <TableCell className="pl-6 py-4">
                    <div className="h-12 w-12 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center">
                      {category.image ? (
                        <Image
                          src={category.image}
                          alt={category.name || "Category"}
                          width={48}
                          height={48}
                          className="w-full h-full object-cover"
                          unoptimized
                        />
                      ) : (
                        <FolderOpen className="h-6 w-6 text-slate-400" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="flex flex-col">
                      <span className="font-medium text-slate-900 text-sm">{category.name || "Unnamed Category"}</span>
                      {category.parentCategory && (
                        <span className="text-xs text-slate-500 mt-0.5">
                          {typeof category.parentCategory === "object" 
                            ? category.parentCategory.name 
                            : "Subcategory"}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-slate-600 font-mono">{category.slug || "N/A"}</span>
                  </TableCell>
                  <TableCell>
                    {loadingCounts ? (
                      <span className="text-sm text-slate-400 italic">Loading...</span>
                    ) : (
                      <span className="text-sm text-slate-700 font-medium">
                        {getProductCount(category._id)}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={
                        getStatus(category) === "active"
                          ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-100 font-normal shadow-none"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200 border-slate-200 font-normal shadow-none"
                      }
                    >
                      {getStatus(category)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          className="h-8 w-8 p-0 text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                        >
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="cursor-pointer"
                          onClick={() => router.push(`/categories/${category._id}`)}
                        >
                          <Pencil className="mr-2 h-3.5 w-3.5 text-slate-500" />
                          Edit category
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer">
                          {getStatus(category) === "active" ? "Archive category" : "Activate category"}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer">
                          Delete category
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <FolderOpen className="h-8 w-8 text-slate-300" />
                    <p className="text-sm text-slate-500">No categories found.</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </Card>
  )
}


"use client"

import * as React from "react"
import { MoreHorizontal, Search, Filter, ArrowUpDown, Pencil, Trash2, PackageOpen, X, Loader2 } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { productAPI, categoryAPI } from "@/lib/api"

interface Product {
  _id: string
  name: string
  description?: string
  sku?: string
  category?: {
    _id: string
    name: string
  } | string
  subcategory?: {
    _id: string
    name: string
  } | string
  price: number
  originalPrice?: number
  discount?: number
  cost?: number
  stock: number
  minStock?: number
  maxStock?: number
  unit?: string
  brand?: string
  weight?: number
  isActive?: boolean
  isFeatured?: boolean
  isOutOfStock?: boolean
  images?: string[]
  thumbnail?: string
  createdAt?: string | Date
  updatedAt?: string | Date
}

export function ProductTable() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = React.useState("")
  const [categoryFilter, setCategoryFilter] = React.useState("all")
  const [statusFilter, setStatusFilter] = React.useState("all")
  const [products, setProducts] = React.useState<Product[]>([])
  const [categories, setCategories] = React.useState<Array<{ _id: string; name: string }>>([])
  const [loading, setLoading] = React.useState(true)
  const [page, setPage] = React.useState(1)
  const [total, setTotal] = React.useState(0)
  const [limit] = React.useState(20)
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false)
  const [productToDelete, setProductToDelete] = React.useState<Product | null>(null)
  const [deleting, setDeleting] = React.useState(false)

  // Fetch products
  React.useEffect(() => {
    fetchProducts()
  }, [page, searchTerm, categoryFilter, statusFilter])

  // Fetch categories on mount
  React.useEffect(() => {
    fetchCategories()
  }, [])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const params: any = {}

      // Only add page and limit if they have valid values
      if (page && page > 0) {
        params.page = page
      }
      if (limit && limit > 0) {
        params.limit = limit
      }

      if (searchTerm && searchTerm.trim()) {
        params.search = searchTerm.trim()
      }

      if (categoryFilter && categoryFilter !== "all") {
        params.category = categoryFilter
      }

      if (statusFilter === "active") {
        params.isActive = true
      } else if (statusFilter === "out_of_stock") {
        params.isOutOfStock = true
      } else if (statusFilter === "draft") {
        params.isActive = false
      }

      const response = await productAPI.getAll(params)
      
      if (response.success && response.data) {
        // Ensure we have an array
        const productsData = Array.isArray(response.data) ? response.data : []
        setProducts(productsData)
        setTotal(response.meta?.total || 0)
        
        // Log for debugging if no products but total > 0
        if (productsData.length === 0 && (response.meta?.total || 0) > 0) {
          console.warn("API returned products but data array is empty", response)
        }
      } else {
        console.error("API response error:", response)
        setProducts([])
        setTotal(0)
      }
    } catch (error) {
      console.error("Error fetching products:", error)
      setProducts([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await categoryAPI.getAll()
      if (response.success && response.data?.categories) {
        setCategories(response.data.categories)
      }
    } catch (error) {
      console.error("Error fetching categories:", error)
    }
  }

  const hasActiveFilters = categoryFilter !== "all" || statusFilter !== "all" || searchTerm !== ""

  const clearFilters = () => {
    setSearchTerm("")
    setCategoryFilter("all")
    setStatusFilter("all")
    setPage(1)
  }

  const getCategoryName = (category: Product["category"]): string => {
    if (!category) return "Uncategorized"
    if (typeof category === "string") {
      // If it's a string, try to find it in categories list
      const found = categories.find(cat => cat._id === category)
      return found?.name || category || "Uncategorized"
    }
    return category.name || "Uncategorized"
  }

  const getStatus = (product: Product): string => {
    if (product.isOutOfStock) return "out_of_stock"
    if (!product.isActive) return "draft"
    return "active"
  }

  const getProductImage = (product: Product): string => {
    if (product.thumbnail) return product.thumbnail
    if (product.images && product.images.length > 0) return product.images[0]
    return "/placeholder.svg"
  }

  const handleDeleteClick = (product: Product) => {
    setProductToDelete(product)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!productToDelete) return

    try {
      setDeleting(true)
      // Use hard delete to permanently remove the product
      const response = await productAPI.hardDelete(productToDelete._id)
      
      if (response.success) {
        // Refresh products list
        fetchProducts()
        setDeleteDialogOpen(false)
        setProductToDelete(null)
      } else {
        alert(response.message || "Failed to delete product")
      }
    } catch (error: any) {
      alert(error.response?.data?.message || "An error occurred while deleting the product")
    } finally {
      setDeleting(false)
    }
  }

  return (
    <Card className="border-none shadow-md bg-white overflow-hidden">
      <div className="p-6 space-y-4 border-b border-slate-100">
        <div className="flex flex-col md:flex-row gap-4 justify-between">
          {/* Search */}
          <div className="relative flex-1 md:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products, SKU..."
              className="pl-10 bg-slate-50 border-slate-200 focus-visible:ring-emerald-500 focus-visible:border-emerald-500 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3 items-center">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[160px] bg-slate-50 border-slate-200 focus:ring-emerald-500">
                <div className="flex items-center gap-2 text-slate-600">
                  <Filter className="h-3.5 w-3.5" />
                  <SelectValue placeholder="Category" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category._id} value={category._id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px] bg-slate-50 border-slate-200 focus:ring-emerald-500">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="out_of_stock">Out of Stock</SelectItem>
              </SelectContent>
            </Select>

            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-red-600 hover:bg-red-50"
                onClick={clearFilters}
              >
                Clear
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="relative w-full overflow-auto">
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow className="hover:bg-transparent border-slate-100">
              <TableHead className="w-[300px] text-xs font-semibold uppercase tracking-wider text-slate-500 pl-6 h-12">
                Product
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-slate-500 h-12">SKU</TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-slate-500 h-12">
                Category
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-slate-500 h-12">
                <div className="flex items-center gap-1 cursor-pointer hover:text-slate-700 group">
                  Price <ArrowUpDown className="h-3 w-3 opacity-50 group-hover:opacity-100 transition-opacity" />
                </div>
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-slate-500 h-12">
                Stock
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-slate-500 h-12">
                Status
              </TableHead>
              <TableHead className="w-[50px] h-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  <div className="flex flex-col items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-emerald-600 mb-2" />
                    <p className="text-sm text-slate-600">Loading products...</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : products.length > 0 ? (
              products.map((product) => (
                <TableRow
                  key={product._id}
                  className="group hover:bg-slate-50/80 transition-colors border-slate-100 cursor-pointer"
                >
                  <TableCell className="pl-6 py-3">
                    <div className="flex items-center gap-4">
                      <div className="relative h-10 w-10 rounded-lg overflow-hidden border border-slate-100 bg-white shadow-sm group-hover:shadow-md transition-all">
                        <Image
                          src={getProductImage(product)}
                          alt={product.name}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-medium text-slate-900 text-sm">{product.name || "Unnamed Product"}</span>
                        {product.brand && (
                          <span className="text-xs text-slate-500 mt-0.5">{product.brand}</span>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-slate-500">
                    {product.sku || <span className="text-slate-400 italic">No SKU</span>}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-100 font-normal shadow-none"
                    >
                      {getCategoryName(product.category)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      {product.originalPrice && product.originalPrice > product.price ? (
                        <>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm text-slate-700">₹{product.price.toFixed(2)}</span>
                            <span className="text-xs text-slate-400 line-through">₹{product.originalPrice.toFixed(2)}</span>
                          </div>
                          {product.discount && product.discount > 0 && (
                            <span className="text-[10px] text-emerald-600 font-medium">{product.discount}% off</span>
                          )}
                        </>
                      ) : (
                        <>
                          <span className="font-medium text-sm text-slate-700">₹{product.price?.toFixed(2) || "0.00"}</span>
                          {product.discount && product.discount > 0 && (
                            <span className="text-[10px] text-emerald-600 font-medium">{product.discount}% off</span>
                          )}
                        </>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`font-medium text-sm ${
                          product.stock === undefined || product.stock === null
                            ? "text-slate-400"
                            : product.stock < (product.minStock || 10)
                            ? "text-amber-600"
                            : "text-slate-700"
                        }`}
                      >
                        {product.stock !== undefined && product.stock !== null ? product.stock : "N/A"}
                      </span>
                      {product.unit && <span className="text-xs text-muted-foreground">{product.unit}</span>}
                    </div>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={getStatus(product)} />
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          className="h-8 w-8 p-0 text-slate-400 hover:text-slate-600 data-[state=open]:bg-slate-100 focus-visible:ring-1 focus-visible:ring-slate-300"
                        >
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-[160px]">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="cursor-pointer"
                          onClick={() => router.push(`/products/${product._id}`)}
                        >
                          <Pencil className="mr-2 h-3.5 w-3.5 text-slate-500" /> Edit Details
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer">
                          <PackageOpen className="mr-2 h-3.5 w-3.5 text-slate-500" /> Manage Stock
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer"
                          onClick={() => handleDeleteClick(product)}
                        >
                          <Trash2 className="mr-2 h-3.5 w-3.5" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  <div className="flex flex-col items-center justify-center text-muted-foreground py-8">
                    <div className="h-12 w-12 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                      <Search className="h-6 w-6 text-slate-300" />
                    </div>
                    <p className="text-sm font-medium text-slate-900">No products found</p>
                    <p className="text-xs text-slate-500 mt-1">Try adjusting your search or filters</p>
                    <Button variant="link" className="text-emerald-600 h-auto p-0 mt-2 text-xs" onClick={clearFilters}>
                      Clear all filters
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="p-4 border-t bg-slate-50/50 flex items-center justify-between text-xs text-muted-foreground">
        <span>
          Showing {products.length} of {total} products
        </span>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page === 1 || loading}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="h-7 px-3 text-xs bg-white"
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={page * limit >= total || loading}
            onClick={() => setPage((p) => p + 1)}
            className="h-7 px-3 text-xs bg-white"
          >
            Next
          </Button>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the product "{productToDelete?.name}". This action cannot be undone. All product images will also be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}

function StatusBadge({ status }: { status: string }) {
  if (status === "active") {
    return (
      <Badge className="bg-green-50 text-green-700 hover:bg-green-100 border-green-200 shadow-none font-medium px-2 py-0.5">
        Active
      </Badge>
    )
  }
  if (status === "out_of_stock") {
    return (
      <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 font-medium px-2 py-0.5">
        Out of Stock
      </Badge>
    )
  }
  return (
    <Badge variant="outline" className="bg-slate-100 text-slate-700 border-slate-200 font-medium px-2 py-0.5">
      Draft
    </Badge>
  )
}

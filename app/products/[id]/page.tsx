"use client"

import * as React from "react"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeft, Loader2, Upload, X } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { productAPI, categoryAPI } from "@/lib/api"
import Image from "next/image"

export default function ProductFormPage() {
  const router = useRouter()
  const params = useParams()
  const productId = params?.id as string | undefined
  const isEditMode = productId && productId !== "new"
  
  const [loading, setLoading] = React.useState(false)
  const [fetchingProduct, setFetchingProduct] = React.useState(isEditMode || false)
  const [categories, setCategories] = React.useState<Array<{ _id: string; name: string }>>([])
  const [subcategories, setSubcategories] = React.useState<Array<{ _id: string; name: string }>>([])
  const [selectedCategory, setSelectedCategory] = React.useState<string>("")
  const [imagePreviews, setImagePreviews] = React.useState<string[]>([])
  const [imageFiles, setImageFiles] = React.useState<File[]>([])
  const [error, setError] = React.useState("")

  // Form state
  const [formData, setFormData] = React.useState({
    name: "",
    description: "",
    category: "",
    subcategory: "",
    price: "",
    originalPrice: "",
    discount: "",
    cost: "",
    stock: "",
    minStock: "5",
    maxStock: "",
    sku: "",
    barcode: "",
    brand: "",
    weight: "",
    unit: "kg",
    isActive: true,
    isFeatured: false,
  })

  // Fetch product data if in edit mode
  React.useEffect(() => {
    if (isEditMode && productId) {
      fetchProduct()
    }
  }, [isEditMode, productId])

  // Fetch categories on mount
  React.useEffect(() => {
    fetchCategories()
  }, [])

  // Fetch subcategories when category changes
  React.useEffect(() => {
    if (selectedCategory) {
      fetchSubcategories(selectedCategory)
    } else {
      setSubcategories([])
    }
  }, [selectedCategory])

  const fetchProduct = async () => {
    if (!productId) return
    
    try {
      setFetchingProduct(true)
      const response = await productAPI.getById(productId)
      
      if (response.success && response.data?.product) {
        const product = response.data.product
        
        // Populate form with product data
        const subcategoryId = product.subcategory?._id || product.subcategory || ""
        setFormData({
          name: product.name || "",
          description: product.description || "",
          category: "",
          subcategory: subcategoryId || "none",
          price: product.price?.toString() || "",
          originalPrice: product.originalPrice?.toString() || "",
          discount: product.discount?.toString() || "",
          cost: product.cost?.toString() || "",
          stock: product.stock?.toString() || "",
          minStock: product.minStock?.toString() || "5",
          maxStock: product.maxStock?.toString() || "",
          sku: product.sku || "",
          barcode: product.barcode || "",
          brand: product.brand || "",
          weight: product.weight?.toString() || "",
          unit: product.unit || "kg",
          isActive: product.isActive !== undefined ? product.isActive : true,
          isFeatured: product.isFeatured || false,
        })

        // Set category and load subcategories
        const categoryId = product.category?._id || product.category || ""
        if (categoryId) {
          setSelectedCategory(categoryId)
        }

        // Set existing images as previews
        if (product.images && product.images.length > 0) {
          setImagePreviews(product.images)
        } else if (product.thumbnail) {
          setImagePreviews([product.thumbnail])
        }
      }
    } catch (error) {
      console.error("Error fetching product:", error)
      setError("Failed to load product data")
    } finally {
      setFetchingProduct(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await categoryAPI.getMain()
      if (response.success && response.data?.categories) {
        setCategories(response.data.categories)
      }
    } catch (error) {
      console.error("Error fetching categories:", error)
    }
  }

  const fetchSubcategories = async (parentId: string) => {
    try {
      const response = await categoryAPI.getSubcategories(parentId)
      if (response.success && response.data?.subcategories) {
        setSubcategories(response.data.subcategories)
      }
    } catch (error) {
      console.error("Error fetching subcategories:", error)
      setSubcategories([])
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => {
      const updated = { ...prev, [name]: value }
      
      // Auto-calculate discount when price or originalPrice changes
      if (name === 'price' || name === 'originalPrice') {
        const price = name === 'price' ? parseFloat(value) || 0 : parseFloat(prev.price) || 0
        const originalPrice = name === 'originalPrice' ? parseFloat(value) || 0 : parseFloat(prev.originalPrice) || 0
        
        if (originalPrice > 0 && price < originalPrice) {
          const calculatedDiscount = ((originalPrice - price) / originalPrice) * 100
          updated.discount = calculatedDiscount.toFixed(2)
        } else {
          updated.discount = ''
        }
      }
      
      return updated
    })
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    const newFiles = Array.from(files)
    setImageFiles((prev) => [...prev, ...newFiles])

    const newPreviews: string[] = []
    newFiles.forEach((file) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        newPreviews.push(reader.result as string)
        if (newPreviews.length === newFiles.length) {
          setImagePreviews((prev) => [...prev, ...newPreviews])
        }
      }
      reader.readAsDataURL(file)
    })
  }

  const removeImage = (index: number) => {
    setImagePreviews((prev) => prev.filter((_, i) => i !== index))
    setImageFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const formDataToSend = new FormData()

      // Add all form fields
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== "" && value !== null && value !== undefined) {
          if (key === "isActive" || key === "isFeatured") {
            formDataToSend.append(key, value ? "true" : "false")
          } else {
            formDataToSend.append(key, String(value))
          }
        }
      })

      // Add category
      if (selectedCategory) {
        formDataToSend.append("category", selectedCategory)
      }

      // Add subcategory if selected (and not "none")
      if (formData.subcategory && formData.subcategory !== "none") {
        formDataToSend.append("subcategory", formData.subcategory)
      }

      // Add images
      imageFiles.forEach((file) => {
        formDataToSend.append("images", file)
      })

      const response = isEditMode && productId
        ? await productAPI.update(productId, formDataToSend)
        : await productAPI.create(formDataToSend)

      if (response.success) {
        router.push("/products")
      } else {
        setError(response.message || `Failed to ${isEditMode ? "update" : "create"} product`)
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "An error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50">
      <main className="flex-1 container max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link href="/products">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Products
            </Button>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            {isEditMode ? "Edit Product" : "Add New Product"}
          </h1>
          <p className="text-muted-foreground mt-2">
            {isEditMode ? "Update product information" : "Create a new product in your catalog"}
          </p>
        </div>

        {fetchingProduct ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
            <span className="ml-2 text-muted-foreground">Loading product data...</span>
          </div>
        ) : (
        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>Enter the basic details of your product</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">
                    Product Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g., Fresh Organic Tomatoes"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Enter product description..."
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">
                      Category <span className="text-red-500">*</span>
                    </Label>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat._id} value={cat._id}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {subcategories.length > 0 && (
                    <div className="space-y-2">
                      <Label htmlFor="subcategory">Subcategory</Label>
                      <Select 
                        value={formData.subcategory || "none"} 
                        onValueChange={(value) => setFormData((prev) => ({ ...prev, subcategory: value === "none" ? "" : value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select subcategory" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          {subcategories.map((subcat) => (
                            <SelectItem key={subcat._id} value={subcat._id}>
                              {subcat.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Pricing & Inventory */}
            <Card>
              <CardHeader>
                <CardTitle>Pricing & Inventory</CardTitle>
                <CardDescription>Set the price and stock information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="originalPrice">
                      Original Price (₹) <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="originalPrice"
                      name="originalPrice"
                      type="number"
                      step="0.01"
                      value={formData.originalPrice}
                      onChange={handleInputChange}
                      placeholder="0.00"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="price">
                      Selling Price (₹) <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="price"
                      name="price"
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={handleInputChange}
                      placeholder="0.00"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="discount">Discount (%)</Label>
                    <Input
                      id="discount"
                      name="discount"
                      type="number"
                      step="0.01"
                      value={formData.discount}
                      onChange={handleInputChange}
                      placeholder="0"
                      disabled
                      className="bg-muted"
                    />
                    <p className="text-xs text-muted-foreground">Auto-calculated</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cost">
                      Total Product Cost (₹)
                    </Label>
                    <Input
                      id="cost"
                      name="cost"
                      type="number"
                      step="0.01"
                      value={formData.cost}
                      onChange={handleInputChange}
                      placeholder="0.00"
                    />
                    <p className="text-xs text-muted-foreground">Cost for profit/loss tracking</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="stock">
                      Stock <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="stock"
                      name="stock"
                      type="number"
                      value={formData.stock}
                      onChange={handleInputChange}
                      placeholder="0"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="minStock">Min Stock</Label>
                    <Input
                      id="minStock"
                      name="minStock"
                      type="number"
                      value={formData.minStock}
                      onChange={handleInputChange}
                      placeholder="5"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="maxStock">Max Stock</Label>
                    <Input
                      id="maxStock"
                      name="maxStock"
                      type="number"
                      value={formData.maxStock}
                      onChange={handleInputChange}
                      placeholder="1000"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Product Details */}
            <Card>
              <CardHeader>
                <CardTitle>Product Details</CardTitle>
                <CardDescription>Additional product information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="sku">SKU</Label>
                    <Input
                      id="sku"
                      name="sku"
                      value={formData.sku}
                      onChange={handleInputChange}
                      placeholder="PROD-001"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="barcode">Barcode</Label>
                    <Input
                      id="barcode"
                      name="barcode"
                      value={formData.barcode}
                      onChange={handleInputChange}
                      placeholder="1234567890123"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="brand">Brand</Label>
                    <Input
                      id="brand"
                      name="brand"
                      value={formData.brand}
                      onChange={handleInputChange}
                      placeholder="Brand name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="weight">Weight</Label>
                    <Input
                      id="weight"
                      name="weight"
                      type="number"
                      step="0.01"
                      value={formData.weight}
                      onChange={handleInputChange}
                      placeholder="1.0"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="unit">Unit</Label>
                    <Select value={formData.unit} onValueChange={(value) => setFormData((prev) => ({ ...prev, unit: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="kg">kg</SelectItem>
                        <SelectItem value="g">g</SelectItem>
                        <SelectItem value="l">l</SelectItem>
                        <SelectItem value="ml">ml</SelectItem>
                        <SelectItem value="pack">pack</SelectItem>
                        <SelectItem value="piece">piece</SelectItem>
                        <SelectItem value="dozen">dozen</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Images */}
            <Card>
              <CardHeader>
                <CardTitle>Product Images</CardTitle>
                <CardDescription>Upload product images (multiple images supported)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="images">Images</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="images"
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageChange}
                      className="cursor-pointer"
                    />
                    <Upload className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>

                {imagePreviews.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative aspect-square rounded-lg overflow-hidden border border-slate-200">
                        <Image src={preview} alt={`Preview ${index + 1}`} fill className="object-cover" unoptimized />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Status */}
            <Card>
              <CardHeader>
                <CardTitle>Status</CardTitle>
                <CardDescription>Control product visibility and features</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="isActive">Active</Label>
                    <p className="text-sm text-muted-foreground">Make this product visible to customers</p>
                  </div>
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, isActive: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="isFeatured">Featured</Label>
                    <p className="text-sm text-muted-foreground">Show this product in featured sections</p>
                  </div>
                  <Switch
                    id="isFeatured"
                    checked={formData.isFeatured}
                    onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, isFeatured: checked }))}
                  />
                </div>
              </CardContent>
            </Card>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 rounded-md p-4">
                {error}
              </div>
            )}

            <div className="flex gap-4 justify-end">
              <Link href="/products">
                <Button type="button" variant="outline" disabled={loading}>
                  Cancel
                </Button>
              </Link>
              <Button type="submit" disabled={loading || fetchingProduct} className="bg-emerald-600 hover:bg-emerald-700">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isEditMode ? "Updating..." : "Creating..."}
                  </>
                ) : (
                  isEditMode ? "Update Product" : "Create Product"
                )}
              </Button>
            </div>
          </div>
        </form>
        )}
      </main>
    </div>
  )
}


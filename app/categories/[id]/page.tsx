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
import { categoryAPI } from "@/lib/api"
import Image from "next/image"

export default function CategoryFormPage() {
  const router = useRouter()
  const params = useParams()
  const categoryId = params?.id as string | undefined
  const isEditMode = categoryId && categoryId !== "new"
  
  const [loading, setLoading] = React.useState(false)
  const [fetchingCategory, setFetchingCategory] = React.useState(isEditMode || false)
  const [parentCategories, setParentCategories] = React.useState<Array<{ _id: string; name: string }>>([])
  const [error, setError] = React.useState("")
  const [imagePreview, setImagePreview] = React.useState<string>("")
  const [imageFile, setImageFile] = React.useState<File | null>(null)
  const [existingImageUrl, setExistingImageUrl] = React.useState<string>("")

  // Form state
  const [formData, setFormData] = React.useState({
    name: "",
    description: "",
    slug: "",
    icon: "",
    parentCategory: "",
    sortOrder: "0",
    isActive: true,
    metaTitle: "",
    metaDescription: "",
  })

  // Fetch category data if in edit mode
  React.useEffect(() => {
    if (isEditMode && categoryId) {
      fetchCategory()
    }
  }, [isEditMode, categoryId])

  // Fetch parent categories on mount
  React.useEffect(() => {
    fetchParentCategories()
  }, [])

  const fetchCategory = async () => {
    if (!categoryId) return
    
    try {
      setFetchingCategory(true)
      const response = await categoryAPI.getById(categoryId)
      
      if (response.success && response.data?.category) {
        const category = response.data.category
        
        // Populate form with category data
        const parentCategoryId = category.parentCategory?._id || category.parentCategory || ""
        setFormData({
          name: category.name || "",
          description: category.description || "",
          slug: category.slug || "",
          icon: category.icon || "",
          parentCategory: parentCategoryId || "none",
          sortOrder: category.sortOrder?.toString() || "0",
          isActive: category.isActive !== undefined ? category.isActive : true,
          metaTitle: category.metaTitle || "",
          metaDescription: category.metaDescription || "",
        })
        // Set existing image URL for preview
        if (category.image) {
          setExistingImageUrl(category.image)
          setImagePreview(category.image)
        }
      }
    } catch (error) {
      console.error("Error fetching category:", error)
      setError("Failed to load category data")
    } finally {
      setFetchingCategory(false)
    }
  }

  const fetchParentCategories = async () => {
    try {
      const response = await categoryAPI.getMain()
      if (response.success && response.data?.categories) {
        setParentCategories(response.data.categories)
      }
    } catch (error) {
      console.error("Error fetching parent categories:", error)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    
    // Auto-generate slug from name if slug is empty or matches the old name
    if (name === "name" && (!formData.slug || formData.slug === formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'))) {
      const autoSlug = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
      setFormData((prev) => ({ ...prev, slug: autoSlug }))
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size should be less than 5MB')
      return
    }

    setImageFile(file)
    setError("")

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const removeImage = () => {
    setImageFile(null)
    setImagePreview("")
    setExistingImageUrl("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const formDataToSend = new FormData()

      // Add all form fields
      formDataToSend.append("name", formData.name)
      if (formData.description) formDataToSend.append("description", formData.description)
      if (formData.slug) formDataToSend.append("slug", formData.slug)
      if (formData.icon) formDataToSend.append("icon", formData.icon)
      if (formData.parentCategory && formData.parentCategory !== "none") {
        formDataToSend.append("parentCategory", formData.parentCategory)
      }
      formDataToSend.append("sortOrder", formData.sortOrder || "0")
      formDataToSend.append("isActive", formData.isActive ? "true" : "false")
      if (formData.metaTitle) formDataToSend.append("metaTitle", formData.metaTitle)
      if (formData.metaDescription) formDataToSend.append("metaDescription", formData.metaDescription)

      // Add image file if uploaded
      if (imageFile) {
        formDataToSend.append("image", imageFile)
      } else if (existingImageUrl && imagePreview && imagePreview === existingImageUrl) {
        // Keep existing image URL if no new file uploaded and preview shows existing image
        formDataToSend.append("image", existingImageUrl)
      }
      // If imagePreview is empty, image will be undefined/empty and backend will handle it

      const response = isEditMode && categoryId
        ? await categoryAPI.update(categoryId, formDataToSend)
        : await categoryAPI.create(formDataToSend)

      if (response.success) {
        router.push("/categories")
      } else {
        setError(response.message || `Failed to ${isEditMode ? "update" : "create"} category`)
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "An error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50">
      <main className="flex-1 container max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link href="/categories">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Categories
            </Button>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            {isEditMode ? "Edit Category" : "Add New Category"}
          </h1>
          <p className="text-muted-foreground mt-2">
            {isEditMode ? "Update category information" : "Create a new category for organizing products"}
          </p>
        </div>

        {fetchingCategory ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
            <span className="ml-2 text-muted-foreground">Loading category data...</span>
          </div>
        ) : (
        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>Enter the basic details of your category</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">
                    Category Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g., Vegetables, Fruits"
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
                    placeholder="Enter category description..."
                    rows={3}
                    maxLength={500}
                  />
                  <p className="text-xs text-muted-foreground">
                    {formData.description.length}/500 characters
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="slug">
                      Slug <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="slug"
                      name="slug"
                      value={formData.slug}
                      onChange={handleInputChange}
                      placeholder="vegetables"
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      URL-friendly identifier (auto-generated from name)
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="parentCategory">Parent Category</Label>
                    <Select 
                      value={formData.parentCategory || "none"} 
                      onValueChange={(value) => setFormData((prev) => ({ ...prev, parentCategory: value === "none" ? "" : value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select parent category (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None (Main Category)</SelectItem>
                        {parentCategories.map((cat) => (
                          <SelectItem key={cat._id} value={cat._id}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      Leave empty to create a main category
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="image">Category Image</Label>
                  <div className="space-y-4">
                    {imagePreview ? (
                      <div className="relative w-full max-w-xs">
                        <div className="relative aspect-video w-full rounded-lg border border-slate-200 overflow-hidden bg-slate-50">
                          <Image
                            src={imagePreview}
                            alt="Category preview"
                            fill
                            className="object-cover"
                          />
                        </div>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="mt-2"
                          onClick={removeImage}
                        >
                          <X className="mr-2 h-4 w-4" />
                          Remove Image
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center w-full">
                        <label
                          htmlFor="image-upload"
                          className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-300 border-dashed rounded-lg cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors"
                        >
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <Upload className="w-8 h-8 mb-2 text-slate-400" />
                            <p className="mb-2 text-sm text-slate-500">
                              <span className="font-semibold">Click to upload</span> or drag and drop
                            </p>
                            <p className="text-xs text-slate-500">
                              PNG, JPG, GIF up to 5MB
                            </p>
                          </div>
                          <input
                            id="image-upload"
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={handleImageChange}
                          />
                        </label>
                      </div>
                    )}
                    {!imagePreview && (
                      <Input
                        id="image-upload-input"
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Upload a category image. Recommended size: 800x600px
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="icon">Icon</Label>
                  <Input
                    id="icon"
                    name="icon"
                    value={formData.icon}
                    onChange={handleInputChange}
                    placeholder="Icon name or emoji"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sortOrder">Sort Order</Label>
                  <Input
                    id="sortOrder"
                    name="sortOrder"
                    type="number"
                    value={formData.sortOrder}
                    onChange={handleInputChange}
                    placeholder="0"
                    min="0"
                  />
                  <p className="text-xs text-muted-foreground">
                    Lower numbers appear first (default: 0)
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* SEO Information */}
            <Card>
              <CardHeader>
                <CardTitle>SEO Information</CardTitle>
                <CardDescription>Optional SEO fields for better search visibility</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="metaTitle">Meta Title</Label>
                  <Input
                    id="metaTitle"
                    name="metaTitle"
                    value={formData.metaTitle}
                    onChange={handleInputChange}
                    placeholder="Category meta title"
                    maxLength={60}
                  />
                  <p className="text-xs text-muted-foreground">
                    {formData.metaTitle.length}/60 characters
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="metaDescription">Meta Description</Label>
                  <Textarea
                    id="metaDescription"
                    name="metaDescription"
                    value={formData.metaDescription}
                    onChange={handleInputChange}
                    placeholder="Category meta description for search engines"
                    rows={3}
                    maxLength={160}
                  />
                  <p className="text-xs text-muted-foreground">
                    {formData.metaDescription.length}/160 characters
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Status */}
            <Card>
              <CardHeader>
                <CardTitle>Status</CardTitle>
                <CardDescription>Control category visibility</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="isActive">Active</Label>
                    <p className="text-sm text-muted-foreground">Make this category visible to customers</p>
                  </div>
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, isActive: checked }))}
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
              <Link href="/categories">
                <Button type="button" variant="outline" disabled={loading}>
                  Cancel
                </Button>
              </Link>
              <Button type="submit" disabled={loading || fetchingCategory} className="bg-emerald-600 hover:bg-emerald-700">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isEditMode ? "Updating..." : "Creating..."}
                  </>
                ) : (
                  isEditMode ? "Update Category" : "Create Category"
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


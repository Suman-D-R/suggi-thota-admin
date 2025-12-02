"use client"

import * as React from "react"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeft, Loader2, Upload, X } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { heroBannerAPI } from "@/lib/api"
import Image from "next/image"

export default function HeroBannerFormPage() {
  const router = useRouter()
  const params = useParams()
  const bannerId = params?.id as string | undefined
  const isEditMode = bannerId && bannerId !== "new"
  
  const [loading, setLoading] = React.useState(false)
  const [fetchingBanner, setFetchingBanner] = React.useState(isEditMode || false)
  const [imagePreview, setImagePreview] = React.useState<string>("")
  const [imageFile, setImageFile] = React.useState<File | null>(null)
  const [error, setError] = React.useState("")

  // Form state
  const [formData, setFormData] = React.useState({
    title: "",
    subtitle: "",
    backgroundColor: "#4CAF50",
    icon: "",
    link: "",
    sortOrder: "0",
    isActive: true,
  })

  // Fetch banner data if in edit mode
  React.useEffect(() => {
    if (isEditMode && bannerId) {
      fetchBanner()
    }
  }, [isEditMode, bannerId])

  const fetchBanner = async () => {
    if (!bannerId) return
    
    try {
      setFetchingBanner(true)
      const response = await heroBannerAPI.getById(bannerId)
      
      if (response.success && response.data?.banner) {
        const banner = response.data.banner
        
        setFormData({
          title: banner.title || "",
          subtitle: banner.subtitle || "",
          backgroundColor: banner.backgroundColor || "#4CAF50",
          icon: banner.icon || "",
          link: banner.link || "",
          sortOrder: banner.sortOrder?.toString() || "0",
          isActive: banner.isActive !== undefined ? banner.isActive : true,
        })

        if (banner.image) {
          setImagePreview(banner.image)
        }
      }
    } catch (error) {
      console.error("Error fetching hero banner:", error)
      setError("Failed to load hero banner data")
    } finally {
      setFetchingBanner(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setImageFile(null)
    setImagePreview("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const formDataToSend = new FormData()
      formDataToSend.append("title", formData.title)
      formDataToSend.append("subtitle", formData.subtitle)
      formDataToSend.append("backgroundColor", formData.backgroundColor)
      if (formData.icon) {
        formDataToSend.append("icon", formData.icon)
      }
      if (formData.link) {
        formDataToSend.append("link", formData.link)
      }
      formDataToSend.append("sortOrder", formData.sortOrder)
      formDataToSend.append("isActive", formData.isActive.toString())

      // Only append image if a new file is selected
      if (imageFile) {
        formDataToSend.append("image", imageFile)
      } else if (!imagePreview && !formData.icon) {
        setError("Either an icon or an image must be provided")
        setLoading(false)
        return
      }

      const response = isEditMode && bannerId
        ? await heroBannerAPI.update(bannerId, formDataToSend)
        : await heroBannerAPI.create(formDataToSend)

      if (response.success) {
        router.push("/hero-banners")
      } else {
        setError(response.message || `Failed to ${isEditMode ? "update" : "create"} hero banner`)
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
          <Link href="/hero-banners">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Hero Banners
            </Button>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            {isEditMode ? "Edit Hero Banner" : "Add New Hero Banner"}
          </h1>
          <p className="text-muted-foreground mt-2">
            {isEditMode ? "Update hero banner information" : "Create a new hero banner for the carousel"}
          </p>
        </div>

        {fetchingBanner ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
            <span className="ml-2 text-muted-foreground">Loading hero banner data...</span>
          </div>
        ) : (
        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>Enter the basic details of your hero banner</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">
                    Title <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="e.g., Fresh Vegetables"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subtitle">
                    Subtitle <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="subtitle"
                    name="subtitle"
                    value={formData.subtitle}
                    onChange={handleInputChange}
                    placeholder="e.g., Get 20% off on all vegetables"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="backgroundColor">Background Color</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="backgroundColor"
                      name="backgroundColor"
                      type="color"
                      value={formData.backgroundColor}
                      onChange={handleInputChange}
                      className="w-20 h-10"
                    />
                    <Input
                      type="text"
                      value={formData.backgroundColor}
                      onChange={handleInputChange}
                      name="backgroundColor"
                      placeholder="#4CAF50"
                      className="flex-1"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="icon">Icon Name (Ionicons)</Label>
                  <Input
                    id="icon"
                    name="icon"
                    value={formData.icon}
                    onChange={handleInputChange}
                    placeholder="e.g., leaf, nutrition, basket"
                  />
                  <p className="text-xs text-muted-foreground">
                    Icon name from Ionicons library. Leave empty if using an image.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="link">Link (Optional)</Label>
                  <Input
                    id="link"
                    name="link"
                    value={formData.link}
                    onChange={handleInputChange}
                    placeholder="e.g., /products/vegetables"
                  />
                  <p className="text-xs text-muted-foreground">
                    Optional link to navigate when banner is clicked.
                  </p>
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
                    Lower numbers appear first in the carousel.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Image */}
            <Card>
              <CardHeader>
                <CardTitle>Banner Image</CardTitle>
                <CardDescription>Upload an image for the hero banner (alternative to icon)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="image">Image</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="cursor-pointer"
                    />
                    <Upload className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Upload an image or use an icon name above. At least one is required.
                  </p>
                </div>

                {imagePreview && (
                  <div className="relative w-full h-48 rounded-lg overflow-hidden border border-slate-200">
                    <Image src={imagePreview} alt="Preview" fill className="object-cover" unoptimized />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Status */}
            <Card>
              <CardHeader>
                <CardTitle>Status</CardTitle>
                <CardDescription>Control the visibility of this hero banner</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="isActive">Active</Label>
                    <p className="text-sm text-muted-foreground">
                      Only active banners are shown in the carousel
                    </p>
                  </div>
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({ ...prev, isActive: checked }))
                    }
                  />
                </div>
              </CardContent>
            </Card>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end gap-4">
              <Link href="/hero-banners">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" disabled={loading} className="bg-emerald-600 hover:bg-emerald-700">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isEditMode ? "Updating..." : "Creating..."}
                  </>
                ) : (
                  isEditMode ? "Update Hero Banner" : "Create Hero Banner"
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


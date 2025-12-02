"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { MoreHorizontal, Search, Image as ImageIcon, Loader2, X, Pencil, Trash2 } from "lucide-react"
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { heroBannerAPI } from "@/lib/api"
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

interface HeroBanner {
  _id: string
  title: string
  subtitle: string
  backgroundColor: string
  icon?: string
  image?: string
  link?: string
  isActive: boolean
  sortOrder: number
  createdAt?: string | Date
  updatedAt?: string | Date
}

export function HeroBannerTable() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = React.useState("")
  const [banners, setBanners] = React.useState<HeroBanner[]>([])
  const [loading, setLoading] = React.useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false)
  const [bannerToDelete, setBannerToDelete] = React.useState<string | null>(null)
  const [deleting, setDeleting] = React.useState(false)

  // Fetch banners on mount
  React.useEffect(() => {
    fetchBanners()
  }, [])

  const fetchBanners = async () => {
    try {
      setLoading(true)
      const response = await heroBannerAPI.getAll(true)
      
      if (response.success && response.data?.banners) {
        const bannersData = Array.isArray(response.data.banners) ? response.data.banners : []
        setBanners(bannersData)
      } else {
        console.error("API response error:", response)
        setBanners([])
      }
    } catch (error: any) {
      console.error("Error fetching hero banners:", error)
      setBanners([])
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!bannerToDelete) return

    try {
      setDeleting(true)
      const response = await heroBannerAPI.delete(bannerToDelete)
      
      if (response.success) {
        setBanners(banners.filter(b => b._id !== bannerToDelete))
        setDeleteDialogOpen(false)
        setBannerToDelete(null)
      } else {
        alert(response.message || "Failed to delete hero banner")
      }
    } catch (error: any) {
      console.error("Error deleting hero banner:", error)
      alert(error.response?.data?.message || "Failed to delete hero banner")
    } finally {
      setDeleting(false)
    }
  }

  const filteredBanners = banners.filter((banner) =>
    banner.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    banner.subtitle.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <Card className="p-8">
        <div className="flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <div className="p-4 border-b">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search hero banners..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Preview</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Subtitle</TableHead>
                <TableHead>Background</TableHead>
                <TableHead>Order</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBanners.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    {searchTerm ? "No banners found matching your search." : "No hero banners found."}
                  </TableCell>
                </TableRow>
              ) : (
                filteredBanners.map((banner) => (
                  <TableRow key={banner._id}>
                    <TableCell>
                      <div
                        className="w-16 h-16 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: banner.backgroundColor }}
                      >
                        {banner.image ? (
                          <img
                            src={banner.image}
                            alt={banner.title}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : banner.icon ? (
                          <ImageIcon className="h-8 w-8 text-white" />
                        ) : (
                          <ImageIcon className="h-8 w-8 text-white opacity-50" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{banner.title}</TableCell>
                    <TableCell className="text-muted-foreground max-w-xs truncate">
                      {banner.subtitle}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-6 h-6 rounded border border-slate-300"
                          style={{ backgroundColor: banner.backgroundColor }}
                        />
                        <span className="text-xs text-muted-foreground">
                          {banner.backgroundColor}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{banner.sortOrder}</TableCell>
                    <TableCell>
                      <Badge variant={banner.isActive ? "default" : "secondary"}>
                        {banner.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem
                            onClick={() => router.push(`/hero-banners/${banner._id}`)}
                          >
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => {
                              setBannerToDelete(banner._id)
                              setDeleteDialogOpen(true)
                            }}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will deactivate the hero banner. You can reactivate it later if needed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
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
    </>
  )
}


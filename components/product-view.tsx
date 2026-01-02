"use client"

import * as React from "react"
import Image from "next/image"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { productAPI } from "@/lib/api"
import { Loader2, Package } from "lucide-react"

interface ProductVariant {
  size: number
  unit: string
  originalPrice?: number
  sellingPrice?: number
  discount?: number
  stock?: number
  isOutOfStock?: boolean
}

interface Product {
  _id: string
  name: string
  originalPrice: number
  sellingPrice: number
  discount?: number
  stock?: number
  unit: string
  size: number
  variants?: ProductVariant[]
  category?: {
    _id: string
    name: string
  }
  images?: string[]
  isActive: boolean
}

interface ProductCardProps {
  product: Product
}

function ProductCard({ product }: ProductCardProps) {
  // Get available variants or use default size/unit
  const variants = product.variants && product.variants.length > 0
    ? product.variants
    : [{ 
        size: product.size, 
        unit: product.unit,
        originalPrice: product.originalPrice,
        sellingPrice: product.sellingPrice,
        discount: product.discount,
        stock: product.stock,
        isOutOfStock: !product.stock || product.stock === 0
      }];

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-200 bg-white">
      {/* Image Container */}
      <div className="relative aspect-square bg-gray-50 rounded-t-lg overflow-hidden border-b border-gray-100">
        {product.images && product.images.length > 0 ? (
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            className="object-contain p-2"
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50">
            <div className="text-center">
              <Package className="w-12 h-12 text-emerald-300 mx-auto mb-1" />
              <span className="text-2xl font-bold text-emerald-400">
                {product.name.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
        )}
        
        {/* Stock Badge - Show total stock or out of stock */}
        {variants.some(v => (v.stock || 0) > 0) ? (
          <Badge className="absolute top-2 right-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold">
            In Stock
          </Badge>
        ) : (
          <Badge variant="destructive" className="absolute top-2 right-2 text-xs font-semibold">
            Out of Stock
          </Badge>
        )}
      </div>

      {/* Product Info */}
      <div className="p-3 space-y-2">
        {/* Product Name */}
        <h3 className="font-medium text-sm text-gray-900 line-clamp-2 min-h-[2.5rem] leading-tight">
          {product.name}
        </h3>

        {/* Variants List */}
        <div className="space-y-2">
          {variants.map((variant, index) => {
            const variantStock = typeof variant.stock === 'number' && !isNaN(variant.stock) ? variant.stock : 0
            const variantSellingPrice = typeof variant.sellingPrice === 'number' && !isNaN(variant.sellingPrice) ? variant.sellingPrice : 0
            const variantOriginalPrice = typeof variant.originalPrice === 'number' && !isNaN(variant.originalPrice) ? variant.originalPrice : 0
            const variantDiscount = typeof variant.discount === 'number' && !isNaN(variant.discount) ? variant.discount : 0
            const isOutOfStock = variant.isOutOfStock || variantStock === 0

            return (
              <div 
                key={index} 
                className={`p-2 rounded-lg border ${
                  isOutOfStock 
                    ? 'bg-gray-50 border-gray-200 opacity-60' 
                    : 'bg-emerald-50/30 border-emerald-100'
                }`}
              >
                {/* Variant Size/Unit */}
                <div className="flex items-center justify-between mb-1">
                  <div className="inline-flex items-center px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 text-xs font-medium">
                    {variant.size} {variant.unit}
                  </div>
                  {isOutOfStock && (
                    <Badge variant="destructive" className="text-xs">
                      Out of Stock
                    </Badge>
                  )}
                  {!isOutOfStock && variantStock > 0 && (
                    <Badge className="bg-emerald-500 text-white text-xs">
                      {variantStock} available
                    </Badge>
                  )}
                </div>

                {/* Variant Price */}
                {variantSellingPrice > 0 ? (
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-gray-900">
                      ₹{Math.round(variantSellingPrice)}
                    </span>
                    {variantDiscount > 0 && variantOriginalPrice > 0 && (
                      <>
                        <span className="text-xs text-gray-500 line-through">
                          ₹{Math.round(variantOriginalPrice)}
                        </span>
                        <Badge variant="secondary" className="text-xs">
                          {Math.round(variantDiscount)}% OFF
                        </Badge>
                      </>
                    )}
                  </div>
                ) : (
                  <span className="text-xs text-gray-400">No price set</span>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </Card>
  )
}

export function ProductView() {
  const [products, setProducts] = React.useState<Product[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await productAPI.getAll({
        limit: 12,
        isActive: true,
      })

      if (response.success && response.data) {
        setProducts(response.data)
      } else {
        setError("Failed to load products")
      }
    } catch (err: any) {
      console.error("Error fetching products:", err)
      setError(err.message || "Failed to load products")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card className="p-8">
        <div className="flex items-center justify-center gap-2 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Loading products...</span>
        </div>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="p-8">
        <div className="text-center text-destructive">
          <p className="font-medium">Error loading products</p>
          <p className="text-sm text-muted-foreground mt-1">{error}</p>
        </div>
      </Card>
    )
  }

  if (products.length === 0) {
    return (
      <Card className="p-8">
        <div className="text-center text-muted-foreground">
          <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p>No products found</p>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Product View
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            How products appear to customers in the app
          </p>
        </div>
        <Badge variant="outline" className="text-sm">
          {products.length} products
        </Badge>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {products.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </div>
  )
}


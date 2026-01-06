'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2, Search, Package, Image as ImageIcon } from 'lucide-react';
import { storeProductAPI } from '@/lib/api';
import Image from 'next/image';

interface StoreProductVariant {
  sku: string;
  size: number;
  unit: 'kg' | 'g' | 'ml' | 'liter' | 'piece' | 'pack';
  mrp: number;
  sellingPrice: number;
  discount: number;
  isAvailable: boolean;
}

interface StoreProduct {
  _id: string;
  productId: {
    _id: string;
    name: string;
    images?: string[];
    description?: string;
  };
  variants: StoreProductVariant[];
  isActive: boolean;
}

interface StoreProductsListProps {
  storeId: string;
}

export function StoreProductsList({ storeId }: StoreProductsListProps) {
  const [storeProducts, setStoreProducts] = useState<StoreProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadStoreProducts();
  }, [storeId]);

  const loadStoreProducts = async () => {
    try {
      setLoading(true);
      const response = await storeProductAPI.getByStore(storeId);
      
      // Handle different response structures
      // Backend returns: { success: true, data: { storeProducts: [...] } } or { success: true, data: [...] }
      let products = [];

      if (response.success && response.data) {
        // Check if data is an array directly
        if (Array.isArray(response.data)) {
          products = response.data;
        }
        // Check if data has storeProducts property
        else if (
          response.data.storeProducts &&
          Array.isArray(response.data.storeProducts)
        ) {
          products = response.data.storeProducts;
        }
        // Check if data has data property (nested)
        else if (response.data.data && Array.isArray(response.data.data)) {
          products = response.data.data;
        }
      } else if (Array.isArray(response)) {
        // Direct array response
        products = response;
      }

      const productsData = Array.isArray(products) ? products : [];
      setStoreProducts(productsData);
    } catch (error) {
      console.error('Failed to load store products:', error);
      setStoreProducts([]); // Ensure it's always an array even on error
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = Array.isArray(storeProducts)
    ? storeProducts.filter((sp) =>
        sp.productId?.name?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const getTotalVariants = (product: StoreProduct) => {
    return product.variants.length;
  };

  const getAvailableVariants = (product: StoreProduct) => {
    return product.variants.filter((v) => v.isAvailable).length;
  };

  const getPriceRange = (product: StoreProduct) => {
    if (product.variants.length === 0) return 'N/A';
    const prices = product.variants
      .filter((v) => v.isAvailable)
      .map((v) => v.sellingPrice);
    if (prices.length === 0) return 'Out of Stock';
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    if (min === max) return `₹${min.toFixed(2)}`;
    return `₹${min.toFixed(2)} - ₹${max.toFixed(2)}`;
  };

  return (
    <div className='space-y-6'>
      <Card>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <div>
              <CardTitle>All Products</CardTitle>
              <CardDescription>
                View all products available in this store
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className='mb-6'>
            <div className='relative'>
              <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400' />
              <Input
                placeholder='Search products...'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className='pl-10'
              />
            </div>
          </div>

          {loading ? (
            <div className='flex items-center justify-center py-12'>
              <Loader2 className='h-8 w-8 animate-spin text-emerald-600' />
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className='text-center py-12'>
              <Package className='h-12 w-12 text-slate-400 mx-auto mb-4' />
              <p className='text-slate-500'>
                {searchQuery
                  ? 'No products found matching your search'
                  : 'No products available in this store'}
              </p>
            </div>
          ) : (
            <div className='rounded-md border'>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Variants</TableHead>
                    <TableHead>Price Range</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((storeProduct) => {
                    // Safety check for productId
                    if (!storeProduct.productId) {
                      return null;
                    }
                    
                    return (
                      <TableRow key={storeProduct._id}>
                        <TableCell>
                          <div className='flex items-center gap-3'>
                            <div className='relative w-12 h-12 rounded-md overflow-hidden bg-slate-100 flex items-center justify-center'>
                              {storeProduct.productId.images &&
                              storeProduct.productId.images.length > 0 ? (
                                <Image
                                  src={storeProduct.productId.images[0]}
                                  alt={storeProduct.productId.name || 'Product'}
                                  fill
                                  className='object-cover'
                                />
                              ) : (
                                <ImageIcon className='h-6 w-6 text-slate-400' />
                              )}
                            </div>
                            <div>
                              <div className='font-medium'>
                                {storeProduct.productId.name || 'Unknown Product'}
                              </div>
                              {storeProduct.productId.description && (
                                <div className='text-sm text-slate-500 line-clamp-1'>
                                  {storeProduct.productId.description}
                                </div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                      <TableCell>
                        <div className='space-y-1'>
                          <div className='text-sm font-medium'>
                            {getAvailableVariants(storeProduct)} /{' '}
                            {getTotalVariants(storeProduct)} Available
                          </div>
                          <div className='text-xs text-slate-500'>
                            {storeProduct.variants
                              .slice(0, 2)
                              .map((v) => `${v.size}${v.unit}`)
                              .join(', ')}
                            {storeProduct.variants.length > 2 && '...'}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className='font-medium'>{getPriceRange(storeProduct)}</div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            storeProduct.isActive ? 'default' : 'secondary'
                          }
                        >
                          {storeProduct.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


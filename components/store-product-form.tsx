'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, Loader2 } from 'lucide-react';
import { storeProductAPI, storeAPI, productAPI } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

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
  storeId: {
    _id: string;
    name: string;
  };
  productId: {
    _id: string;
    name: string;
  };
  variants: StoreProductVariant[];
  isActive: boolean;
  isFeatured?: boolean;
}

interface Store {
  _id: string;
  name: string;
}

interface Product {
  _id: string;
  name: string;
}

interface StoreProductFormProps {
  storeProduct?: StoreProduct | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export function StoreProductForm({
  storeProduct,
  onSuccess,
  onCancel,
}: StoreProductFormProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [stores, setStores] = useState<Store[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingStores, setLoadingStores] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);

  const [formData, setFormData] = useState({
    storeId: storeProduct?.storeId?._id || '',
    productId: storeProduct?.productId?._id || '',
    variants: (storeProduct?.variants || []) as StoreProductVariant[],
    isActive: storeProduct?.isActive !== undefined ? storeProduct.isActive : true,
    isFeatured: storeProduct?.isFeatured !== undefined ? storeProduct.isFeatured : false,
  });

  useEffect(() => {
    loadStores();
    loadProducts();
  }, []);

  const loadStores = async () => {
    try {
      setLoadingStores(true);
      const response = await storeAPI.getAll();
      if (response.success && response.data) {
        setStores(Array.isArray(response.data) ? response.data : []);
      }
    } catch (error) {
      console.error('Failed to load stores:', error);
      toast({
        title: 'Error',
        description: 'Failed to load stores',
        variant: 'destructive',
      });
    } finally {
      setLoadingStores(false);
    }
  };

  const loadProducts = async () => {
    try {
      setLoadingProducts(true);
      const response = await productAPI.getAll({ isActive: true });
      if (response.success && response.data) {
        setProducts(Array.isArray(response.data) ? response.data : []);
      }
    } catch (error) {
      console.error('Failed to load products:', error);
      toast({
        title: 'Error',
        description: 'Failed to load products',
        variant: 'destructive',
      });
    } finally {
      setLoadingProducts(false);
    }
  };

  const handleProductSelect = (productId: string) => {
    setFormData({
      ...formData,
      productId,
      // Reset variants when product changes (unless editing)
      variants: storeProduct ? formData.variants : [],
    });
  };

  const handleAddVariant = () => {
    const newVariant: StoreProductVariant = {
      sku: '',
      size: 0,
      unit: 'kg',
      mrp: 0,
      sellingPrice: 0,
      discount: 0,
      isAvailable: true,
    };
    setFormData({
      ...formData,
      variants: [...formData.variants, newVariant],
    });
  };

  const handleRemoveVariant = (index: number) => {
    const newVariants = formData.variants.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      variants: newVariants,
    });
  };

  const handleVariantChange = (
    index: number,
    field: keyof StoreProductVariant,
    value: any
  ) => {
    const newVariants = [...formData.variants];
    const variant = { ...newVariants[index] };

    if (field === 'mrp' || field === 'sellingPrice') {
      const numValue = typeof value === 'string' ? parseFloat(value) || 0 : value;
      variant[field] = numValue;
      
      // Auto-calculate discount
      if (variant.mrp > 0 && variant.sellingPrice > 0) {
        variant.discount = ((variant.mrp - variant.sellingPrice) / variant.mrp) * 100;
      } else {
        variant.discount = 0;
      }
    } else {
      (variant as any)[field] = value;
    }

    newVariants[index] = variant;
    setFormData({
      ...formData,
      variants: newVariants,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.storeId) {
      toast({
        title: 'Validation Error',
        description: 'Please select a store',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.productId) {
      toast({
        title: 'Validation Error',
        description: 'Please select a product',
        variant: 'destructive',
      });
      return;
    }

    if (formData.variants.length === 0) {
      toast({
        title: 'Validation Error',
        description: 'Please add at least one variant',
        variant: 'destructive',
      });
      return;
    }

    // Validate all variants
    for (const variant of formData.variants) {
      if (
        !variant.sku ||
        variant.size <= 0 ||
        variant.mrp <= 0 ||
        variant.sellingPrice <= 0
      ) {
        toast({
          title: 'Validation Error',
          description: 'Please fill in all required fields for all variants',
          variant: 'destructive',
        });
        return;
      }
    }

    try {
      setLoading(true);
      if (storeProduct) {
        // Update existing store product
        await storeProductAPI.update(storeProduct._id, {
          variants: formData.variants,
          isActive: formData.isActive,
          isFeatured: formData.isFeatured,
        });
        toast({
          title: 'Success',
          description: 'Store product updated successfully',
        });
      } else {
        // Check if store product already exists for this product and store
        try {
          const existingResponse = await storeProductAPI.getAll({
            storeId: formData.storeId,
            productId: formData.productId,
          });
          
          if (
            existingResponse.success &&
            existingResponse.data &&
            Array.isArray(existingResponse.data) &&
            existingResponse.data.length > 0
          ) {
            toast({
              title: 'Product Already Exists',
              description: 'This product already exists for this store. Please edit the existing product instead.',
              variant: 'destructive',
            });
            setLoading(false);
            return;
          }
        } catch (checkError) {
          // If check fails, continue with creation attempt
          console.warn('Failed to check existing store products:', checkError);
        }

        // Create new store product
        await storeProductAPI.create({
          storeId: formData.storeId,
          productId: formData.productId,
          variants: formData.variants,
          isActive: formData.isActive,
          isFeatured: formData.isFeatured,
        });
        toast({
          title: 'Success',
          description: 'Store product created successfully',
        });
      }
      onSuccess();
    } catch (error: any) {
      console.error('Failed to save store product:', error);
      let errorMessage = 'Failed to save store product. Please try again.';
      
      if (error?.response) {
        // Handle HTTP error responses
        if (error.response.status === 409) {
          errorMessage =
            error.response.data?.message ||
            'This product already exists for this store. Please edit the existing product instead.';
        } else {
          errorMessage =
            error.response.data?.message ||
            error.response.data?.error ||
            `Request failed with status ${error.response.status}`;
        }
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className='space-y-6'>
      <div className='space-y-4'>
        {/* Store Selection */}
        <div className='space-y-2'>
          <Label htmlFor='store'>Store *</Label>
          <Select
            value={formData.storeId}
            onValueChange={(value) =>
              setFormData({ ...formData, storeId: value })
            }
            disabled={!!storeProduct || loadingStores}
          >
            <SelectTrigger>
              <SelectValue placeholder='Select a store' />
            </SelectTrigger>
            <SelectContent>
              {loadingStores ? (
                <SelectItem value='loading' disabled>
                  Loading stores...
                </SelectItem>
              ) : stores.length === 0 ? (
                <SelectItem value='none' disabled>
                  No stores available
                </SelectItem>
              ) : (
                stores.map((store) => (
                  <SelectItem key={store._id} value={store._id}>
                    {store.name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>

        {/* Product Selection */}
        <div className='space-y-2'>
          <Label htmlFor='product'>Product *</Label>
          <Select
            value={formData.productId}
            onValueChange={handleProductSelect}
            disabled={!!storeProduct || loadingProducts}
          >
            <SelectTrigger>
              <SelectValue placeholder='Select a product' />
            </SelectTrigger>
            <SelectContent>
              {loadingProducts ? (
                <SelectItem value='loading' disabled>
                  Loading products...
                </SelectItem>
              ) : products.length === 0 ? (
                <SelectItem value='none' disabled>
                  No products available
                </SelectItem>
              ) : (
                products.map((product) => (
                  <SelectItem key={product._id} value={product._id}>
                    {product.name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>

        {/* Variants Section */}
        {formData.productId && (
          <div className='space-y-4'>
            <div className='flex items-center justify-between'>
              <Label>Variants *</Label>
              <Button
                type='button'
                variant='outline'
                size='sm'
                onClick={handleAddVariant}
              >
                <Plus className='mr-2 h-4 w-4' />
                Add Variant
              </Button>
            </div>

            {formData.variants.length === 0 ? (
              <div className='p-4 border border-dashed border-slate-200 rounded-lg text-center'>
                <p className='text-sm text-muted-foreground mb-2'>
                  No variants added yet
                </p>
                <p className='text-xs text-muted-foreground'>
                  Click "Add Variant" to create a variant for this product
                </p>
              </div>
            ) : (
              <div className='space-y-4'>
                {formData.variants.map((variant, index) => (
                  <Card key={index} className='p-4'>
                    <div className='flex items-start justify-between mb-4'>
                      <h4 className='font-medium text-sm'>
                        Variant {index + 1}
                      </h4>
                      <Button
                        type='button'
                        variant='ghost'
                        size='sm'
                        onClick={() => handleRemoveVariant(index)}
                        disabled={formData.variants.length === 1}
                      >
                        <Trash2 className='h-4 w-4 text-red-500' />
                      </Button>
                    </div>
                    <div className='grid grid-cols-2 md:grid-cols-3 gap-4'>
                      <div className='space-y-2'>
                        <Label>SKU *</Label>
                        <Input
                          value={variant.sku}
                          onChange={(e) =>
                            handleVariantChange(index, 'sku', e.target.value)
                          }
                          placeholder='e.g., RICE-1KG'
                          required
                        />
                      </div>
                      <div className='space-y-2'>
                        <Label>Size *</Label>
                        <Input
                          type='number'
                          step='0.01'
                          value={variant.size || ''}
                          onChange={(e) =>
                            handleVariantChange(
                              index,
                              'size',
                              parseFloat(e.target.value) || 0
                            )
                          }
                          placeholder='1'
                          required
                          min='0'
                        />
                      </div>
                      <div className='space-y-2'>
                        <Label>Unit *</Label>
                        <Select
                          value={variant.unit}
                          onValueChange={(value) =>
                            handleVariantChange(
                              index,
                              'unit',
                              value as StoreProductVariant['unit']
                            )
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value='kg'>kg</SelectItem>
                            <SelectItem value='g'>g</SelectItem>
                            <SelectItem value='ml'>ml</SelectItem>
                            <SelectItem value='liter'>liter</SelectItem>
                            <SelectItem value='piece'>piece</SelectItem>
                            <SelectItem value='pack'>pack</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className='space-y-2'>
                        <Label>MRP (₹) *</Label>
                        <Input
                          type='number'
                          step='0.01'
                          min='0'
                          value={variant.mrp > 0 ? String(variant.mrp) : ''}
                          onChange={(e) => {
                            const value = e.target.value.trim();
                            if (value === '' || value === '.') {
                              handleVariantChange(index, 'mrp', 0);
                              return;
                            }
                            const mrp = parseFloat(value);
                            if (!isNaN(mrp) && mrp >= 0) {
                              handleVariantChange(index, 'mrp', mrp);
                            }
                          }}
                          placeholder='120'
                          required
                        />
                      </div>
                      <div className='space-y-2'>
                        <Label>Selling Price (₹) *</Label>
                        <Input
                          type='number'
                          step='0.01'
                          min='0'
                          value={
                            variant.sellingPrice > 0
                              ? String(variant.sellingPrice)
                              : ''
                          }
                          onChange={(e) => {
                            const value = e.target.value.trim();
                            if (value === '' || value === '.') {
                              handleVariantChange(index, 'sellingPrice', 0);
                              return;
                            }
                            const sellingPrice = parseFloat(value);
                            if (!isNaN(sellingPrice) && sellingPrice >= 0) {
                              handleVariantChange(index, 'sellingPrice', sellingPrice);
                            }
                          }}
                          placeholder='108'
                          required
                        />
                      </div>
                      <div className='space-y-2'>
                        <Label>Discount (%)</Label>
                        <Input
                          type='number'
                          step='0.01'
                          value={variant.discount.toFixed(2)}
                          disabled
                          className='bg-slate-50'
                        />
                      </div>
                    </div>
                    <div className='mt-4 flex items-center space-x-2'>
                      <input
                        type='checkbox'
                        id={`available-${index}`}
                        checked={variant.isAvailable}
                        onChange={(e) =>
                          handleVariantChange(index, 'isAvailable', e.target.checked)
                        }
                        className='h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500'
                      />
                      <Label
                        htmlFor={`available-${index}`}
                        className='text-sm font-normal cursor-pointer'
                      >
                        Available
                      </Label>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Active Status and Featured */}
        <div className='flex items-center gap-6'>
          <div className='flex items-center space-x-2'>
            <input
              type='checkbox'
              id='isActive'
              checked={formData.isActive}
              onChange={(e) =>
                setFormData({ ...formData, isActive: e.target.checked })
              }
              className='h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500'
            />
            <Label htmlFor='isActive' className='text-sm font-normal cursor-pointer'>
              Active
            </Label>
          </div>
          <div className='flex items-center space-x-2'>
            <input
              type='checkbox'
              id='isFeatured'
              checked={formData.isFeatured}
              onChange={(e) =>
                setFormData({ ...formData, isFeatured: e.target.checked })
              }
              className='h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500'
            />
            <Label htmlFor='isFeatured' className='text-sm font-normal cursor-pointer'>
              Featured
            </Label>
          </div>
        </div>
      </div>

      <div className='flex justify-end gap-3 pt-4 border-t'>
        <Button
          type='button'
          variant='outline'
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          type='submit'
          disabled={
            loading ||
            !formData.storeId ||
            !formData.productId ||
            formData.variants.length === 0
          }
          className='bg-emerald-600 hover:bg-emerald-700'
        >
          {loading ? (
            <>
              <Loader2 className='mr-2 h-4 w-4 animate-spin' />
              Saving...
            </>
          ) : storeProduct ? (
            'Update'
          ) : (
            'Create'
          )}
        </Button>
      </div>
    </form>
  );
}


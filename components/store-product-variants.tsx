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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
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
import { Plus, Edit, Trash2, Loader2, AlertTriangle } from 'lucide-react';
import { productAPI, storeProductAPI } from '@/lib/api';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface Product {
  _id: string;
  name: string;
  variants?: Array<{ sku: string; size: number; unit: string }>;
}

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
  };
  variants: StoreProductVariant[];
  isActive: boolean;
}

interface StoreProductVariantsProps {
  storeId: string;
}

export function StoreProductVariants({ storeId }: StoreProductVariantsProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [storeProducts, setStoreProducts] = useState<StoreProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [storeProductToDelete, setStoreProductToDelete] = useState<
    string | null
  >(null);
  const [editingStoreProduct, setEditingStoreProduct] =
    useState<StoreProduct | null>(null);

  const [formData, setFormData] = useState({
    productId: '',
    variants: [] as Array<{
      sku: string;
      size: number;
      unit: 'kg' | 'g' | 'ml' | 'liter' | 'piece' | 'pack';
      mrp: number;
      sellingPrice: number;
      discount: number;
      isAvailable: boolean;
    }>,
    isActive: true,
  });

  useEffect(() => {
    loadProducts();
    loadStoreProducts();
  }, [storeId]);

  const loadProducts = async () => {
    try {
      const response = await productAPI.getAll({ isActive: true });
      setProducts(response.data || []);
    } catch (error) {
      console.error('Failed to load products:', error);
    }
  };

  const loadStoreProducts = async () => {
    try {
      setLoading(true);
      const response = await storeProductAPI.getByStore(storeId);
      // Handle different response structures
      const products =
        response.data?.storeProducts ||
        response.storeProducts ||
        response.data ||
        [];
      setStoreProducts(Array.isArray(products) ? products : []);
    } catch (error) {
      console.error('Failed to load store products:', error);
      setStoreProducts([]); // Ensure it's always an array even on error
    } finally {
      setLoading(false);
    }
  };

  const handleAddVariant = () => {
    setFormData({
      ...formData,
      variants: [
        ...formData.variants,
        {
          sku: '',
          size: 0,
          unit: 'kg',
          mrp: 0,
          sellingPrice: 0,
          discount: 0,
          isAvailable: true,
        },
      ],
    });
  };

  const handleVariantChange = (index: number, field: string, value: any) => {
    const newVariants = [...formData.variants];
    newVariants[index] = { ...newVariants[index], [field]: value };
    setFormData({ ...formData, variants: newVariants });
  };

  const handleRemoveVariant = (index: number) => {
    const newVariants = formData.variants.filter((_, i) => i !== index);
    setFormData({ ...formData, variants: newVariants });
  };

  const handleProductSelect = (productId: string) => {
    const product = products.find((p) => p._id === productId);
    if (product && product.variants && product.variants.length > 0) {
      // Pre-populate variants from product
      const initialVariants = product.variants.map((v) => ({
        sku: v.sku,
        size: v.size,
        unit: v.unit as 'kg' | 'g' | 'ml' | 'liter' | 'piece' | 'pack',
        mrp: 0,
        sellingPrice: 0,
        discount: 0,
        isAvailable: true,
      }));
      setFormData({ ...formData, productId, variants: initialVariants });
    } else {
      setFormData({ ...formData, productId, variants: [] });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.productId || formData.variants.length === 0) {
      return;
    }

    // Validate variants
    for (const variant of formData.variants) {
      if (
        !variant.sku ||
        variant.size <= 0 ||
        variant.mrp <= 0 ||
        variant.sellingPrice <= 0
      ) {
        alert('Please fill in all required fields for all variants');
        return;
      }
    }

    try {
      setLoading(true);
      if (editingStoreProduct) {
        await storeProductAPI.update(editingStoreProduct._id, {
          variants: formData.variants,
          isActive: formData.isActive,
        });
      } else {
        // Check if store product already exists for this product
        const existingStoreProducts = storeProducts.filter(
          (sp) => sp.productId._id === formData.productId
        );
        if (existingStoreProducts.length > 0) {
          alert(
            'This product already exists for this store. Please edit the existing product instead.'
          );
          setLoading(false);
          return;
        }

        await storeProductAPI.create({
          storeId,
          productId: formData.productId,
          variants: formData.variants,
          isActive: formData.isActive,
        });
      }
      setDialogOpen(false);
      setEditingStoreProduct(null);
      setFormData({
        productId: '',
        variants: [],
        isActive: true,
      });
      loadStoreProducts();
    } catch (error: any) {
      console.error('Failed to save store product:', error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to save store product. Please try again.';
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (storeProduct: StoreProduct) => {
    setEditingStoreProduct(storeProduct);
    setFormData({
      productId: storeProduct.productId._id,
      variants: storeProduct.variants,
      isActive: storeProduct.isActive,
    });
    setDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!storeProductToDelete) return;
    try {
      await storeProductAPI.delete(storeProductToDelete);
      setDeleteDialogOpen(false);
      setStoreProductToDelete(null);
      loadStoreProducts();
    } catch (error) {
      console.error('Failed to delete store product:', error);
    }
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setEditingStoreProduct(null);
    setFormData({
      productId: '',
      variants: [],
      isActive: true,
    });
  };

  const lowStockProducts = Array.isArray(storeProducts)
    ? storeProducts.filter((sp) => {
        // Calculate total stock from variants (this would need to come from inventory batches)
        return false; // Placeholder - would need inventory data
      })
    : [];

  return (
    <div className='space-y-6'>
      {lowStockProducts.length > 0 && (
        <Card className='border-orange-200 bg-orange-50'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2 text-orange-700'>
              <AlertTriangle className='h-5 w-5' />
              Low Stock Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className='text-sm text-orange-700'>
              Some products are running low on stock
            </p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <div>
              <CardTitle>Store Product Variants</CardTitle>
              <CardDescription>
                Create and manage product variants with pricing for this store
              </CardDescription>
            </div>
            <Dialog open={dialogOpen} onOpenChange={handleDialogClose}>
              <DialogTrigger asChild>
                <Button
                  onClick={() => {
                    setEditingStoreProduct(null);
                    setFormData({
                      productId: '',
                      variants: [],
                      isActive: true,
                    });
                  }}
                >
                  <Plus className='mr-2 h-4 w-4' />
                  Add Product Variants
                </Button>
              </DialogTrigger>
              <DialogContent className='max-w-3xl max-h-[90vh] overflow-y-auto'>
                <DialogHeader>
                  <DialogTitle>
                    {editingStoreProduct
                      ? 'Edit Product Variants'
                      : 'Add Product Variants'}
                  </DialogTitle>
                  <DialogDescription>
                    Select a product and configure its variants with pricing for
                    this store
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                  <div className='space-y-4 py-4'>
                    <div className='space-y-2'>
                      <Label htmlFor='product'>Product *</Label>
                      <Select
                        value={formData.productId}
                        onValueChange={handleProductSelect}
                        disabled={!!editingStoreProduct}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder='Select a product' />
                        </SelectTrigger>
                        <SelectContent>
                          {products.map((product) => (
                            <SelectItem key={product._id} value={product._id}>
                              {product.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

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
                          <p className='text-sm text-muted-foreground'>
                            Click "Add Variant" to create a variant for this
                            product
                          </p>
                        ) : (
                          <div className='space-y-4'>
                            {formData.variants.map((variant, index) => (
                              <Card key={index} className='p-4'>
                                <div className='flex items-start justify-between mb-4'>
                                  <h4 className='font-medium'>
                                    Variant {index + 1}
                                  </h4>
                                  <Button
                                    type='button'
                                    variant='ghost'
                                    size='sm'
                                    onClick={() => handleRemoveVariant(index)}
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
                                        handleVariantChange(
                                          index,
                                          'sku',
                                          e.target.value
                                        )
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
                                          value as
                                            | 'kg'
                                            | 'g'
                                            | 'ml'
                                            | 'liter'
                                            | 'piece'
                                            | 'pack'
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
                                        <SelectItem value='liter'>
                                          liter
                                        </SelectItem>
                                        <SelectItem value='piece'>
                                          piece
                                        </SelectItem>
                                        <SelectItem value='pack'>
                                          pack
                                        </SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div className='space-y-2'>
                                    <Label>MRP (₹) *</Label>
                                    <Input
                                      type='number'
                                      step='0.01'
                                      min='0'
                                      value={
                                        variant.mrp > 0
                                          ? String(variant.mrp)
                                          : ''
                                      }
                                      onChange={(e) => {
                                        const value = e.target.value.trim();
                                        // Allow empty string while typing
                                        if (value === '' || value === '.') {
                                          const newVariants = [
                                            ...formData.variants,
                                          ];
                                          const currentVariant =
                                            newVariants[index];
                                          const sellingPrice =
                                            currentVariant.sellingPrice || 0;
                                          newVariants[index] = {
                                            ...currentVariant,
                                            mrp: 0,
                                            discount: 0,
                                          };
                                          setFormData({
                                            ...formData,
                                            variants: newVariants,
                                          });
                                          return;
                                        }
                                        const mrp = parseFloat(value);
                                        if (!isNaN(mrp) && mrp >= 0) {
                                          const newVariants = [
                                            ...formData.variants,
                                          ];
                                          const currentVariant =
                                            newVariants[index];
                                          const sellingPrice =
                                            currentVariant.sellingPrice || 0;
                                          // Recalculate discount if selling price exists
                                          const discount =
                                            mrp > 0 && sellingPrice > 0
                                              ? ((mrp - sellingPrice) / mrp) *
                                                100
                                              : 0;
                                          newVariants[index] = {
                                            ...currentVariant,
                                            mrp: mrp,
                                            discount: Math.max(0, discount),
                                          };
                                          setFormData({
                                            ...formData,
                                            variants: newVariants,
                                          });
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
                                        // Allow empty string while typing
                                        if (value === '' || value === '.') {
                                          const newVariants = [
                                            ...formData.variants,
                                          ];
                                          newVariants[index] = {
                                            ...newVariants[index],
                                            sellingPrice: 0,
                                            discount: 0,
                                          };
                                          setFormData({
                                            ...formData,
                                            variants: newVariants,
                                          });
                                          return;
                                        }
                                        const sellingPrice = parseFloat(value);
                                        if (
                                          !isNaN(sellingPrice) &&
                                          sellingPrice >= 0
                                        ) {
                                          const currentVariant =
                                            formData.variants[index];
                                          const mrp = currentVariant.mrp || 0;
                                          const discount =
                                            mrp > 0
                                              ? ((mrp - sellingPrice) / mrp) *
                                                100
                                              : 0;
                                          const newVariants = [
                                            ...formData.variants,
                                          ];
                                          newVariants[index] = {
                                            ...newVariants[index],
                                            sellingPrice: sellingPrice,
                                            discount: Math.max(0, discount),
                                          };
                                          setFormData({
                                            ...formData,
                                            variants: newVariants,
                                          });
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
                              </Card>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <DialogFooter>
                    <Button
                      type='button'
                      variant='outline'
                      onClick={handleDialogClose}
                      disabled={loading}
                    >
                      Cancel
                    </Button>
                    <Button
                      type='submit'
                      disabled={
                        loading ||
                        !formData.productId ||
                        formData.variants.length === 0
                      }
                    >
                      {loading ? (
                        <>
                          <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                          Saving...
                        </>
                      ) : editingStoreProduct ? (
                        'Update'
                      ) : (
                        'Create'
                      )}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className='flex items-center justify-center py-8'>
              <Loader2 className='h-6 w-6 animate-spin text-emerald-600' />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Variants</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className='text-right'>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {storeProducts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className='text-center py-12'>
                      <div className='flex flex-col items-center gap-4'>
                        <p className='text-slate-500'>
                          No product variants found.
                        </p>
                        <Button
                          onClick={() => {
                            setEditingStoreProduct(null);
                            setFormData({
                              productId: '',
                              variants: [],
                              isActive: true,
                            });
                            setDialogOpen(true);
                          }}
                          className='bg-emerald-600 hover:bg-emerald-700'
                        >
                          <Plus className='mr-2 h-4 w-4' />
                          Add Your First Product Variants
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  storeProducts.map((sp) => (
                    <TableRow key={sp._id}>
                      <TableCell className='font-medium'>
                        {sp.productId.name}
                      </TableCell>
                      <TableCell>
                        <div className='flex flex-wrap gap-2'>
                          {sp.variants.map((variant, idx) => (
                            <Badge key={idx} variant='outline'>
                              {variant.sku} - ₹{variant.sellingPrice}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={sp.isActive ? 'default' : 'secondary'}>
                          {sp.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell className='text-right'>
                        <div className='flex justify-end gap-2'>
                          <Button
                            variant='ghost'
                            size='sm'
                            onClick={() => handleEdit(sp)}
                          >
                            <Edit className='h-4 w-4' />
                          </Button>
                          <Button
                            variant='ghost'
                            size='sm'
                            onClick={() => {
                              setStoreProductToDelete(sp._id);
                              setDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className='h-4 w-4 text-red-500' />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              store product and all its variants.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className='bg-red-600 hover:bg-red-700'
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

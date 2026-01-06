'use client';

import * as React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Loader2, Upload, X } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { productAPI, categoryAPI, storeAPI, storeProductAPI } from '@/lib/api';
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Plus, Edit, Trash2, Store } from 'lucide-react';
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

export default function ProductFormPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params?.id as string | undefined;
  const isEditMode = productId && productId !== 'new';

  const [loading, setLoading] = React.useState(false);
  const [fetchingProduct, setFetchingProduct] = React.useState(
    isEditMode || false
  );
  const [categories, setCategories] = React.useState<
    Array<{ _id: string; name: string }>
  >([]);
  const [error, setError] = React.useState('');
  const [imageFiles, setImageFiles] = React.useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = React.useState<string[]>([]);
  const [existingImageUrls, setExistingImageUrls] = React.useState<string[]>(
    []
  );

  // Store products state
  const [stores, setStores] = React.useState<
    Array<{ _id: string; name: string }>
  >([]);
  const [storeProducts, setStoreProducts] = React.useState<any[]>([]);
  const [loadingStoreProducts, setLoadingStoreProducts] = React.useState(false);
  const [storeProductDialogOpen, setStoreProductDialogOpen] =
    React.useState(false);
  const [deleteStoreProductDialogOpen, setDeleteStoreProductDialogOpen] =
    React.useState(false);
  const [storeProductToDelete, setStoreProductToDelete] = React.useState<
    string | null
  >(null);
  const [editingStoreProduct, setEditingStoreProduct] = React.useState<
    any | null
  >(null);
  const [storeProductFormData, setStoreProductFormData] = React.useState({
    storeId: '',
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

  // Form state
  const [formData, setFormData] = React.useState({
    name: '',
    description: '',
    category: '',
  });

  // Fetch product data if in edit mode
  React.useEffect(() => {
    if (isEditMode && productId) {
      fetchProduct();
    }
  }, [isEditMode, productId]);

  // Fetch categories on mount
  React.useEffect(() => {
    fetchCategories();
  }, []);

  // Fetch stores and store products if in edit mode
  React.useEffect(() => {
    if (isEditMode && productId) {
      fetchStores();
      fetchStoreProducts();
    }
  }, [isEditMode, productId]);

  const fetchProduct = async () => {
    if (!productId) return;

    try {
      setFetchingProduct(true);
      const response = await productAPI.getById(productId);

      if (response.success && response.data?.product) {
        const product = response.data.product;

        // Populate form with product data
        const categoryId =
          typeof product.category === 'object'
            ? product.category._id
            : product.category;

        setFormData({
          name: product.name || '',
          description: product.description || '',
          category: categoryId || '',
        });

        // Set existing images
        if (product.images && Array.isArray(product.images)) {
          setExistingImageUrls(product.images);
          setImagePreviews(product.images);
        }
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      setError('Failed to load product data');
    } finally {
      setFetchingProduct(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await categoryAPI.getAll(true);
      if (response.success && response.data?.categories) {
        setCategories(response.data.categories);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchStores = async () => {
    try {
      const response = await storeAPI.getAll({ isActive: true });
      if (response.success && response.data?.stores) {
        setStores(response.data.stores);
      }
    } catch (error) {
      console.error('Error fetching stores:', error);
    }
  };

  const fetchStoreProducts = async () => {
    if (!productId) return;
    try {
      setLoadingStoreProducts(true);
      const response = await storeProductAPI.getAll({ productId });
      if (response.success && response.data) {
        setStoreProducts(Array.isArray(response.data) ? response.data : []);
      }
    } catch (error) {
      console.error('Error fetching store products:', error);
      setStoreProducts([]);
    } finally {
      setLoadingStoreProducts(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Validate file types
    const invalidFiles = files.filter(
      (file) => !file.type.startsWith('image/')
    );
    if (invalidFiles.length > 0) {
      setError('Please select valid image files');
      return;
    }

    // Validate file sizes (max 5MB each)
    const oversizedFiles = files.filter((file) => file.size > 5 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      setError('Image sizes should be less than 5MB each');
      return;
    }

    setImageFiles((prev) => [...prev, ...files]);
    setError('');

    // Create previews
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    // Calculate current counts (before removal)
    const currentExistingCount = existingImageUrls.length;

    // If it's an existing image (not a new file), remove from existing URLs
    if (index < currentExistingCount) {
      // Remove from both existing URLs and previews (same index)
      setExistingImageUrls((prev) => prev.filter((_, i) => i !== index));
      setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    } else {
      // It's a new file, remove from imageFiles
      const fileIndex = index - currentExistingCount;
      setImageFiles((prev) => prev.filter((_, i) => i !== fileIndex));
      // Remove from previews (same index in the combined array)
      setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    }
  };

  // Store product handlers
  const handleAddVariant = () => {
    setStoreProductFormData({
      ...storeProductFormData,
      variants: [
        ...storeProductFormData.variants,
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
    const newVariants = [...storeProductFormData.variants];
    newVariants[index] = { ...newVariants[index], [field]: value };

    // Recalculate discount if MRP or selling price changes
    if (field === 'mrp' || field === 'sellingPrice') {
      const mrp = field === 'mrp' ? value : newVariants[index].mrp;
      const sellingPrice =
        field === 'sellingPrice' ? value : newVariants[index].sellingPrice;
      const discount =
        mrp > 0 && sellingPrice > 0 ? ((mrp - sellingPrice) / mrp) * 100 : 0;
      newVariants[index].discount = Math.max(0, discount);
    }

    setStoreProductFormData({ ...storeProductFormData, variants: newVariants });
  };

  const handleRemoveVariant = (index: number) => {
    const newVariants = storeProductFormData.variants.filter(
      (_, i) => i !== index
    );
    setStoreProductFormData({ ...storeProductFormData, variants: newVariants });
  };

  const handleStoreProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!storeProductFormData.storeId) {
      setError('Please select a store');
      return;
    }

    if (storeProductFormData.variants.length === 0) {
      setError('At least one variant is required');
      return;
    }

    // Validate variants
    for (const variant of storeProductFormData.variants) {
      if (
        !variant.sku ||
        variant.size <= 0 ||
        variant.mrp <= 0 ||
        variant.sellingPrice <= 0
      ) {
        setError('Please fill in all required fields for all variants');
        return;
      }
    }

    try {
      setLoading(true);
      setError('');

      if (editingStoreProduct) {
        await storeProductAPI.update(editingStoreProduct._id, {
          variants: storeProductFormData.variants,
          isActive: storeProductFormData.isActive,
        });
      } else {
        await storeProductAPI.create({
          storeId: storeProductFormData.storeId,
          productId: productId!,
          variants: storeProductFormData.variants,
          isActive: storeProductFormData.isActive,
        });
      }

      setStoreProductDialogOpen(false);
      setEditingStoreProduct(null);
      setStoreProductFormData({
        storeId: '',
        variants: [],
        isActive: true,
      });
      fetchStoreProducts();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save store product');
    } finally {
      setLoading(false);
    }
  };

  const handleEditStoreProduct = (storeProduct: any) => {
    setEditingStoreProduct(storeProduct);
    setStoreProductFormData({
      storeId:
        typeof storeProduct.storeId === 'object'
          ? storeProduct.storeId._id
          : storeProduct.storeId,
      variants: storeProduct.variants,
      isActive: storeProduct.isActive,
    });
    setStoreProductDialogOpen(true);
  };

  const handleDeleteStoreProduct = async () => {
    if (!storeProductToDelete) return;
    try {
      await storeProductAPI.delete(storeProductToDelete);
      setDeleteStoreProductDialogOpen(false);
      setStoreProductToDelete(null);
      fetchStoreProducts();
    } catch (error) {
      console.error('Failed to delete store product:', error);
      setError('Failed to delete store product');
    }
  };

  const handleStoreProductDialogClose = () => {
    setStoreProductDialogOpen(false);
    setEditingStoreProduct(null);
    setStoreProductFormData({
      storeId: '',
      variants: [],
      isActive: true,
    });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.name.trim()) {
      setError('Product name is required');
      return;
    }

    if (!formData.category) {
      setError('Category is required');
      return;
    }

    // Check if at least one image is provided
    // For new products, require at least one new image
    // For updates, if no new images, existing images are kept
    if (!isEditMode && imageFiles.length === 0) {
      setError('At least one image is required');
      return;
    }

    // For updates, if all images are removed, require at least one new image
    if (
      isEditMode &&
      imageFiles.length === 0 &&
      existingImageUrls.length === 0
    ) {
      setError('At least one image is required');
      return;
    }

    setLoading(true);

    try {
      const formDataToSend = new FormData();

      // Add all form fields
      formDataToSend.append('name', formData.name);
      if (formData.description) {
        formDataToSend.append('description', formData.description);
      }
      formDataToSend.append('category', formData.category);

      // Add image files if uploaded
      imageFiles.forEach((file) => {
        formDataToSend.append('images', file);
      });

      // Note: If updating and no new files are uploaded, existing images are kept automatically by the backend

      const response =
        isEditMode && productId
          ? await productAPI.update(productId, formDataToSend)
          : await productAPI.create(formDataToSend);

      if (response.success) {
        router.push('/catalog');
      } else {
        setError(
          response.message ||
            `Failed to ${isEditMode ? 'update' : 'create'} product`
        );
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message || 'An error occurred. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='min-h-screen flex flex-col bg-slate-50/50'>
      <main className='flex-1 container max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8'>
        <div className='mb-6'>
          <Link href='/catalog'>
            <Button variant='ghost' className='mb-4'>
              <ArrowLeft className='mr-2 h-4 w-4' />
              Back to Catalog
            </Button>
          </Link>
          <h1 className='text-3xl font-bold tracking-tight text-slate-900'>
            {isEditMode ? 'Edit Product' : 'Add New Product'}
          </h1>
          <p className='text-muted-foreground mt-2'>
            {isEditMode
              ? 'Update product information'
              : 'Create a new product for your catalog'}
          </p>
        </div>

        {fetchingProduct ? (
          <div className='flex items-center justify-center py-12'>
            <Loader2 className='h-8 w-8 animate-spin text-emerald-600' />
            <span className='ml-2 text-muted-foreground'>
              Loading product data...
            </span>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className='space-y-6'>
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                  <CardDescription>
                    Enter the basic details of your product
                  </CardDescription>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <div className='space-y-2'>
                    <Label htmlFor='name'>
                      Product Name <span className='text-red-500'>*</span>
                    </Label>
                    <Input
                      id='name'
                      name='name'
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder='e.g., Fresh Tomatoes, Organic Rice'
                      required
                    />
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='category'>
                      Category <span className='text-red-500'>*</span>
                    </Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, category: value }))
                      }
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder='Select a category' />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category._id} value={category._id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='description'>Description</Label>
                    <Textarea
                      id='description'
                      name='description'
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder='Enter product description...'
                      rows={4}
                      maxLength={1000}
                    />
                    <p className='text-xs text-muted-foreground'>
                      {formData.description.length}/1000 characters
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Images */}
              <Card>
                <CardHeader>
                  <CardTitle>Product Images</CardTitle>
                  <CardDescription>
                    Upload at least one image for your product{' '}
                    <span className='text-red-500'>*</span>
                  </CardDescription>
                </CardHeader>
                <CardContent className='space-y-4'>
                  {/* Image Previews */}
                  {imagePreviews.length > 0 && (
                    <div className='grid grid-cols-2 md:grid-cols-3 gap-4'>
                      {imagePreviews.map((preview, index) => (
                        <div key={index} className='relative group'>
                          <div className='relative aspect-square w-full rounded-lg border border-slate-200 overflow-hidden bg-slate-50'>
                            <Image
                              src={preview}
                              alt={`Product image ${index + 1}`}
                              fill
                              className='object-cover'
                            />
                          </div>
                          <Button
                            type='button'
                            variant='destructive'
                            size='sm'
                            className='absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity'
                            onClick={() => removeImage(index)}
                          >
                            <X className='h-4 w-4' />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Upload Area */}
                  <div className='flex items-center justify-center w-full'>
                    <label
                      htmlFor='images-upload'
                      className='flex flex-col items-center justify-center w-full h-32 border-2 border-slate-300 border-dashed rounded-lg cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors'
                    >
                      <div className='flex flex-col items-center justify-center pt-5 pb-6'>
                        <Upload className='w-8 h-8 mb-2 text-slate-400' />
                        <p className='mb-2 text-sm text-slate-500'>
                          <span className='font-semibold'>Click to upload</span>{' '}
                          or drag and drop
                        </p>
                        <p className='text-xs text-slate-500'>
                          PNG, JPG, GIF up to 5MB each (multiple images allowed)
                        </p>
                      </div>
                      <input
                        id='images-upload'
                        type='file'
                        className='hidden'
                        accept='image/*'
                        multiple
                        onChange={handleImageChange}
                      />
                    </label>
                  </div>
                  <p className='text-xs text-muted-foreground'>
                    Upload product images. Recommended size: 800x800px. You can
                    upload multiple images.
                  </p>
                </CardContent>
              </Card>

              {error && (
                <div className='bg-red-50 border border-red-200 text-red-600 rounded-md p-4'>
                  {error}
                </div>
              )}

              <div className='flex gap-4 justify-end'>
                <Link href='/catalog'>
                  <Button type='button' variant='outline' disabled={loading}>
                    Cancel
                  </Button>
                </Link>
                <Button
                  type='submit'
                  disabled={loading || fetchingProduct}
                  className='bg-emerald-600 hover:bg-emerald-700'
                >
                  {loading ? (
                    <>
                      <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                      {isEditMode ? 'Updating...' : 'Creating...'}
                    </>
                  ) : isEditMode ? (
                    'Update Product'
                  ) : (
                    'Create Product'
                  )}
                </Button>
              </div>
            </div>
          </form>
        )}

        {/* Store Products Section - Only show in edit mode */}
        {isEditMode && productId && (
          <div className='mt-8 space-y-6'>
            <Card>
              <CardHeader>
                <div className='flex items-center justify-between'>
                  <div>
                    <CardTitle className='flex items-center gap-2'>
                      <Store className='h-5 w-5' />
                      Store Products
                    </CardTitle>
                    <CardDescription>
                      Add this product to stores with variants and pricing
                    </CardDescription>
                  </div>
                  <Dialog
                    open={storeProductDialogOpen}
                    onOpenChange={handleStoreProductDialogClose}
                  >
                    <DialogTrigger asChild>
                      <Button
                        onClick={() => {
                          setEditingStoreProduct(null);
                          setStoreProductFormData({
                            storeId: '',
                            variants: [],
                            isActive: true,
                          });
                          setError('');
                        }}
                      >
                        <Plus className='mr-2 h-4 w-4' />
                        Add to Store
                      </Button>
                    </DialogTrigger>
                    <DialogContent className='max-w-3xl max-h-[90vh] overflow-y-auto'>
                      <DialogHeader>
                        <DialogTitle>
                          {editingStoreProduct
                            ? 'Edit Store Product'
                            : 'Add Product to Store'}
                        </DialogTitle>
                        <DialogDescription>
                          {editingStoreProduct
                            ? 'Update product variants and pricing for this store'
                            : 'Select a store and configure product variants with pricing'}
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleStoreProductSubmit}>
                        <div className='space-y-4 py-4'>
                          {/* Product Name - Read Only */}
                          <div className='space-y-2'>
                            <Label htmlFor='product'>Product</Label>
                            <Input
                              id='product'
                              value={formData.name || 'Product Name'}
                              disabled
                              className='bg-slate-50'
                            />
                          </div>

                          <div className='space-y-2'>
                            <Label htmlFor='store'>
                              Store <span className='text-red-500'>*</span>
                            </Label>
                            <Select
                              value={storeProductFormData.storeId}
                              onValueChange={(value) =>
                                setStoreProductFormData((prev) => ({
                                  ...prev,
                                  storeId: value,
                                }))
                              }
                              disabled={!!editingStoreProduct}
                              required
                            >
                              <SelectTrigger>
                                <SelectValue placeholder='Select a store' />
                              </SelectTrigger>
                              <SelectContent>
                                {stores.map((store) => (
                                  <SelectItem key={store._id} value={store._id}>
                                    {store.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          {storeProductFormData.storeId && (
                            <div className='space-y-4'>
                              <div className='flex items-center justify-between'>
                                <Label>
                                  Variants{' '}
                                  <span className='text-red-500'>*</span>
                                </Label>
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

                              {storeProductFormData.variants.length === 0 ? (
                                <p className='text-sm text-muted-foreground'>
                                  Click "Add Variant" to create a variant for
                                  this product
                                </p>
                              ) : (
                                <div className='space-y-4'>
                                  {storeProductFormData.variants.map(
                                    (variant, index) => (
                                      <Card key={index} className='p-4'>
                                        <div className='flex items-start justify-between mb-4'>
                                          <h4 className='font-medium'>
                                            Variant {index + 1}
                                          </h4>
                                          <Button
                                            type='button'
                                            variant='ghost'
                                            size='sm'
                                            onClick={() =>
                                              handleRemoveVariant(index)
                                            }
                                          >
                                            <Trash2 className='h-4 w-4 text-red-500' />
                                          </Button>
                                        </div>
                                        <div className='grid grid-cols-2 md:grid-cols-3 gap-4'>
                                          <div className='space-y-2'>
                                            <Label>
                                              SKU{' '}
                                              <span className='text-red-500'>
                                                *
                                              </span>
                                            </Label>
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
                                            <Label>
                                              Size{' '}
                                              <span className='text-red-500'>
                                                *
                                              </span>
                                            </Label>
                                            <Input
                                              type='number'
                                              step='0.01'
                                              value={variant.size || ''}
                                              onChange={(e) =>
                                                handleVariantChange(
                                                  index,
                                                  'size',
                                                  parseFloat(e.target.value) ||
                                                    0
                                                )
                                              }
                                              placeholder='1'
                                              required
                                            />
                                          </div>
                                          <div className='space-y-2'>
                                            <Label>
                                              Unit{' '}
                                              <span className='text-red-500'>
                                                *
                                              </span>
                                            </Label>
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
                                                <SelectItem value='kg'>
                                                  kg
                                                </SelectItem>
                                                <SelectItem value='g'>
                                                  g
                                                </SelectItem>
                                                <SelectItem value='ml'>
                                                  ml
                                                </SelectItem>
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
                                            <Label>
                                              MRP (₹){' '}
                                              <span className='text-red-500'>
                                                *
                                              </span>
                                            </Label>
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
                                                const value =
                                                  e.target.value.trim();
                                                const mrp =
                                                  value === ''
                                                    ? 0
                                                    : parseFloat(value);
                                                if (!isNaN(mrp) && mrp >= 0) {
                                                  handleVariantChange(
                                                    index,
                                                    'mrp',
                                                    mrp
                                                  );
                                                }
                                              }}
                                              placeholder='120'
                                              required
                                            />
                                          </div>
                                          <div className='space-y-2'>
                                            <Label>
                                              Selling Price (₹){' '}
                                              <span className='text-red-500'>
                                                *
                                              </span>
                                            </Label>
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
                                                const value =
                                                  e.target.value.trim();
                                                const sellingPrice =
                                                  value === ''
                                                    ? 0
                                                    : parseFloat(value);
                                                if (
                                                  !isNaN(sellingPrice) &&
                                                  sellingPrice >= 0
                                                ) {
                                                  handleVariantChange(
                                                    index,
                                                    'sellingPrice',
                                                    sellingPrice
                                                  );
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
                                              value={variant.discount.toFixed(
                                                2
                                              )}
                                              disabled
                                              className='bg-slate-50'
                                            />
                                          </div>
                                        </div>
                                        <div className='mt-4 flex items-center justify-between'>
                                          <Label htmlFor={`available-${index}`}>
                                            Available
                                          </Label>
                                          <Switch
                                            id={`available-${index}`}
                                            checked={variant.isAvailable}
                                            onCheckedChange={(checked) =>
                                              handleVariantChange(
                                                index,
                                                'isAvailable',
                                                checked
                                              )
                                            }
                                          />
                                        </div>
                                      </Card>
                                    )
                                  )}
                                </div>
                              )}
                            </div>
                          )}

                          <div className='flex items-center justify-between pt-4 border-t'>
                            <div className='space-y-0.5'>
                              <Label htmlFor='isActive'>Active</Label>
                              <p className='text-sm text-muted-foreground'>
                                Make this product available in the store
                              </p>
                            </div>
                            <Switch
                              id='isActive'
                              checked={storeProductFormData.isActive}
                              onCheckedChange={(checked) =>
                                setStoreProductFormData((prev) => ({
                                  ...prev,
                                  isActive: checked,
                                }))
                              }
                            />
                          </div>
                        </div>

                        {error && (
                          <div className='bg-red-50 border border-red-200 text-red-600 rounded-md p-4'>
                            {error}
                          </div>
                        )}

                        <DialogFooter>
                          <Button
                            type='button'
                            variant='outline'
                            onClick={handleStoreProductDialogClose}
                            disabled={loading}
                          >
                            Cancel
                          </Button>
                          <Button
                            type='submit'
                            disabled={
                              loading ||
                              !storeProductFormData.storeId ||
                              storeProductFormData.variants.length === 0
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
                {loadingStoreProducts ? (
                  <div className='flex items-center justify-center py-8'>
                    <Loader2 className='h-6 w-6 animate-spin text-emerald-600' />
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Store</TableHead>
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
                                No store products found.
                              </p>
                              <Button
                                onClick={() => {
                                  setEditingStoreProduct(null);
                                  setStoreProductFormData({
                                    storeId: '',
                                    variants: [],
                                    isActive: true,
                                  });
                                  setStoreProductDialogOpen(true);
                                }}
                                className='bg-emerald-600 hover:bg-emerald-700'
                              >
                                <Plus className='mr-2 h-4 w-4' />
                                Add to Store
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        storeProducts.map((storeProduct) => (
                          <TableRow key={storeProduct._id}>
                            <TableCell className='font-medium'>
                              {typeof storeProduct.storeId === 'object'
                                ? storeProduct.storeId.name
                                : 'Store'}
                            </TableCell>
                            <TableCell>
                              <div className='flex flex-wrap gap-1'>
                                {storeProduct.variants?.map(
                                  (variant: any, idx: number) => (
                                    <Badge
                                      key={idx}
                                      variant='secondary'
                                      className='text-xs'
                                    >
                                      {variant.size} {variant.unit}
                                    </Badge>
                                  )
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  storeProduct.isActive
                                    ? 'default'
                                    : 'secondary'
                                }
                                className={
                                  storeProduct.isActive
                                    ? 'bg-emerald-100 text-emerald-700'
                                    : ''
                                }
                              >
                                {storeProduct.isActive ? 'Active' : 'Inactive'}
                              </Badge>
                            </TableCell>
                            <TableCell className='text-right'>
                              <div className='flex justify-end gap-2'>
                                <Button
                                  variant='ghost'
                                  size='sm'
                                  onClick={() =>
                                    handleEditStoreProduct(storeProduct)
                                  }
                                >
                                  <Edit className='h-4 w-4' />
                                </Button>
                                <Button
                                  variant='ghost'
                                  size='sm'
                                  onClick={() => {
                                    setStoreProductToDelete(storeProduct._id);
                                    setDeleteStoreProductDialogOpen(true);
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

            {/* Delete Confirmation Dialog */}
            <AlertDialog
              open={deleteStoreProductDialogOpen}
              onOpenChange={setDeleteStoreProductDialogOpen}
            >
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete this store product. This action
                    cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteStoreProduct}
                    className='bg-red-600 hover:bg-red-700'
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </main>
    </div>
  );
}

'use client';

import * as React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Loader2, Upload, X, Package } from 'lucide-react';
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
import { Switch } from '@/components/ui/switch';
import { productAPI, categoryAPI, productBatchAPI } from '@/lib/api';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2 } from 'lucide-react';

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
  const [selectedCategory, setSelectedCategory] = React.useState<string>('');
  const [imagePreviews, setImagePreviews] = React.useState<string[]>([]);
  const [imageFiles, setImageFiles] = React.useState<File[]>([]);
  const [error, setError] = React.useState('');
  const [batches, setBatches] = React.useState<any[]>([]);
  const [fetchingBatches, setFetchingBatches] = React.useState(false);
  const [product, setProduct] = React.useState<any>(null);

  // Form state
  const [formData, setFormData] = React.useState({
    name: '',
    category: '',
    size: '',
    unit: 'kg',
    attributes: {},
    isActive: true,
  });
  const [variants, setVariants] = React.useState<Array<{ size: string; unit: string }>>([
    { size: '', unit: 'kg' },
  ]);

  // Fetch product data if in edit mode
  React.useEffect(() => {
    if (isEditMode && productId) {
      fetchProduct();
      fetchBatches();
    }
  }, [isEditMode, productId]);

  // Fetch categories on mount
  React.useEffect(() => {
    fetchCategories();
  }, []);


  const fetchProduct = async () => {
    if (!productId) return;

    try {
      setFetchingProduct(true);
      const response = await productAPI.getById(productId);

      if (response.success && response.data?.product) {
        const productData = response.data.product;
        setProduct(productData);

        // Populate form with product data
        setFormData({
          name: productData.name || '',
          category: '',
          size: productData.size?.toString() || '',
          unit: productData.unit || 'kg',
          attributes: productData.attributes || {},
          isActive: productData.isActive !== undefined ? productData.isActive : true,
        });

        // Set variants if available, otherwise use size/unit
        if (productData.variants && productData.variants.length > 0) {
          setVariants(
            productData.variants.map((v: any) => ({
              size: v.size?.toString() || '',
              unit: v.unit || 'kg',
            }))
          );
        } else if (productData.size && productData.unit) {
          setVariants([{ size: productData.size.toString(), unit: productData.unit }]);
        }

        // Set category
        const categoryId = productData.category?._id || productData.category || '';
        if (categoryId) {
          setSelectedCategory(categoryId);
          setFormData((prev) => ({ ...prev, category: categoryId }));
        }

        // Set existing images as previews
        if (productData.images && productData.images.length > 0) {
          setImagePreviews(productData.images);
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
      const response = await categoryAPI.getMain();
      if (response.success && response.data?.categories) {
        setCategories(response.data.categories);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchBatches = async () => {
    if (!productId) return;
    try {
      setFetchingBatches(true);
      const response = await productBatchAPI.getByProduct(productId);
      if (response.success && response.data?.batches) {
        setBatches(response.data.batches);
      }
    } catch (error) {
      console.error('Error fetching batches:', error);
    } finally {
      setFetchingBatches(false);
    }
  };


  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles = Array.from(files);
    setImageFiles((prev) => [...prev, ...newFiles]);

    const newPreviews: string[] = [];
    newFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        newPreviews.push(reader.result as string);
        if (newPreviews.length === newFiles.length) {
          setImagePreviews((prev) => [...prev, ...newPreviews]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const formDataToSend = new FormData();

      // Add form fields (excluding category since we handle it separately)
      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'category') return; // Skip category, handled separately
        if (key === 'size' || key === 'unit') return; // Skip size/unit, handled via variants
        if (value !== '' && value !== null && value !== undefined) {
          if (key === 'isActive') {
            formDataToSend.append(key, value ? 'true' : 'false');
          } else if (key === 'attributes') {
            // Handle attributes as JSON string
            formDataToSend.append(key, JSON.stringify(value));
          } else {
            formDataToSend.append(key, String(value));
          }
        }
      });

      // Add variants
      const validVariants = variants.filter((v) => v.size && v.unit);
      if (validVariants.length > 0) {
        formDataToSend.append(
          'variants',
          JSON.stringify(
            validVariants.map((v) => ({
              size: parseFloat(v.size),
              unit: v.unit,
            }))
          )
        );
      }

      // Add category (only once, from selectedCategory)
      if (selectedCategory) {
        formDataToSend.append('category', selectedCategory);
      }

      // Add images
      imageFiles.forEach((file) => {
        formDataToSend.append('images', file);
      });

      const response =
        isEditMode && productId
          ? await productAPI.update(productId, formDataToSend)
          : await productAPI.create(formDataToSend);

      if (response.success) {
        router.push('/products');
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
      <main className='flex-1 container max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8'>
        <div className='mb-6'>
          <Link href='/products'>
            <Button variant='ghost' className='mb-4'>
              <ArrowLeft className='mr-2 h-4 w-4' />
              Back to Products
            </Button>
          </Link>
          <div className='flex items-center justify-between'>
            <div>
              <h1 className='text-3xl font-bold tracking-tight text-slate-900'>
                {isEditMode ? 'Edit Product' : 'Add New Product'}
              </h1>
              <p className='text-muted-foreground mt-2'>
                {isEditMode
                  ? 'Update product information'
                  : 'Create a new product in your catalog'}
              </p>
            </div>
            {isEditMode && productId && (
              <Link href={`/products/${productId}/batches`}>
                <Button variant='outline'>
                  <Package className='mr-2 h-4 w-4' />
                  Manage Batches
                </Button>
              </Link>
            )}
          </div>
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
                      placeholder='e.g., Fresh Organic Tomatoes'
                      required
                    />
                  </div>

                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <div className='space-y-2'>
                      <Label htmlFor='category'>
                        Category <span className='text-red-500'>*</span>
                      </Label>
                      <Select
                        value={selectedCategory}
                        onValueChange={(value) => {
                          setSelectedCategory(value);
                          setFormData((prev) => ({ ...prev, category: value }));
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder='Select category' />
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
                  </div>
                </CardContent>
              </Card>


              {/* Product Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Product Variants</CardTitle>
                  <CardDescription>
                    Add multiple size/unit options (e.g., 1kg, 500g, 250g)
                  </CardDescription>
                </CardHeader>
                <CardContent className='space-y-4'>
                  {variants.map((variant, index) => (
                    <div
                      key={index}
                      className='grid grid-cols-1 md:grid-cols-3 gap-4 items-end'
                    >
                      <div className='space-y-2'>
                        <Label htmlFor={`size-${index}`}>
                          Size <span className='text-red-500'>*</span>
                        </Label>
                        <Input
                          id={`size-${index}`}
                          type='number'
                          step='0.01'
                          value={variant.size}
                          onChange={(e) => {
                            const newVariants = [...variants];
                            newVariants[index].size = e.target.value;
                            setVariants(newVariants);
                          }}
                          placeholder='1.0'
                          required
                          min='0.01'
                        />
                      </div>

                      <div className='space-y-2'>
                        <Label htmlFor={`unit-${index}`}>
                          Unit <span className='text-red-500'>*</span>
                        </Label>
                        <Select
                          value={variant.unit}
                          onValueChange={(value) => {
                            const newVariants = [...variants];
                            newVariants[index].unit = value;
                            setVariants(newVariants);
                          }}
                          required
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value='kg'>kg</SelectItem>
                            <SelectItem value='g'>g</SelectItem>
                            <SelectItem value='liter'>liter</SelectItem>
                            <SelectItem value='ml'>ml</SelectItem>
                            <SelectItem value='pack'>pack</SelectItem>
                            <SelectItem value='piece'>piece</SelectItem>
                            <SelectItem value='dozen'>dozen</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className='flex gap-2'>
                        {variants.length > 1 && (
                          <Button
                            type='button'
                            variant='outline'
                            size='icon'
                            onClick={() => {
                              setVariants(variants.filter((_, i) => i !== index));
                            }}
                          >
                            <Trash2 className='h-4 w-4' />
                          </Button>
                        )}
                        {index === variants.length - 1 && (
                          <Button
                            type='button'
                            variant='outline'
                            size='icon'
                            onClick={() => {
                              setVariants([...variants, { size: '', unit: 'kg' }]);
                            }}
                          >
                            <Plus className='h-4 w-4' />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                  {variants.length === 0 && (
                    <Button
                      type='button'
                      variant='outline'
                      onClick={() => {
                        setVariants([{ size: '', unit: 'kg' }]);
                      }}
                    >
                      <Plus className='mr-2 h-4 w-4' />
                      Add Variant
                    </Button>
                  )}
                </CardContent>
              </Card>

              {/* Pricing & Inventory - Only show in edit mode */}
              {isEditMode && (
                <Card>
                  <CardHeader>
                    <div className='flex items-center justify-between'>
                      <div>
                        <CardTitle>Pricing & Inventory</CardTitle>
                        <CardDescription>
                          Manage product batches, costs, and stock levels
                        </CardDescription>
                      </div>
                      <Link href={`/products/${productId}/batches`}>
                        <Button variant='outline' size='sm'>
                          <Package className='mr-2 h-4 w-4' />
                          Manage Batches
                        </Button>
                      </Link>
                    </div>
                  </CardHeader>
                  <CardContent className='space-y-4'>
                    {fetchingBatches ? (
                      <div className='flex items-center justify-center py-8'>
                        <Loader2 className='h-6 w-6 animate-spin text-emerald-600' />
                        <span className='ml-2 text-muted-foreground'>Loading batches...</span>
                      </div>
                    ) : batches.length === 0 ? (
                      <div className='text-center py-8 border-2 border-dashed border-slate-200 rounded-lg'>
                        <Package className='h-12 w-12 text-muted-foreground mx-auto mb-4' />
                        <p className='text-muted-foreground mb-4'>No batches found</p>
                        <Link href={`/products/${productId}/batches`}>
                          <Button>
                            <Plus className='mr-2 h-4 w-4' />
                            Add First Batch
                          </Button>
                        </Link>
                      </div>
                    ) : (
                      <div className='space-y-4'>
                        <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
                          <div className='p-4 bg-slate-50 rounded-lg'>
                            <p className='text-sm text-muted-foreground mb-1'>Total Batches</p>
                            <p className='text-2xl font-bold text-slate-900'>{batches.length}</p>
                          </div>
                          <div className='p-4 bg-slate-50 rounded-lg'>
                            <p className='text-sm text-muted-foreground mb-1'>Avg Cost Per Quantity</p>
                            <p className='text-2xl font-bold text-slate-900'>
                              {product?.averageCostPerQuantity 
                                ? `₹${product.averageCostPerQuantity.toFixed(2)}`
                                : (() => {
                                    const totalCost = batches.reduce((sum, b) => sum + (b.totalCost || 0), 0);
                                    const totalQtyPurchased = batches.reduce((sum, b) => sum + (b.quantityPurchased || 0), 0);
                                    const avgCost = totalQtyPurchased > 0 ? totalCost / totalQtyPurchased : 0;
                                    return `₹${avgCost.toFixed(2)}`;
                                  })()}
                            </p>
                            <p className='text-xs text-muted-foreground mt-1'>Auto-calculated</p>
                          </div>
                          <div className='p-4 bg-slate-50 rounded-lg'>
                            <p className='text-sm text-muted-foreground mb-1'>Avg Selling Price</p>
                            <p className='text-2xl font-bold text-slate-900'>
                              ₹{(
                                batches.reduce((sum, b) => sum + (b.sellingPrice || 0), 0) / batches.length
                              ).toFixed(2)}
                            </p>
                          </div>
                          <div className='p-4 bg-slate-50 rounded-lg'>
                            <p className='text-sm text-muted-foreground mb-1'>Total Stock</p>
                            <p className='text-2xl font-bold text-slate-900'>
                              {batches.reduce((sum, b) => sum + (b.quantityAvailable || 0), 0)}
                            </p>
                          </div>
                        </div>

                        <div className='border-t pt-4'>
                          <h4 className='font-semibold mb-3'>Recent Batches</h4>
                          <div className='space-y-2'>
                            {batches.slice(0, 3).map((batch) => {
                              const profit = (batch.sellingPrice || 0) - (batch.costPrice || 0);
                              const profitMargin = batch.costPrice > 0 
                                ? ((profit / batch.costPrice) * 100).toFixed(1) 
                                : '0';
                              return (
                                <div
                                  key={batch._id}
                                  className='flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors'
                                >
                                  <div className='flex-1'>
                                    <div className='flex items-center gap-2 mb-1'>
                                      <span className='font-medium text-sm'>
                                        {batch.batchCode || 'No Code'}
                                      </span>
                                      {batch.quantityAvailable > 0 && (
                                        <Badge variant='default' className='text-xs'>
                                          {batch.quantityAvailable} available
                                        </Badge>
                                      )}
                                    </div>
                                    <div className='flex items-center gap-4 text-xs text-muted-foreground'>
                                      <span>Cost: ₹{batch.costPrice?.toFixed(2) || '0.00'}</span>
                                      <span>Selling: ₹{batch.sellingPrice?.toFixed(2) || '0.00'}</span>
                                      <span className='text-emerald-600 font-medium'>
                                        Profit: ₹{profit.toFixed(2)} ({profitMargin}%)
                                      </span>
                                    </div>
                                  </div>
                                  <Link href={`/products/${productId}/batches`}>
                                    <Button variant='ghost' size='sm'>
                                      <Edit className='h-4 w-4' />
                                    </Button>
                                  </Link>
                                </div>
                              );
                            })}
                          </div>
                          {batches.length > 3 && (
                            <div className='mt-3 text-center'>
                              <Link href={`/products/${productId}/batches`}>
                                <Button variant='outline' size='sm'>
                                  View All {batches.length} Batches
                                </Button>
                              </Link>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Images */}
              <Card>
                <CardHeader>
                  <CardTitle>Product Images</CardTitle>
                  <CardDescription>
                    Upload product images (multiple images supported)
                  </CardDescription>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <div className='space-y-2'>
                    <Label htmlFor='images'>Images</Label>
                    <div className='flex items-center gap-2'>
                      <Input
                        id='images'
                        type='file'
                        accept='image/*'
                        multiple
                        onChange={handleImageChange}
                        className='cursor-pointer'
                      />
                      <Upload className='h-4 w-4 text-muted-foreground' />
                    </div>
                  </div>

                  {imagePreviews.length > 0 && (
                    <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
                      {imagePreviews.map((preview, index) => (
                        <div
                          key={index}
                          className='relative aspect-square rounded-lg overflow-hidden border border-slate-200'
                        >
                          <Image
                            src={preview}
                            alt={`Preview ${index + 1}`}
                            fill
                            className='object-cover'
                            unoptimized
                          />
                          <button
                            type='button'
                            onClick={() => removeImage(index)}
                            className='absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600'
                          >
                            <X className='h-4 w-4' />
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
                  <CardDescription>
                    Control product visibility and features
                  </CardDescription>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <div className='flex items-center justify-between'>
                    <div className='space-y-0.5'>
                      <Label htmlFor='isActive'>Active</Label>
                      <p className='text-sm text-muted-foreground'>
                        Make this product visible to customers
                      </p>
                    </div>
                    <Switch
                      id='isActive'
                      checked={formData.isActive}
                      onCheckedChange={(checked) =>
                        setFormData((prev) => ({ ...prev, isActive: checked }))
                      }
                    />
                  </div>

                </CardContent>
              </Card>

              {error && (
                <div className='bg-red-50 border border-red-200 text-red-600 rounded-md p-4'>
                  {error}
                </div>
              )}

              <div className='flex gap-4 justify-end'>
                <Link href='/products'>
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
      </main>
    </div>
  );
}

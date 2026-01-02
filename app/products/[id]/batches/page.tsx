'use client';

import * as React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Loader2, Plus, Edit, Trash2, Package } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { productBatchAPI, productAPI } from '@/lib/api';
import { Badge } from '@/components/ui/badge';

interface SellingVariant {
  sellingSize: number;
  sellingUnit: string;
  originalPrice: number;
  sellingPrice: number;
  discount?: number;
  quantityAvailable: number;
}

interface ProductBatch {
  _id: string;
  product: {
    _id: string;
    name: string;
    category?: string;
    brand?: string;
    unit?: string;
  };
  batchCode?: string;
  purchasedSize: number;
  purchasedUnit: string;
  totalCost: number;
  quantityPurchased: number;
  sellingVariants: SellingVariant[];
  expiryDate?: string;
  supplier?: string;
  createdAt: string;
}

export default function ProductBatchesPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params?.id as string | undefined;

  const [loading, setLoading] = React.useState(false);
  const [fetching, setFetching] = React.useState(true);
  const [batches, setBatches] = React.useState<ProductBatch[]>([]);
  const [product, setProduct] = React.useState<any>(null);
  const [error, setError] = React.useState('');
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [editingBatch, setEditingBatch] = React.useState<ProductBatch | null>(null);
  const [batchToDelete, setBatchToDelete] = React.useState<ProductBatch | null>(null);

  const [formData, setFormData] = React.useState({
    batchCode: '',
    purchasedSize: '',
    purchasedUnit: '',
    totalCost: '',
    quantityPurchased: '',
    expiryDate: '',
    supplier: '',
  });
  const [sellingVariants, setSellingVariants] = React.useState<SellingVariant[]>([]);
  const [averageCostPerQuantity, setAverageCostPerQuantity] = React.useState<number>(0);

  React.useEffect(() => {
    if (productId) {
      fetchProduct();
      fetchBatches();
    }
  }, [productId]);

  const fetchProduct = async () => {
    if (!productId) return;
    try {
      const response = await productAPI.getById(productId);
      if (response.success && response.data?.product) {
        setProduct(response.data.product);
      }
    } catch (error) {
      console.error('Error fetching product:', error);
    }
  };

  const fetchBatches = async () => {
    if (!productId) return;
    try {
      setFetching(true);
      const response = await productBatchAPI.getByProduct(productId);
      if (response.success && response.data?.batches) {
        setBatches(response.data.batches);
      }
    } catch (error) {
      console.error('Error fetching batches:', error);
      setError('Failed to load batches');
    } finally {
      setFetching(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };

      // Auto-calculate discount when originalPrice or sellingPrice changes
      if (name === 'originalPrice' || name === 'sellingPrice') {
        const originalPrice = name === 'originalPrice' ? parseFloat(value) || 0 : parseFloat(prev.originalPrice) || 0;
        const sellingPrice = name === 'sellingPrice' ? parseFloat(value) || 0 : parseFloat(prev.sellingPrice) || 0;

        if (originalPrice > 0 && sellingPrice < originalPrice) {
          const calculatedDiscount = ((originalPrice - sellingPrice) / originalPrice) * 100;
          updated.discount = calculatedDiscount.toFixed(2);
        } else {
          updated.discount = '';
        }
      }

      // Auto-calculate averageCostPerQuantity when totalCost or quantityPurchased changes
      if (name === 'totalCost' || name === 'quantityPurchased') {
        const totalCost = name === 'totalCost' ? parseFloat(value) || 0 : parseFloat(prev.totalCost) || 0;
        const qtyPurchased = name === 'quantityPurchased' ? parseFloat(value) || 0 : parseFloat(prev.quantityPurchased) || 0;
        
        if (totalCost > 0 && qtyPurchased > 0) {
          const avgCost = totalCost / qtyPurchased;
          setAverageCostPerQuantity(avgCost);
        } else {
          setAverageCostPerQuantity(0);
        }
      }

      // Auto-set quantityAvailable when quantityPurchased changes
      if (name === 'quantityPurchased' && !prev.quantityAvailable) {
        updated.quantityAvailable = value;
      }

      return updated;
    });
  };

  const resetForm = () => {
    setFormData({
      batchCode: '',
      purchasedSize: '',
      purchasedUnit: '',
      totalCost: '',
      quantityPurchased: '',
      expiryDate: '',
      supplier: '',
    });
    setSellingVariants([]);
    setAverageCostPerQuantity(0);
    setEditingBatch(null);
  };

  const handleOpenDialog = (batch?: ProductBatch) => {
    if (batch) {
      setEditingBatch(batch);
      const totalCost = batch.totalCost || 0;
      const qtyPurchased = batch.quantityPurchased || 0;
      const avgCost = qtyPurchased > 0 ? totalCost / qtyPurchased : 0;
      setAverageCostPerQuantity(avgCost);
      
      setFormData({
        batchCode: batch.batchCode || '',
        purchasedSize: batch.purchasedSize?.toString() || '',
        purchasedUnit: batch.purchasedUnit || '',
        totalCost: batch.totalCost.toString(),
        quantityPurchased: batch.quantityPurchased.toString(),
        expiryDate: batch.expiryDate ? new Date(batch.expiryDate).toISOString().split('T')[0] : '',
        supplier: batch.supplier || '',
      });
      setSellingVariants(batch.sellingVariants || []);
    } else {
      resetForm();
      // Set default purchasedSize/purchasedUnit from first variant if product has variants
      if (product?.variants && product.variants.length > 0) {
        setFormData((prev) => ({
          ...prev,
          purchasedSize: product.variants[0].size.toString(),
          purchasedUnit: product.variants[0].unit,
        }));
        // Add first variant as default selling variant
        setSellingVariants([{
          sellingSize: product.variants[0].size,
          sellingUnit: product.variants[0].unit,
          originalPrice: 0,
          sellingPrice: 0,
          quantityAvailable: 0,
        }]);
      } else if (product?.size && product?.unit) {
        setFormData((prev) => ({
          ...prev,
          purchasedSize: product.size.toString(),
          purchasedUnit: product.unit,
        }));
        setSellingVariants([{
          sellingSize: product.size,
          sellingUnit: product.unit,
          originalPrice: 0,
          sellingPrice: 0,
          quantityAvailable: 0,
        }]);
      }
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    resetForm();
  };

  const addSellingVariant = () => {
    if (product?.variants && product.variants.length > 0) {
      const firstVariant = product.variants[0];
      setSellingVariants([
        ...sellingVariants,
        {
          sellingSize: firstVariant.size,
          sellingUnit: firstVariant.unit,
          originalPrice: 0,
          sellingPrice: 0,
          quantityAvailable: 0,
        },
      ]);
    }
  };

  const removeSellingVariant = (index: number) => {
    setSellingVariants(sellingVariants.filter((_, i) => i !== index));
  };

  const updateSellingVariant = (index: number, field: keyof SellingVariant, value: any) => {
    const updated = [...sellingVariants];
    updated[index] = { ...updated[index], [field]: value };
    
    // Auto-calculate discount when originalPrice or sellingPrice changes
    if (field === 'originalPrice' || field === 'sellingPrice') {
      const originalPrice = field === 'originalPrice' ? parseFloat(value) || 0 : updated[index].originalPrice || 0;
      const sellingPrice = field === 'sellingPrice' ? parseFloat(value) || 0 : updated[index].sellingPrice || 0;
      
      if (originalPrice > 0 && sellingPrice < originalPrice) {
        updated[index].discount = ((originalPrice - sellingPrice) / originalPrice) * 100;
      } else {
        updated[index].discount = undefined;
      }
    }
    
    setSellingVariants(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productId) return;

    setError('');
    
    // Validate required fields
    if (!formData.purchasedSize || formData.purchasedSize.trim() === '') {
      setError('Purchased Size is required');
      return;
    }
    if (!formData.purchasedUnit || formData.purchasedUnit.trim() === '') {
      setError('Purchased Unit is required');
      return;
    }
    if (!formData.totalCost || formData.totalCost.trim() === '') {
      setError('Total Cost is required');
      return;
    }
    if (!formData.quantityPurchased || formData.quantityPurchased.trim() === '') {
      setError('Quantity Purchased is required');
      return;
    }
    if (sellingVariants.length === 0) {
      setError('At least one selling variant is required');
      return;
    }

    // Validate selling variants
    for (let i = 0; i < sellingVariants.length; i++) {
      const sv = sellingVariants[i];
      if (!sv.sellingSize || sv.sellingSize <= 0) {
        setError(`Selling Variant ${i + 1}: Size is required and must be positive`);
        return;
      }
      if (!sv.sellingUnit) {
        setError(`Selling Variant ${i + 1}: Unit is required`);
        return;
      }
      if (!sv.originalPrice || sv.originalPrice < 0) {
        setError(`Selling Variant ${i + 1}: Original Price is required`);
        return;
      }
      if (!sv.sellingPrice || sv.sellingPrice < 0) {
        setError(`Selling Variant ${i + 1}: Selling Price is required`);
        return;
      }
      if (sv.quantityAvailable === undefined || sv.quantityAvailable < 0) {
        setError(`Selling Variant ${i + 1}: Quantity Available is required`);
        return;
      }
    }

    setLoading(true);

    try {
      const batchData = {
        product: productId,
        batchCode: formData.batchCode || undefined,
        purchasedSize: parseFloat(formData.purchasedSize),
        purchasedUnit: formData.purchasedUnit,
        totalCost: parseFloat(formData.totalCost),
        quantityPurchased: parseFloat(formData.quantityPurchased),
        sellingVariants: sellingVariants.map((sv) => ({
          sellingSize: sv.sellingSize,
          sellingUnit: sv.sellingUnit,
          originalPrice: sv.originalPrice,
          sellingPrice: sv.sellingPrice,
          discount: sv.discount,
          quantityAvailable: sv.quantityAvailable,
        })),
        expiryDate: formData.expiryDate || undefined,
        supplier: formData.supplier || undefined,
      };

      const response = editingBatch
        ? await productBatchAPI.update(editingBatch._id, batchData)
        : await productBatchAPI.create(batchData);

      if (response.success) {
        handleCloseDialog();
        fetchBatches();
      } else {
        setError(response.message || `Failed to ${editingBatch ? 'update' : 'create'} batch`);
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message || 'An error occurred. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!batchToDelete) return;

    try {
      setLoading(true);
      const response = await productBatchAPI.delete(batchToDelete._id);
      if (response.success) {
        setDeleteDialogOpen(false);
        setBatchToDelete(null);
        fetchBatches();
      } else {
        setError(response.message || 'Failed to delete batch');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete batch');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const calculateCostPerQuantity = (batch: ProductBatch): number => {
    // Calculate cost per quantity = totalCost / quantityPurchased
    if (batch.quantityPurchased && batch.quantityPurchased > 0) {
      return batch.totalCost / batch.quantityPurchased;
    }
    return 0;
  };

  const calculateProfit = (batch: ProductBatch) => {
    // Calculate cost per quantity
    const costPerQuantity = calculateCostPerQuantity(batch);
    
    // Calculate total profit across all selling variants
    let totalProfit = 0;
    let totalQuantity = 0;
    
    if (batch.sellingVariants && batch.sellingVariants.length > 0) {
      batch.sellingVariants.forEach((sv) => {
        const profitPerUnit = sv.sellingPrice - costPerQuantity;
        totalProfit += profitPerUnit * (sv.quantityAvailable || 0);
        totalQuantity += sv.quantityAvailable || 0;
      });
    }
    
    // Average profit margin
    const avgProfitMargin = costPerQuantity > 0 && batch.sellingVariants?.length > 0
      ? batch.sellingVariants.reduce((sum, sv) => {
          const profitPerUnit = sv.sellingPrice - costPerQuantity;
          return sum + (profitPerUnit / costPerQuantity) * 100;
        }, 0) / batch.sellingVariants.length
      : 0;
    
    return { profit: totalProfit, profitMargin: avgProfitMargin, profitPerUnit: costPerQuantity > 0 ? totalProfit / totalQuantity : 0, costPerQuantity };
  };

  return (
    <div className='min-h-screen flex flex-col bg-slate-50/50'>
      <main className='flex-1 container max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8'>
        <div className='mb-6'>
          <Link href={`/products/${productId}`}>
            <Button variant='ghost' className='mb-4'>
              <ArrowLeft className='mr-2 h-4 w-4' />
              Back to Product
            </Button>
          </Link>
          <div className='flex items-center justify-between'>
            <div>
              <h1 className='text-3xl font-bold tracking-tight text-slate-900'>
                Product Batches
              </h1>
              <p className='text-muted-foreground mt-2'>
                {product ? `Manage batches for ${product.name}` : 'Manage product batches'}
              </p>
            </div>
            <Button
              onClick={() => handleOpenDialog()}
              className='bg-emerald-600 hover:bg-emerald-700'
            >
              <Plus className='mr-2 h-4 w-4' />
              Add Batch
            </Button>
          </div>
        </div>

        {fetching ? (
          <div className='flex items-center justify-center py-12'>
            <Loader2 className='h-8 w-8 animate-spin text-emerald-600' />
            <span className='ml-2 text-muted-foreground'>Loading batches...</span>
          </div>
        ) : (
          <>
            {error && (
              <div className='bg-red-50 border border-red-200 text-red-600 rounded-md p-4 mb-6'>
                {error}
              </div>
            )}

            {batches.length === 0 ? (
              <Card>
                <CardContent className='flex flex-col items-center justify-center py-12'>
                  <Package className='h-12 w-12 text-muted-foreground mb-4' />
                  <p className='text-muted-foreground mb-4'>No batches found</p>
                  <Button onClick={() => handleOpenDialog()}>
                    <Plus className='mr-2 h-4 w-4' />
                    Add First Batch
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Batches</CardTitle>
                  <CardDescription>
                    Each batch represents a purchase event with its own pricing and inventory
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Batch Code</TableHead>
                        <TableHead>Purchased</TableHead>
                        <TableHead>Total Cost</TableHead>
                        <TableHead>Qty Purchased</TableHead>
                        <TableHead>Cost Per Qty</TableHead>
                        <TableHead>Selling Variants</TableHead>
                        <TableHead>Expiry Date</TableHead>
                        <TableHead>Supplier</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead className='text-right'>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {batches.map((batch) => {
                        const costPerQuantity = calculateCostPerQuantity(batch);
                        return (
                          <TableRow key={batch._id}>
                            <TableCell>
                              {batch.batchCode || (
                                <span className='text-muted-foreground'>N/A</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge variant='outline'>
                                {batch.purchasedSize} {batch.purchasedUnit}
                              </Badge>
                            </TableCell>
                            <TableCell>₹{batch.totalCost.toFixed(2)}</TableCell>
                            <TableCell>{batch.quantityPurchased || '-'}</TableCell>
                            <TableCell>
                              {costPerQuantity > 0 ? (
                                <span className='font-medium'>₹{costPerQuantity.toFixed(2)}</span>
                              ) : (
                                <span className='text-muted-foreground'>-</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className='flex flex-col gap-1'>
                                {batch.sellingVariants?.map((sv, idx) => (
                                  <div key={idx} className='text-xs border rounded p-1'>
                                    <div className='font-medium'>{sv.sellingSize} {sv.sellingUnit}</div>
                                    <div>Price: ₹{sv.sellingPrice.toFixed(2)}</div>
                                    <div>Qty: {sv.quantityAvailable}</div>
                                    {sv.discount && <div>Discount: {sv.discount}%</div>}
                                  </div>
                                ))}
                              </div>
                            </TableCell>
                            <TableCell>{formatDate(batch.expiryDate)}</TableCell>
                            <TableCell>
                              {batch.supplier || (
                                <span className='text-muted-foreground'>-</span>
                              )}
                            </TableCell>
                            <TableCell className='text-sm text-muted-foreground'>
                              {formatDate(batch.createdAt)}
                            </TableCell>
                            <TableCell className='text-right'>
                              <div className='flex justify-end gap-2'>
                                <Button
                                  variant='ghost'
                                  size='sm'
                                  onClick={() => handleOpenDialog(batch)}
                                >
                                  <Edit className='h-4 w-4' />
                                </Button>
                                <Button
                                  variant='ghost'
                                  size='sm'
                                  onClick={() => {
                                    setBatchToDelete(batch);
                                    setDeleteDialogOpen(true);
                                  }}
                                >
                                  <Trash2 className='h-4 w-4 text-red-500' />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {/* Create/Edit Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className='max-w-2xl max-h-[90vh] overflow-y-auto'>
            <DialogHeader>
              <DialogTitle>
                {editingBatch ? 'Edit Batch' : 'Add New Batch'}
              </DialogTitle>
              <DialogDescription>
                {editingBatch
                  ? 'Update batch information'
                  : 'Create a new batch for this product'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className='space-y-4 py-4'>
                <div className='grid grid-cols-2 gap-4'>
                  <div className='space-y-2'>
                    <Label htmlFor='batchCode'>Batch Code</Label>
                    <Input
                      id='batchCode'
                      name='batchCode'
                      value={formData.batchCode}
                      onChange={handleInputChange}
                      placeholder='B001'
                    />
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='supplier'>Supplier</Label>
                    <Input
                      id='supplier'
                      name='supplier'
                      value={formData.supplier}
                      onChange={handleInputChange}
                      placeholder='Supplier name'
                    />
                  </div>
                </div>

                <div className='space-y-4 border-t pt-4'>
                  <h4 className='font-medium text-sm'>Purchased (What you bought)</h4>
                  <div className='grid grid-cols-2 gap-4'>
                    <div className='space-y-2'>
                      <Label htmlFor='purchasedSize'>
                        Purchased Size <span className='text-red-500'>*</span>
                      </Label>
                      <Input
                        id='purchasedSize'
                        name='purchasedSize'
                        type='number'
                        step='0.01'
                        value={formData.purchasedSize}
                        onChange={handleInputChange}
                        placeholder='0'
                        required
                      />
                    </div>

                    <div className='space-y-2'>
                      <Label htmlFor='purchasedUnit'>
                        Purchased Unit <span className='text-red-500'>*</span>
                      </Label>
                      <Select
                        value={formData.purchasedUnit}
                        onValueChange={(value) =>
                          setFormData((prev) => ({ ...prev, purchasedUnit: value }))
                        }
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder='Select unit' />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value='kg'>kg</SelectItem>
                          <SelectItem value='g'>g</SelectItem>
                          <SelectItem value='liter'>liter</SelectItem>
                          <SelectItem value='ml'>ml</SelectItem>
                          <SelectItem value='piece'>piece</SelectItem>
                          <SelectItem value='pack'>pack</SelectItem>
                          <SelectItem value='dozen'>dozen</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className='grid grid-cols-2 gap-4'>
                  <div className='space-y-2'>
                    <Label htmlFor='totalCost'>
                      Total Cost (₹) <span className='text-red-500'>*</span>
                    </Label>
                    <Input
                      id='totalCost'
                      name='totalCost'
                      type='number'
                      step='0.01'
                      value={formData.totalCost}
                      onChange={handleInputChange}
                      placeholder='0.00'
                      required
                    />
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='averageCostPerQuantity'>
                      Average Cost Per Quantity (₹)
                    </Label>
                    <Input
                      id='averageCostPerQuantity'
                      name='averageCostPerQuantity'
                      type='number'
                      step='0.01'
                      value={averageCostPerQuantity > 0 ? averageCostPerQuantity.toFixed(2) : ''}
                      disabled
                      className='bg-muted'
                      placeholder='Auto-calculated'
                    />
                    <p className='text-xs text-muted-foreground'>
                      Auto-generated from Total Cost ÷ Quantity Purchased
                    </p>
                  </div>
                </div>

                <div className='grid grid-cols-2 gap-4'>
                  <div className='space-y-2'>
                    <Label htmlFor='quantityPurchased'>
                      Quantity Purchased <span className='text-red-500'>*</span>
                    </Label>
                    <Input
                      id='quantityPurchased'
                      name='quantityPurchased'
                      type='number'
                      value={formData.quantityPurchased}
                      onChange={handleInputChange}
                      placeholder='0'
                      required
                    />
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='expiryDate'>Expiry Date</Label>
                    <Input
                      id='expiryDate'
                      name='expiryDate'
                      type='date'
                      value={formData.expiryDate}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className='space-y-4 border-t pt-4'>
                  <div className='flex items-center justify-between'>
                    <h4 className='font-medium text-sm'>Selling Variants (Multiple variants with different prices)</h4>
                    <Button
                      type='button'
                      variant='outline'
                      size='sm'
                      onClick={addSellingVariant}
                    >
                      <Plus className='h-4 w-4 mr-1' />
                      Add Variant
                    </Button>
                  </div>
                  {product?.variants && product.variants.length > 0 && (
                    <p className='text-xs text-muted-foreground mb-2'>
                      Product variants (for reference): {product.variants.map((v: any) => `${v.size} ${v.unit}`).join(', ')}. You can create any selling variants regardless of product variants.
                    </p>
                  )}
                  {sellingVariants.map((sv, index) => (
                    <div key={index} className='border rounded-lg p-4 space-y-3'>
                      <div className='flex items-center justify-between mb-2'>
                        <h5 className='font-medium text-sm'>Variant {index + 1}</h5>
                        {sellingVariants.length > 1 && (
                          <Button
                            type='button'
                            variant='ghost'
                            size='sm'
                            onClick={() => removeSellingVariant(index)}
                          >
                            <Trash2 className='h-4 w-4 text-red-500' />
                          </Button>
                        )}
                      </div>
                      <div className='grid grid-cols-2 gap-4'>
                        <div className='space-y-2'>
                          <Label>
                            Size <span className='text-red-500'>*</span>
                          </Label>
                          <Input
                            type='number'
                            step='0.01'
                            value={sv.sellingSize || ''}
                            onChange={(e) => updateSellingVariant(index, 'sellingSize', parseFloat(e.target.value) || 0)}
                            placeholder='0'
                            required
                          />
                        </div>
                        <div className='space-y-2'>
                          <Label>
                            Unit <span className='text-red-500'>*</span>
                          </Label>
                          <Select
                            value={sv.sellingUnit}
                            onValueChange={(value) => updateSellingVariant(index, 'sellingUnit', value)}
                            required
                          >
                            <SelectTrigger>
                              <SelectValue placeholder='Select unit' />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value='kg'>kg</SelectItem>
                              <SelectItem value='g'>g</SelectItem>
                              <SelectItem value='liter'>liter</SelectItem>
                              <SelectItem value='ml'>ml</SelectItem>
                              <SelectItem value='piece'>piece</SelectItem>
                              <SelectItem value='pack'>pack</SelectItem>
                              <SelectItem value='dozen'>dozen</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className='grid grid-cols-2 gap-4'>
                        <div className='space-y-2'>
                          <Label>
                            Original Price (₹) <span className='text-red-500'>*</span>
                          </Label>
                          <Input
                            type='number'
                            step='0.01'
                            value={sv.originalPrice || ''}
                            onChange={(e) => updateSellingVariant(index, 'originalPrice', parseFloat(e.target.value) || 0)}
                            placeholder='0.00'
                            required
                          />
                        </div>
                        <div className='space-y-2'>
                          <Label>
                            Selling Price (₹) <span className='text-red-500'>*</span>
                          </Label>
                          <Input
                            type='number'
                            step='0.01'
                            value={sv.sellingPrice || ''}
                            onChange={(e) => updateSellingVariant(index, 'sellingPrice', parseFloat(e.target.value) || 0)}
                            placeholder='0.00'
                            required
                          />
                        </div>
                      </div>
                      <div className='grid grid-cols-2 gap-4'>
                        <div className='space-y-2'>
                          <Label>Discount (%)</Label>
                          <Input
                            type='number'
                            step='0.01'
                            value={sv.discount || ''}
                            disabled
                            className='bg-muted'
                            placeholder='Auto-calculated'
                          />
                        </div>
                        <div className='space-y-2'>
                          <Label>
                            Quantity Available <span className='text-red-500'>*</span>
                          </Label>
                          <Input
                            type='number'
                            value={sv.quantityAvailable || ''}
                            onChange={(e) => updateSellingVariant(index, 'quantityAvailable', parseFloat(e.target.value) || 0)}
                            placeholder='0'
                            required
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

              </div>

              {error && (
                <div className='bg-red-50 border border-red-200 text-red-600 rounded-md p-3 mb-4'>
                  {error}
                </div>
              )}

              <DialogFooter>
                <Button
                  type='button'
                  variant='outline'
                  onClick={handleCloseDialog}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button type='submit' disabled={loading} className='bg-emerald-600 hover:bg-emerald-700'>
                  {loading ? (
                    <>
                      <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                      {editingBatch ? 'Updating...' : 'Creating...'}
                    </>
                  ) : editingBatch ? (
                    'Update Batch'
                  ) : (
                    'Create Batch'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the batch
                {batchToDelete?.batchCode && ` "${batchToDelete.batchCode}"`}.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                disabled={loading}
                className='bg-red-600 hover:bg-red-700'
              >
                {loading ? (
                  <>
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    Deleting...
                  </>
                ) : (
                  'Delete'
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </main>
    </div>
  );
}


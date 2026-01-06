'use client';

import * as React from 'react';
import {
  MoreHorizontal,
  Search,
  Filter,
  Pencil,
  Trash2,
  Plus,
  X,
  Loader2,
  Package,
} from 'lucide-react';
import Image from 'next/image';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { storeProductAPI, storeAPI, productAPI } from '@/lib/api';
import { StoreProductForm } from './store-product-form';
import { Switch } from '@/components/ui/switch';

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
    location?:
      | {
          type: 'Point';
          coordinates: [number, number]; // [lng, lat]
        }
      | string;
  };
  productId: {
    _id: string;
    name: string;
    images?: string[];
  };
  variants: StoreProductVariant[];
  isActive: boolean;
  isFeatured?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface Store {
  _id: string;
  name: string;
  location?:
    | {
        type: 'Point';
        coordinates: [number, number]; // [lng, lat]
      }
    | string;
}

export function StoreProductsTable() {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [storeFilter, setStoreFilter] = React.useState('all');
  const [storeProducts, setStoreProducts] = React.useState<StoreProduct[]>([]);
  const [stores, setStores] = React.useState<Store[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [page, setPage] = React.useState(1);
  const [total, setTotal] = React.useState(0);
  const [limit] = React.useState(20);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [storeProductToDelete, setStoreProductToDelete] =
    React.useState<StoreProduct | null>(null);
  const [deleting, setDeleting] = React.useState(false);
  const [formDialogOpen, setFormDialogOpen] = React.useState(false);
  const [editingStoreProduct, setEditingStoreProduct] =
    React.useState<StoreProduct | null>(null);

  // Fetch store products
  React.useEffect(() => {
    fetchStoreProducts();
  }, [page, searchTerm, storeFilter]);

  // Fetch stores on mount
  React.useEffect(() => {
    fetchStores();
  }, []);

  const fetchStoreProducts = async () => {
    try {
      setLoading(true);
      const params: any = {
        page,
        limit,
      };

      if (storeFilter && storeFilter !== 'all') {
        params.storeId = storeFilter;
      }

      const response = await storeProductAPI.getAll(params);

      if (response.success && response.data) {
        const productsData = Array.isArray(response.data) ? response.data : [];
        // Filter by search term if provided
        let filteredData = productsData;
        if (searchTerm.trim()) {
          filteredData = productsData.filter(
            (sp: StoreProduct) =>
              sp.productId?.name
                ?.toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
              sp.storeId?.name?.toLowerCase().includes(searchTerm.toLowerCase())
          );
        }
        setStoreProducts(filteredData);
        setTotal(response.meta?.total || filteredData.length);
      } else {
        setStoreProducts([]);
        setTotal(0);
      }
    } catch (error) {
      console.error('Error fetching store products:', error);
      setStoreProducts([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  const fetchStores = async () => {
    try {
      const response = await storeAPI.getAll();
      if (response.success && response.data) {
        setStores(Array.isArray(response.data) ? response.data : []);
      }
    } catch (error) {
      console.error('Error fetching stores:', error);
    }
  };

  const hasActiveFilters = storeFilter !== 'all' || searchTerm !== '';

  const clearFilters = () => {
    setSearchTerm('');
    setStoreFilter('all');
    setPage(1);
  };

  const handleDelete = async () => {
    if (!storeProductToDelete) return;
    try {
      setDeleting(true);
      const response = await storeProductAPI.delete(storeProductToDelete._id);
      if (response.success) {
        setDeleteDialogOpen(false);
        setStoreProductToDelete(null);
        fetchStoreProducts();
      } else {
        alert(response.message || 'Failed to delete store product');
      }
    } catch (error: any) {
      alert(
        error.response?.data?.message ||
          'An error occurred while deleting the store product'
      );
    } finally {
      setDeleting(false);
    }
  };

  const handleEdit = (storeProduct: StoreProduct) => {
    setEditingStoreProduct(storeProduct);
    setFormDialogOpen(true);
  };

  const handleAdd = () => {
    setEditingStoreProduct(null);
    setFormDialogOpen(true);
  };

  const handleFormClose = () => {
    setFormDialogOpen(false);
    setEditingStoreProduct(null);
  };

  const handleFormSuccess = () => {
    setFormDialogOpen(false);
    setEditingStoreProduct(null);
    fetchStoreProducts();
  };

  const handleToggleFeatured = async (storeProduct: StoreProduct) => {
    try {
      const newFeaturedStatus = !storeProduct.isFeatured;
      const response = await storeProductAPI.update(storeProduct._id, {
        isFeatured: newFeaturedStatus,
      });
      if (response.success) {
        fetchStoreProducts();
      } else {
        alert(response.message || 'Failed to update featured status');
      }
    } catch (error: any) {
      alert(
        error.response?.data?.message ||
          'An error occurred while updating featured status'
      );
    }
  };

  const getProductImage = (storeProduct: StoreProduct): string => {
    if (
      storeProduct.productId?.images &&
      storeProduct.productId.images.length > 0
    ) {
      return storeProduct.productId.images[0];
    }
    return '/placeholder.jpg';
  };

  const getTotalVariants = (storeProduct: StoreProduct): number => {
    return storeProduct.variants?.length || 0;
  };

  const getAvailableVariants = (storeProduct: StoreProduct): number => {
    return storeProduct.variants?.filter((v) => v.isAvailable).length || 0;
  };

  const getMRPRange = (storeProduct: StoreProduct): string => {
    if (!storeProduct.variants || storeProduct.variants.length === 0) {
      return 'N/A';
    }
    const mrps = storeProduct.variants.map((v) => v.mrp);
    const min = Math.min(...mrps);
    const max = Math.max(...mrps);
    if (min === max) {
      return `₹${min.toFixed(2)}`;
    }
    return `₹${min.toFixed(2)} - ₹${max.toFixed(2)}`;
  };

  const getSellingPriceRange = (storeProduct: StoreProduct): string => {
    if (!storeProduct.variants || storeProduct.variants.length === 0) {
      return 'N/A';
    }
    const prices = storeProduct.variants.map((v) => v.sellingPrice);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    if (min === max) {
      return `₹${min.toFixed(2)}`;
    }
    return `₹${min.toFixed(2)} - ₹${max.toFixed(2)}`;
  };

  const getDiscountRange = (storeProduct: StoreProduct): string => {
    if (!storeProduct.variants || storeProduct.variants.length === 0) {
      return 'N/A';
    }
    const discounts = storeProduct.variants.map((v) => v.discount);
    const min = Math.min(...discounts);
    const max = Math.max(...discounts);
    if (min === max) {
      return `${min.toFixed(1)}%`;
    }
    return `${min.toFixed(1)}% - ${max.toFixed(1)}%`;
  };

  return (
    <>
      <Card className='border-none shadow-md bg-white overflow-hidden'>
        <div className='p-6 space-y-4 border-b border-slate-100'>
          <div className='flex flex-col md:flex-row gap-4 justify-between'>
            {/* Search */}
            <div className='relative flex-1 md:max-w-md'>
              <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
              <Input
                placeholder='Search products or stores...'
                className='pl-10 bg-slate-50 border-slate-200 focus-visible:ring-emerald-500 focus-visible:border-emerald-500 transition-all'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className='absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600'
                >
                  <X className='h-4 w-4' />
                </button>
              )}
            </div>

            {/* Filters and Add Button */}
            <div className='flex flex-wrap gap-3 items-center'>
              <Select value={storeFilter} onValueChange={setStoreFilter}>
                <SelectTrigger className='w-[180px] bg-slate-50 border-slate-200 focus:ring-emerald-500'>
                  <div className='flex items-center gap-2 text-slate-600'>
                    <Filter className='h-3.5 w-3.5' />
                    <SelectValue placeholder='Store' />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>All Stores</SelectItem>
                  {stores.map((store) => (
                    <SelectItem key={store._id} value={store._id}>
                      {store.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {hasActiveFilters && (
                <Button
                  variant='ghost'
                  size='sm'
                  className='text-muted-foreground hover:text-red-600 hover:bg-red-50'
                  onClick={clearFilters}
                >
                  Clear
                </Button>
              )}

              <Button
                size='lg'
                className='bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all hover:shadow-md'
                onClick={handleAdd}
              >
                <Plus className='mr-2 h-5 w-5' />
                Add Product
              </Button>
            </div>
          </div>
        </div>

        <div className='relative w-full overflow-auto'>
          <Table>
            <TableHeader className='bg-slate-50/50'>
              <TableRow className='hover:bg-transparent border-slate-100'>
                <TableHead className='w-[250px] text-xs font-semibold uppercase tracking-wider text-slate-500 pl-6 h-12'>
                  Product
                </TableHead>
                <TableHead className='text-xs font-semibold uppercase tracking-wider text-slate-500 h-12'>
                  Store
                </TableHead>
                <TableHead className='text-xs font-semibold uppercase tracking-wider text-slate-500 h-12'>
                  Variants
                </TableHead>
                <TableHead className='text-xs font-semibold uppercase tracking-wider text-slate-500 h-12'>
                  MRP
                </TableHead>
                <TableHead className='text-xs font-semibold uppercase tracking-wider text-slate-500 h-12'>
                  Selling Price
                </TableHead>
                <TableHead className='text-xs font-semibold uppercase tracking-wider text-slate-500 h-12'>
                  Discount
                </TableHead>
                <TableHead className='text-xs font-semibold uppercase tracking-wider text-slate-500 h-12'>
                  Status
                </TableHead>
                <TableHead className='text-xs font-semibold uppercase tracking-wider text-slate-500 h-12'>
                  Featured
                </TableHead>
                <TableHead className='w-[50px] h-12'></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className='h-24 text-center'>
                    <div className='flex flex-col items-center justify-center py-8'>
                      <Loader2 className='h-6 w-6 animate-spin text-emerald-600 mb-2' />
                      <p className='text-sm text-slate-600'>
                        Loading store products...
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : storeProducts.length > 0 ? (
                storeProducts.map((storeProduct) => (
                  <TableRow
                    key={storeProduct._id}
                    className='group hover:bg-slate-50/80 transition-colors border-slate-100'
                  >
                    <TableCell className='pl-6 py-3'>
                      <div className='flex items-center gap-4'>
                        <div className='relative h-10 w-10 rounded-lg overflow-hidden border border-slate-100 bg-white shadow-sm group-hover:shadow-md transition-all'>
                          <Image
                            src={getProductImage(storeProduct)}
                            alt={storeProduct.productId?.name || 'Product'}
                            fill
                            className='object-cover'
                            unoptimized
                          />
                        </div>
                        <div className='flex flex-col'>
                          <span className='font-medium text-slate-900 text-sm'>
                            {storeProduct.productId?.name || 'Unnamed Product'}
                          </span>
                          <span className='text-xs text-slate-500'>
                            {getTotalVariants(storeProduct)} variant
                            {getTotalVariants(storeProduct) !== 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className='flex flex-col'>
                        <span className='text-sm text-slate-900'>
                          {storeProduct.storeId?.name || 'Unknown Store'}
                        </span>
                        {storeProduct.storeId?.location && (
                          <span className='text-xs text-slate-500'>
                            {typeof storeProduct.storeId.location === 'string'
                              ? storeProduct.storeId.location
                              : storeProduct.storeId.location.coordinates
                              ? `${storeProduct.storeId.location.coordinates[1].toFixed(
                                  4
                                )}, ${storeProduct.storeId.location.coordinates[0].toFixed(
                                  4
                                )}`
                              : ''}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className='flex flex-col gap-1'>
                        <Badge
                          variant='secondary'
                          className='bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-100 font-normal shadow-none w-fit'
                        >
                          {getTotalVariants(storeProduct)} Total
                        </Badge>
                        <Badge
                          variant='secondary'
                          className='bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-100 font-normal shadow-none w-fit'
                        >
                          {getAvailableVariants(storeProduct)} Available
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className='text-sm text-slate-900 font-medium'>
                        {getMRPRange(storeProduct)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className='text-sm text-slate-900 font-medium'>
                        {getSellingPriceRange(storeProduct)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className='text-sm text-emerald-600 font-medium'>
                        {getDiscountRange(storeProduct)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          storeProduct.isActive ? 'default' : 'secondary'
                        }
                        className={
                          storeProduct.isActive
                            ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-100'
                            : 'bg-slate-100 text-slate-600'
                        }
                      >
                        {storeProduct.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className='flex items-center'>
                        <Switch
                          checked={storeProduct.isFeatured || false}
                          onCheckedChange={() =>
                            handleToggleFeatured(storeProduct)
                          }
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant='ghost'
                            className='h-8 w-8 p-0 text-slate-400 hover:text-slate-600 data-[state=open]:bg-slate-100 focus-visible:ring-1 focus-visible:ring-slate-300'
                          >
                            <span className='sr-only'>Open menu</span>
                            <MoreHorizontal className='h-4 w-4' />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align='end' className='w-[160px]'>
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className='cursor-pointer'
                            onClick={() => handleEdit(storeProduct)}
                          >
                            <Pencil className='mr-2 h-3.5 w-3.5 text-slate-500' />{' '}
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className='cursor-pointer text-red-600 focus:text-red-600'
                            onClick={() => {
                              setStoreProductToDelete(storeProduct);
                              setDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className='mr-2 h-3.5 w-3.5' /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={9} className='h-24 text-center'>
                    <div className='flex flex-col items-center justify-center py-8'>
                      <Package className='h-12 w-12 text-slate-300 mb-2' />
                      <p className='text-sm font-medium text-slate-600 mb-1'>
                        No store products found
                      </p>
                      <p className='text-xs text-slate-500'>
                        {hasActiveFilters
                          ? 'Try adjusting your filters'
                          : 'Get started by adding a product to a store'}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {total > limit && (
          <div className='p-4 border-t border-slate-100 flex items-center justify-between'>
            <p className='text-sm text-slate-600'>
              Showing {(page - 1) * limit + 1} to{' '}
              {Math.min(page * limit, total)} of {total} store products
            </p>
            <div className='flex gap-2'>
              <Button
                variant='outline'
                size='sm'
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <Button
                variant='outline'
                size='sm'
                onClick={() => setPage((p) => p + 1)}
                disabled={page * limit >= total}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the store product. This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className='bg-red-600 hover:bg-red-700'
            >
              {deleting ? (
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

      {/* Add/Edit Form Dialog */}
      <Dialog open={formDialogOpen} onOpenChange={handleFormClose}>
        <DialogContent className='max-w-4xl max-h-[90vh] overflow-y-auto'>
          <DialogHeader>
            <DialogTitle>
              {editingStoreProduct ? 'Edit Store Product' : 'Add Store Product'}
            </DialogTitle>
            <DialogDescription>
              {editingStoreProduct
                ? 'Update product variants, pricing, and availability for this store'
                : 'Select a store and product, then configure variants with pricing'}
            </DialogDescription>
          </DialogHeader>
          <StoreProductForm
            storeProduct={editingStoreProduct}
            onSuccess={handleFormSuccess}
            onCancel={handleFormClose}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}

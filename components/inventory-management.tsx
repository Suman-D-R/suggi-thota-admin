'use client';

import * as React from 'react';
import { useState, useEffect, useCallback } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import {
  Plus,
  Package,
  AlertTriangle,
  Loader2,
  Edit,
  Trash2,
} from 'lucide-react';
import {
  storeAPI,
  storeProductAPI,
  inventoryBatchAPI,
  productAPI,
} from '@/lib/api';
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

interface Store {
  _id: string;
  name: string;
}

interface StoreProductVariant {
  sku: string;
  size: number;
  unit: string;
  mrp: number;
  sellingPrice: number;
  discount: number;
  isAvailable: boolean;
}

interface StoreProduct {
  _id: string;
  storeId?: string | { _id: string; name?: string };
  productId: {
    _id: string;
    name: string;
    images?: string[];
    category?: any;
  };
  variants: StoreProductVariant[];
  isActive: boolean;
}

interface StoreProductRow {
  _id: string;
  storeProductId: string; // ID of the StoreProduct (for editing)
  productId: {
    _id: string;
    name: string;
  };
  variantSku: string;
  mrp: number;
  sellingPrice: number;
  discount: number;
  stock: number;
  isAvailable: boolean;
}

interface Product {
  _id: string;
  name: string;
  variants?: Array<{ sku: string; size: number; unit: string }>;
}

interface InventoryBatch {
  _id: string;
  storeId?: string | { _id: string; name?: string };
  productId: string | { _id: string; name: string };
  variantSku?: string;
  initialQuantity: number;
  availableQuantity: number;
  costPrice: number;
  usesSharedStock?: boolean;
  baseUnit?: 'kg' | 'g' | 'ml' | 'liter' | 'piece' | 'pack';
  batchNumber?: string;
  supplier?: string;
  purchaseDate?: string | Date;
  expiryDate?: string | Date;
  notes?: string;
  status?: string;
  createdAt: string;
}

export function InventoryManagement() {
  const [selectedStore, setSelectedStore] = useState<string>('all');
  const [stores, setStores] = useState<Store[]>([]);
  const [storeProducts, setStoreProducts] = useState<StoreProduct[]>([]);
  const [storeProductRows, setStoreProductRows] = useState<StoreProductRow[]>(
    []
  );
  const [batches, setBatches] = useState<InventoryBatch[]>([]);
  const [loading, setLoading] = useState(false);
  const [batchesLoading, setBatchesLoading] = useState(false);
  const [grnDialogOpen, setGrnDialogOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [storeProductToDelete, setStoreProductToDelete] = useState<
    string | null
  >(null);
  const [editingStoreProduct, setEditingStoreProduct] =
    useState<StoreProduct | null>(null);
  const [grnFormData, setGrnFormData] = useState({
    productId: '',
    storeProductId: '',
    usesSharedStock: false,
    variantSku: '',
    baseUnit: 'kg' as 'kg' | 'g' | 'ml' | 'liter' | 'piece' | 'pack',
    initialQuantity: 0,
    costPrice: 0,
    batchNumber: '',
    supplier: '',
    purchaseDate: new Date().toISOString().split('T')[0],
    expiryDate: '',
    notes: '',
  });
  const [grnLoading, setGrnLoading] = useState(false);
  const [availableStoreProducts, setAvailableStoreProducts] = useState<
    StoreProduct[]
  >([]);
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
  const [activeTab, setActiveTab] = useState<string>('products');

  // Dummy stores data
  const dummyStores: Store[] = [
    { _id: '1', name: 'Store 1 - Downtown' },
    { _id: '2', name: 'Store 2 - Malleshwaram' },
    { _id: '3', name: 'Dark Store - Warehouse' },
  ];

  // Helper function to get storeId from storeProduct
  const getStoreIdFromProduct = (product: StoreProduct): string | null => {
    if (!product.storeId) return null;
    if (typeof product.storeId === 'string') return product.storeId;
    if (typeof product.storeId === 'object' && product.storeId._id) {
      return product.storeId._id;
    }
    return null;
  };

  // Helper function to get storeId from batch
  const getStoreIdFromBatch = (batch: InventoryBatch): string | null => {
    if (!batch.storeId) return null;
    if (typeof batch.storeId === 'string') return batch.storeId;
    if (typeof batch.storeId === 'object' && (batch.storeId as any)._id) {
      return (batch.storeId as any)._id;
    }
    return null;
  };

  // Transform store products with variants to flat rows and calculate stock from batches
  const transformStoreProducts = useCallback(
    (
      products: StoreProduct[],
      batchesData: InventoryBatch[]
    ): StoreProductRow[] => {
      const rows: StoreProductRow[] = [];

      products.forEach((product) => {
        if (!product.isActive) return;

        const productIdStr = product.productId._id;
        const storeIdStr = getStoreIdFromProduct(product);

        // Filter batches by storeId - CRITICAL: Each store should only see its own stock
        const storeBatches = batchesData.filter((batch) => {
          const batchStoreId = getStoreIdFromBatch(batch);
          return batchStoreId === storeIdStr;
        });

        // Check if this product has shared stock batches for this store
        const sharedStockBatches = storeBatches.filter((batch) => {
          if (!batch.productId || batch.status !== 'active') return false;
          const batchProductId =
            typeof batch.productId === 'string'
              ? batch.productId
              : batch.productId._id;
          return (
            batchProductId === productIdStr && batch.usesSharedStock === true
          );
        });

        // Calculate shared stock if any shared stock batches exist
        const sharedStock = sharedStockBatches.reduce((sum, batch) => {
          const isExpired =
            batch.expiryDate && new Date(batch.expiryDate) < new Date();
          return sum + (isExpired ? 0 : batch.availableQuantity || 0);
        }, 0);

        // Use shared stock for all variants if shared stock exists
        const hasSharedStock = sharedStock > 0 || sharedStockBatches.length > 0;

        product.variants.forEach((variant) => {
          let stock = 0;

          if (hasSharedStock) {
            // Use shared stock for all variants
            stock = sharedStock;
          } else {
            // Calculate stock from variant-specific batches for this store
            const variantBatches = storeBatches.filter((batch) => {
              if (!batch.productId || batch.status !== 'active') return false;
              const batchProductId =
                typeof batch.productId === 'string'
                  ? batch.productId
                  : batch.productId._id;
              return (
                batchProductId === productIdStr &&
                batch.variantSku === variant.sku &&
                batch.usesSharedStock !== true
              );
            });

            // Sum available quantity from active, non-expired batches
            stock = variantBatches.reduce((sum, batch) => {
              const isExpired =
                batch.expiryDate && new Date(batch.expiryDate) < new Date();
              return sum + (isExpired ? 0 : batch.availableQuantity || 0);
            }, 0);
          }

          rows.push({
            _id: `${product._id}-${variant.sku}`,
            storeProductId: product._id, // Store the StoreProduct ID for editing
            productId: {
              _id: product.productId._id,
              name: product.productId.name,
            },
            variantSku: variant.sku,
            mrp: variant.mrp || 0,
            sellingPrice: variant.sellingPrice,
            discount: variant.discount || 0,
            stock: stock,
            isAvailable: variant.isAvailable,
          });
        });
      });

      return rows;
    },
    []
  );

  useEffect(() => {
    loadStores();
  }, []);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const response = await productAPI.getAll({ isActive: true });
      const productsData = Array.isArray(response.data) ? response.data : [];
      setProducts(productsData);
    } catch (error) {
      console.error('Failed to load products:', error);
    }
  };

  useEffect(() => {
    loadStoreProducts();
    loadBatches();
    // Reset GRN form when store changes
    setGrnFormData({
      productId: '',
      storeProductId: '',
      usesSharedStock: false,
      variantSku: '',
      baseUnit: 'kg',
      initialQuantity: 0,
      costPrice: 0,
      batchNumber: '',
      supplier: '',
      purchaseDate: new Date().toISOString().split('T')[0],
      expiryDate: '',
      notes: '',
    });
    if (selectedStore === 'all') {
      setAvailableStoreProducts([]);
    }
  }, [selectedStore]);

  // Update available store products when storeProducts changes
  useEffect(() => {
    if (selectedStore !== 'all') {
      // Backend already filters by storeId and isActive, but we verify here
      // Also ensure we only show products that have at least one variant
      const filtered = storeProducts.filter((sp) => {
        const storeId = getStoreIdFromProduct(sp);
        const matchesStore = storeId === selectedStore;
        const isActive = sp.isActive !== false; // Default to true if not specified
        const hasVariants = sp.variants && sp.variants.length > 0;
        return matchesStore && isActive && hasVariants;
      });
      console.log(
        'Available store products:',
        filtered.length,
        'out of',
        storeProducts.length,
        'for store:',
        selectedStore
      );
      setAvailableStoreProducts(filtered);
    } else {
      setAvailableStoreProducts([]);
    }
  }, [storeProducts, selectedStore]);

  // Transform store products to rows when batches or store products change
  useEffect(() => {
    if (storeProducts.length > 0) {
      setStoreProductRows(transformStoreProducts(storeProducts, batches));
    } else {
      setStoreProductRows([]);
    }
  }, [storeProducts, batches, transformStoreProducts]);

  const loadStores = async () => {
    try {
      const response = await storeAPI.getAll();
      const storesData = Array.isArray(response.data)
        ? response.data
        : dummyStores;
      setStores(storesData);
    } catch (error) {
      console.error('Failed to load stores:', error);
      setStores(dummyStores);
    }
  };

  const loadStoreProducts = async () => {
    setLoading(true);
    try {
      let response;
      if (selectedStore === 'all') {
        // Fetch all store products with high limit to get all
        response = await storeProductAPI.getAll({ limit: 1000 });
      } else {
        // Fetch store products for specific store
        response = await storeProductAPI.getByStore(selectedStore);
      }

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
      console.log(
        'Loaded store products:',
        productsData.length,
        'for store:',
        selectedStore
      );
      setStoreProducts(productsData);
    } catch (error) {
      console.error('Failed to load store products:', error);
      setStoreProducts([]);
      setStoreProductRows([]);
    } finally {
      setLoading(false);
    }
  };

  const loadBatches = async () => {
    setBatchesLoading(true);
    try {
      let response;
      if (selectedStore === 'all') {
        // Fetch all batches with high limit to get all
        response = await inventoryBatchAPI.getAll({ limit: 1000 });
      } else {
        // Fetch batches for specific store
        response = await inventoryBatchAPI.getAll({
          storeId: selectedStore,
          limit: 1000,
        });
      }
      // Handle API response structure - Backend returns paginated response: { data: [...], page, limit, total }
      const batchesData = Array.isArray(response.data)
        ? response.data
        : Array.isArray(response)
        ? response
        : [];
      setBatches(batchesData);
    } catch (error) {
      console.error('Failed to load batches:', error);
      setBatches([]);
    } finally {
      setBatchesLoading(false);
    }
  };

  const lowStockProducts = Array.isArray(storeProductRows)
    ? storeProductRows.filter((sp) => sp.stock < 20)
    : [];

  // Handler functions for add/edit/delete
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
    // Auto-calculate discount if MRP or selling price changes
    if (field === 'mrp' || field === 'sellingPrice') {
      const mrp = field === 'mrp' ? value : newVariants[index].mrp || 0;
      const sellingPrice =
        field === 'sellingPrice' ? value : newVariants[index].sellingPrice || 0;
      newVariants[index].discount =
        mrp > 0 && sellingPrice > 0 ? ((mrp - sellingPrice) / mrp) * 100 : 0;
    }
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

  const handleEdit = (storeProductId: string) => {
    const storeProduct = storeProducts.find((sp) => sp._id === storeProductId);
    if (storeProduct) {
      setEditingStoreProduct(storeProduct);
      setFormData({
        productId: storeProduct.productId._id,
        variants: storeProduct.variants.map((v) => ({
          ...v,
          unit: v.unit as 'kg' | 'g' | 'ml' | 'liter' | 'piece' | 'pack',
        })),
        isActive: storeProduct.isActive,
      });
      setDialogOpen(true);
    }
  };

  const handleDelete = (storeProductId: string) => {
    setStoreProductToDelete(storeProductId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!storeProductToDelete) return;
    try {
      await storeProductAPI.delete(storeProductToDelete);
      setDeleteDialogOpen(false);
      setStoreProductToDelete(null);
      loadStoreProducts();
    } catch (error) {
      console.error('Failed to delete store product:', error);
      alert('Failed to delete store product. Please try again.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedStore === 'all') {
      alert('Please select a specific store to add/edit products');
      return;
    }

    if (!formData.productId || formData.variants.length === 0) {
      alert('Please select a product and add at least one variant');
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
          storeId: selectedStore,
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

  const handleDialogClose = () => {
    setDialogOpen(false);
    setEditingStoreProduct(null);
    setFormData({
      productId: '',
      variants: [],
      isActive: true,
    });
  };

  // GRN form handlers
  const handleGrnProductSelect = (storeProductId: string) => {
    const storeProduct = availableStoreProducts.find(
      (sp) => sp._id === storeProductId
    );
    if (storeProduct) {
      setGrnFormData({
        ...grnFormData,
        storeProductId: storeProductId,
        productId: storeProduct.productId._id,
        variantSku:
          storeProduct.variants.length === 1
            ? storeProduct.variants[0].sku
            : '',
        // Default to shared stock if product has multiple variants or only one variant that can be sold in multiple ways
        usesSharedStock: storeProduct.variants.length > 0,
        baseUnit:
          storeProduct.variants.length > 0
            ? (storeProduct.variants[0].unit as
                | 'kg'
                | 'g'
                | 'ml'
                | 'liter'
                | 'piece'
                | 'pack')
            : 'kg',
      });
    }
  };

  const handleGrnStockTypeChange = (usesSharedStock: boolean) => {
    setGrnFormData({
      ...grnFormData,
      usesSharedStock,
      variantSku: usesSharedStock
        ? ''
        : availableStoreProducts.find(
            (sp) => sp._id === grnFormData.storeProductId
          )?.variants[0]?.sku || '',
    });
  };

  const handleGrnSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedStore === 'all') {
      alert('Please select a specific store to add stock');
      return;
    }

    if (!grnFormData.storeProductId) {
      alert('Please select a product');
      return;
    }

    if (!grnFormData.usesSharedStock && !grnFormData.variantSku) {
      alert('Please select a variant for variant-specific stock');
      return;
    }

    if (grnFormData.usesSharedStock && !grnFormData.baseUnit) {
      alert('Please select a base unit for shared stock');
      return;
    }

    if (grnFormData.initialQuantity <= 0) {
      alert('Please enter a valid quantity');
      return;
    }

    if (grnFormData.costPrice <= 0) {
      alert('Please enter a valid cost price');
      return;
    }

    try {
      setGrnLoading(true);
      const batchData: any = {
        storeId: selectedStore,
        productId: grnFormData.productId,
        initialQuantity: grnFormData.initialQuantity,
        costPrice: grnFormData.costPrice,
        usesSharedStock: grnFormData.usesSharedStock,
      };

      if (!grnFormData.usesSharedStock && grnFormData.variantSku) {
        batchData.variantSku = grnFormData.variantSku;
      }

      if (grnFormData.usesSharedStock && grnFormData.baseUnit) {
        batchData.baseUnit = grnFormData.baseUnit;
      }

      if (grnFormData.batchNumber)
        batchData.batchNumber = grnFormData.batchNumber;
      if (grnFormData.supplier) batchData.supplier = grnFormData.supplier;
      if (grnFormData.purchaseDate)
        batchData.purchaseDate = grnFormData.purchaseDate;
      if (grnFormData.expiryDate) batchData.expiryDate = grnFormData.expiryDate;
      if (grnFormData.notes) batchData.notes = grnFormData.notes;

      await inventoryBatchAPI.create(batchData);

      // Reset form
      setGrnFormData({
        productId: '',
        storeProductId: '',
        usesSharedStock: false,
        variantSku: '',
        baseUnit: 'kg',
        initialQuantity: 0,
        costPrice: 0,
        batchNumber: '',
        supplier: '',
        purchaseDate: new Date().toISOString().split('T')[0],
        expiryDate: '',
        notes: '',
      });

      // Reload batches and store products
      await loadBatches();
      await loadStoreProducts();

      alert('Stock added successfully!');
    } catch (error: any) {
      console.error('Failed to add stock:', error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to add stock. Please try again.';
      alert(errorMessage);
    } finally {
      setGrnLoading(false);
    }
  };

  // Helper function to safely get product name from productId
  const getProductName = (
    productId: string | { _id: string; name: string } | null | undefined
  ): string => {
    if (!productId) return 'N/A';
    if (typeof productId === 'string') return productId;
    if (typeof productId === 'object' && 'name' in productId)
      return productId.name;
    return 'N/A';
  };

  return (
    <div className='space-y-6'>
      <Card>
        <CardHeader>
          <CardTitle>Store Selector</CardTitle>
          <CardDescription>
            Select a store to manage its inventory
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedStore} onValueChange={setSelectedStore}>
            <SelectTrigger className='w-full max-w-sm'>
              <SelectValue placeholder='Select a store' />
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
        </CardContent>
      </Card>

      {selectedStore && (
        <>
          {lowStockProducts.length > 0 && (
            <Card className='border-orange-200 bg-orange-50'>
              <CardHeader>
                <CardTitle className='flex items-center gap-2 text-orange-700'>
                  <AlertTriangle className='h-5 w-5' />
                  Low Stock Alerts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-2'>
                  {lowStockProducts.map((product) => (
                    <div
                      key={product._id}
                      className='flex justify-between items-center'
                    >
                      <span className='font-medium'>
                        {product.productId.name} ({product.variantSku})
                      </span>
                      <Badge
                        variant='outline'
                        className='text-orange-700 border-orange-300'
                      >
                        Only {product.stock} left
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className='space-y-4'
          >
            <TabsList>
              <TabsTrigger value='products'>Store Products</TabsTrigger>
              <TabsTrigger value='batches'>Batches</TabsTrigger>
              <TabsTrigger value='grn'>Add Stock (GRN)</TabsTrigger>
            </TabsList>

            <TabsContent value='products' className='space-y-4'>
              <Card>
                <CardHeader>
                  <div className='flex items-center justify-between'>
                    <div>
                      <CardTitle>Store Products</CardTitle>
                      <CardDescription>
                        Manage products, pricing, and availability
                        {selectedStore === 'all'
                          ? ' across all stores'
                          : ' for this store'}
                      </CardDescription>
                    </div>
                    {selectedStore !== 'all' && (
                      <Dialog
                        open={dialogOpen}
                        onOpenChange={handleDialogClose}
                      >
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
                            Add Product
                          </Button>
                        </DialogTrigger>
                      </Dialog>
                    )}
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
                          <TableHead>Variant</TableHead>
                          <TableHead>MRP</TableHead>
                          <TableHead>Selling Price</TableHead>
                          <TableHead>Discount</TableHead>
                          <TableHead>Stock</TableHead>
                          <TableHead>Availability</TableHead>
                          {selectedStore !== 'all' && (
                            <TableHead className='text-right'>
                              Actions
                            </TableHead>
                          )}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {Array.isArray(storeProductRows) &&
                        storeProductRows.length > 0 ? (
                          (() => {
                            const seenStoreProductIds = new Set<string>();
                            return storeProductRows.map((sp) => {
                              const isFirstVariant = !seenStoreProductIds.has(
                                sp.storeProductId
                              );
                              if (isFirstVariant) {
                                seenStoreProductIds.add(sp.storeProductId);
                              }
                              return (
                                <TableRow key={sp._id}>
                                  <TableCell className='font-medium'>
                                    {sp.productId.name}
                                  </TableCell>
                                  <TableCell>{sp.variantSku}</TableCell>
                                  <TableCell>₹{sp.mrp}</TableCell>
                                  <TableCell>₹{sp.sellingPrice}</TableCell>
                                  <TableCell>{sp.discount}%</TableCell>
                                  <TableCell>
                                    <Badge
                                      variant={
                                        sp.stock < 20
                                          ? 'destructive'
                                          : 'default'
                                      }
                                    >
                                      {sp.stock}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>
                                    <Badge
                                      variant={
                                        sp.isAvailable ? 'default' : 'secondary'
                                      }
                                    >
                                      {sp.isAvailable
                                        ? 'Available'
                                        : 'Unavailable'}
                                    </Badge>
                                  </TableCell>
                                  {selectedStore !== 'all' && (
                                    <TableCell className='text-right'>
                                      {isFirstVariant && (
                                        <div className='flex justify-end gap-2'>
                                          <Button
                                            variant='ghost'
                                            size='sm'
                                            onClick={() =>
                                              handleEdit(sp.storeProductId)
                                            }
                                          >
                                            <Edit className='h-4 w-4' />
                                          </Button>
                                          <Button
                                            variant='ghost'
                                            size='sm'
                                            onClick={() =>
                                              handleDelete(sp.storeProductId)
                                            }
                                          >
                                            <Trash2 className='h-4 w-4 text-red-500' />
                                          </Button>
                                        </div>
                                      )}
                                    </TableCell>
                                  )}
                                </TableRow>
                              );
                            });
                          })()
                        ) : (
                          <TableRow>
                            <TableCell
                              colSpan={selectedStore !== 'all' ? 8 : 7}
                              className='text-center text-muted-foreground py-8'
                            >
                              No products found
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value='batches' className='space-y-4'>
              <Card>
                <CardHeader>
                  <div className='flex items-center justify-between'>
                    <div>
                      <CardTitle>Inventory Batches</CardTitle>
                      <CardDescription>
                        View all inventory batches for this store
                      </CardDescription>
                    </div>
                    {selectedStore !== 'all' && (
                      <Button
                        onClick={() => {
                          setActiveTab('grn');
                        }}
                      >
                        <Plus className='mr-2 h-4 w-4' />
                        Add Stock
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {batchesLoading ? (
                    <div className='flex items-center justify-center py-8'>
                      <Loader2 className='h-6 w-6 animate-spin text-emerald-600' />
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Batch Number</TableHead>
                          <TableHead>Product</TableHead>
                          <TableHead>Stock Type</TableHead>
                          <TableHead>Variant SKU / Base Unit</TableHead>
                          <TableHead>Initial Quantity</TableHead>
                          <TableHead>Available Quantity</TableHead>
                          <TableHead>Cost Price</TableHead>
                          <TableHead>Purchase Date</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {Array.isArray(batches) && batches.length > 0 ? (
                          batches.map((batch) => (
                            <TableRow key={batch._id}>
                              <TableCell className='font-medium'>
                                {batch.batchNumber || 'N/A'}
                              </TableCell>
                              <TableCell>
                                {getProductName(batch.productId)}
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant={
                                    batch.usesSharedStock
                                      ? 'secondary'
                                      : 'outline'
                                  }
                                >
                                  {batch.usesSharedStock
                                    ? 'Shared Stock'
                                    : 'Variant-Specific'}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {batch.usesSharedStock
                                  ? batch.baseUnit
                                    ? `${batch.baseUnit} (shared)`
                                    : 'N/A'
                                  : batch.variantSku || 'N/A'}
                              </TableCell>
                              <TableCell>
                                {batch.initialQuantity || 0}
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant={
                                    (batch.availableQuantity || 0) === 0
                                      ? 'destructive'
                                      : 'default'
                                  }
                                >
                                  {batch.availableQuantity || 0}
                                </Badge>
                              </TableCell>
                              <TableCell>₹{batch.costPrice || 0}</TableCell>
                              <TableCell>
                                {batch.purchaseDate
                                  ? new Date(
                                      batch.purchaseDate
                                    ).toLocaleDateString()
                                  : 'N/A'}
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant={
                                    batch.status === 'active'
                                      ? 'default'
                                      : batch.status === 'expired'
                                      ? 'destructive'
                                      : batch.status === 'depleted'
                                      ? 'secondary'
                                      : 'outline'
                                  }
                                >
                                  {batch.status || 'N/A'}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell
                              colSpan={9}
                              className='text-center text-muted-foreground py-8'
                            >
                              No batches found
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value='grn' className='space-y-4'>
              <Card>
                <CardHeader>
                  <CardTitle>Add Stock (GRN - Goods Receipt Note)</CardTitle>
                  <CardDescription>
                    Record new inventory batch for{' '}
                    {selectedStore === 'all'
                      ? 'a store (select a store first)'
                      : 'this store'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {selectedStore === 'all' ? (
                    <div className='text-center py-8 text-muted-foreground'>
                      Please select a specific store to add stock
                    </div>
                  ) : loading ? (
                    <div className='flex items-center justify-center py-8'>
                      <Loader2 className='h-6 w-6 animate-spin text-emerald-600' />
                      <span className='ml-2 text-muted-foreground'>
                        Loading products...
                      </span>
                    </div>
                  ) : availableStoreProducts.length === 0 ? (
                    <div className='text-center py-8 space-y-4'>
                      <Package className='h-12 w-12 mx-auto text-muted-foreground' />
                      <div className='space-y-2'>
                        <p className='text-muted-foreground'>
                          No products found for this store.
                        </p>
                        <p className='text-sm text-muted-foreground'>
                          Please add products to this store first from the
                          "Store Products" tab.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleGrnSubmit} className='space-y-4'>
                      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                        <div className='space-y-2 md:col-span-2'>
                          <Label htmlFor='grnProduct'>Product *</Label>
                          <Select
                            value={grnFormData.storeProductId}
                            onValueChange={handleGrnProductSelect}
                            disabled={
                              loading || availableStoreProducts.length === 0
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder='Select a product' />
                            </SelectTrigger>
                            <SelectContent>
                              {availableStoreProducts.map((sp) => (
                                <SelectItem key={sp._id} value={sp._id}>
                                  {sp.productId.name}
                                  {sp.variants.length > 0 && (
                                    <span className='text-xs text-muted-foreground ml-2'>
                                      ({sp.variants.length} variant
                                      {sp.variants.length > 1 ? 's' : ''})
                                    </span>
                                  )}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {availableStoreProducts.length > 0 && (
                            <p className='text-xs text-muted-foreground'>
                              {availableStoreProducts.length} product
                              {availableStoreProducts.length > 1
                                ? 's'
                                : ''}{' '}
                              available
                            </p>
                          )}
                        </div>

                        {grnFormData.storeProductId && (
                          <>
                            <div className='space-y-2 md:col-span-2'>
                              <Label>Stock Type *</Label>
                              <div className='flex gap-4'>
                                <label className='flex items-center space-x-2 cursor-pointer'>
                                  <input
                                    type='radio'
                                    checked={!grnFormData.usesSharedStock}
                                    onChange={() =>
                                      handleGrnStockTypeChange(false)
                                    }
                                    className='h-4 w-4'
                                  />
                                  <span>Variant-Specific Stock</span>
                                </label>
                                <label className='flex items-center space-x-2 cursor-pointer'>
                                  <input
                                    type='radio'
                                    checked={grnFormData.usesSharedStock}
                                    onChange={() =>
                                      handleGrnStockTypeChange(true)
                                    }
                                    className='h-4 w-4'
                                  />
                                  <span>
                                    Shared Stock (for products sold by
                                    weight/volume)
                                  </span>
                                </label>
                              </div>
                              <p className='text-xs text-muted-foreground'>
                                {grnFormData.usesSharedStock
                                  ? 'Stock shared across all variants (e.g., vegetables sold by weight)'
                                  : 'Separate stock for each variant (e.g., rice 1kg, 5kg packages)'}
                              </p>
                            </div>

                            {!grnFormData.usesSharedStock && (
                              <div className='space-y-2'>
                                <Label htmlFor='grnVariant'>
                                  Variant SKU *
                                </Label>
                                <Select
                                  value={grnFormData.variantSku}
                                  onValueChange={(value) =>
                                    setGrnFormData({
                                      ...grnFormData,
                                      variantSku: value,
                                    })
                                  }
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder='Select variant' />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {availableStoreProducts
                                      .find(
                                        (sp) =>
                                          sp._id === grnFormData.storeProductId
                                      )
                                      ?.variants.map((variant) => (
                                        <SelectItem
                                          key={variant.sku}
                                          value={variant.sku}
                                        >
                                          {variant.sku} ({variant.size}{' '}
                                          {variant.unit})
                                        </SelectItem>
                                      ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            )}

                            {grnFormData.usesSharedStock && (
                              <div className='space-y-2'>
                                <Label htmlFor='grnBaseUnit'>Base Unit *</Label>
                                <Select
                                  value={grnFormData.baseUnit}
                                  onValueChange={(value) =>
                                    setGrnFormData({
                                      ...grnFormData,
                                      baseUnit: value as
                                        | 'kg'
                                        | 'g'
                                        | 'ml'
                                        | 'liter'
                                        | 'piece'
                                        | 'pack',
                                    })
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
                            )}

                            <div className='space-y-2'>
                              <Label htmlFor='grnQuantity'>
                                Initial Quantity *
                              </Label>
                              <Input
                                id='grnQuantity'
                                type='number'
                                step='0.01'
                                min='0'
                                value={
                                  grnFormData.initialQuantity > 0
                                    ? String(grnFormData.initialQuantity)
                                    : ''
                                }
                                onChange={(e) =>
                                  setGrnFormData({
                                    ...grnFormData,
                                    initialQuantity:
                                      parseFloat(e.target.value) || 0,
                                  })
                                }
                                placeholder='Enter quantity'
                                required
                              />
                            </div>

                            <div className='space-y-2'>
                              <Label htmlFor='grnCostPrice'>
                                Cost Price (per unit) *
                              </Label>
                              <Input
                                id='grnCostPrice'
                                type='number'
                                step='0.01'
                                min='0'
                                value={
                                  grnFormData.costPrice > 0
                                    ? String(grnFormData.costPrice)
                                    : ''
                                }
                                onChange={(e) =>
                                  setGrnFormData({
                                    ...grnFormData,
                                    costPrice: parseFloat(e.target.value) || 0,
                                  })
                                }
                                placeholder='Enter cost price'
                                required
                              />
                            </div>

                            <div className='space-y-2'>
                              <Label htmlFor='grnBatchNumber'>
                                Batch/GRN Number
                              </Label>
                              <Input
                                id='grnBatchNumber'
                                value={grnFormData.batchNumber}
                                onChange={(e) =>
                                  setGrnFormData({
                                    ...grnFormData,
                                    batchNumber: e.target.value,
                                  })
                                }
                                placeholder='Enter batch number (optional)'
                              />
                            </div>

                            <div className='space-y-2'>
                              <Label htmlFor='grnSupplier'>Supplier</Label>
                              <Input
                                id='grnSupplier'
                                value={grnFormData.supplier}
                                onChange={(e) =>
                                  setGrnFormData({
                                    ...grnFormData,
                                    supplier: e.target.value,
                                  })
                                }
                                placeholder='Enter supplier name (optional)'
                              />
                            </div>

                            <div className='space-y-2'>
                              <Label htmlFor='grnPurchaseDate'>
                                Purchase Date
                              </Label>
                              <Input
                                id='grnPurchaseDate'
                                type='date'
                                value={grnFormData.purchaseDate}
                                onChange={(e) =>
                                  setGrnFormData({
                                    ...grnFormData,
                                    purchaseDate: e.target.value,
                                  })
                                }
                              />
                            </div>

                            <div className='space-y-2'>
                              <Label htmlFor='grnExpiryDate'>Expiry Date</Label>
                              <Input
                                id='grnExpiryDate'
                                type='date'
                                value={grnFormData.expiryDate}
                                onChange={(e) =>
                                  setGrnFormData({
                                    ...grnFormData,
                                    expiryDate: e.target.value,
                                  })
                                }
                              />
                            </div>

                            <div className='space-y-2 md:col-span-2'>
                              <Label htmlFor='grnNotes'>Notes</Label>
                              <Input
                                id='grnNotes'
                                value={grnFormData.notes}
                                onChange={(e) =>
                                  setGrnFormData({
                                    ...grnFormData,
                                    notes: e.target.value,
                                  })
                                }
                                placeholder='Additional notes (optional)'
                              />
                            </div>
                          </>
                        )}
                      </div>

                      <Button
                        type='submit'
                        className='w-full'
                        disabled={
                          grnLoading ||
                          !grnFormData.storeProductId ||
                          (!grnFormData.usesSharedStock &&
                            !grnFormData.variantSku) ||
                          (grnFormData.usesSharedStock &&
                            !grnFormData.baseUnit) ||
                          grnFormData.initialQuantity <= 0 ||
                          grnFormData.costPrice <= 0
                        }
                      >
                        {grnLoading ? (
                          <>
                            <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                            Adding Stock...
                          </>
                        ) : (
                          <>
                            <Plus className='mr-2 h-4 w-4' />
                            Add Stock
                          </>
                        )}
                      </Button>
                    </form>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}

      {/* Dialog for Add/Edit Store Product */}
      {selectedStore !== 'all' && (
        <Dialog open={dialogOpen} onOpenChange={handleDialogClose}>
          <DialogContent className='max-w-3xl max-h-[90vh] overflow-y-auto'>
            <DialogHeader>
              <DialogTitle>
                {editingStoreProduct ? 'Edit Product' : 'Add Product'}
              </DialogTitle>
              <DialogDescription>
                {editingStoreProduct
                  ? 'Edit product variants and pricing for this store'
                  : 'Select a product and configure its variants with pricing for this store'}
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
                        Click "Add Variant" to create a variant for this product
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
                                  value={
                                    variant.mrp > 0 ? String(variant.mrp) : ''
                                  }
                                  onChange={(e) => {
                                    const value =
                                      parseFloat(e.target.value) || 0;
                                    handleVariantChange(index, 'mrp', value);
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
                                    const value =
                                      parseFloat(e.target.value) || 0;
                                    handleVariantChange(
                                      index,
                                      'sellingPrice',
                                      value
                                    );
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
      )}

      {/* Alert Dialog for Delete Confirmation */}
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
              onClick={confirmDelete}
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

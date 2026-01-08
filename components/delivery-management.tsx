'use client';

import * as React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, Truck, MapPin, Clock, Pencil, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { deliveryAgentAPI, storeAPI, orderAPI } from '@/lib/api';

interface DeliveryAgent {
  id: string;
  name: string;
  phone: string;
  email?: string;
  isActive: boolean;
  store?: {
    id: string;
    name: string;
  };
  stats?: {
    totalDeliveries: number;
    completedDeliveries: number;
    averageRating: number;
  };
}

interface Store {
  _id: string;
  name: string;
  isActive: boolean;
}

interface PendingOrder {
  id: string;
  orderNumber: string;
  customer: {
    name: string;
    phone: string;
    email?: string;
  };
  store: string;
  storeId: string;
  deliveryAddress: any;
  total: number;
  status: string;
  timeElapsed: string;
  estimatedDeliveryTime?: number;
  paymentMethod?: string;
  paymentStatus?: string;
}

export function DeliveryManagement() {
  const [deliveryPartners, setDeliveryPartners] = React.useState<
    DeliveryAgent[]
  >([]);
  const [stores, setStores] = React.useState<Store[]>([]);
  const [pendingOrders, setPendingOrders] = React.useState<PendingOrder[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [loadingOrders, setLoadingOrders] = React.useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = React.useState(false);
  const [formError, setFormError] = React.useState('');
  const [formData, setFormData] = React.useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    storeId: '',
  });

  // Fetch delivery agents
  const fetchDeliveryAgents = React.useCallback(async () => {
    try {
      setLoading(true);
      const response = await deliveryAgentAPI.getAll();
      if (response.success) {
        const agents = response.data.agents.map((agent: any) => ({
          id: agent._id,
          name: agent.name,
          phone: agent.phone,
          email: agent.email,
          isActive: agent.isActive,
        }));
        setDeliveryPartners(agents);
      }
    } catch (error: any) {
      console.error('Failed to fetch delivery agents:', error);
      // Silent error - no toast notification
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch stores
  const fetchStores = React.useCallback(async () => {
    try {
      const response = await storeAPI.getAll({ isActive: true });
      if (response.success) {
        setStores(response.data);
      }
    } catch (error: any) {
      console.error('Failed to fetch stores:', error);
      // Silent error - no toast notification
    }
  }, []);

  // Fetch pending orders
  const fetchPendingOrders = React.useCallback(async () => {
    try {
      setLoadingOrders(true);
      // Fetch orders that are ready for assignment (pending, confirmed, preparing, ready)
      const response = await orderAPI.getAll({
        status: undefined, // Get all statuses, we'll filter client-side
      });
      if (response.success) {
        const allOrders = response.data || [];
        // Filter for orders that can be assigned (pending, confirmed, preparing, ready)
        const assignableStatuses = [
          'pending',
          'confirmed',
          'preparing',
          'ready',
        ];
        const orders = allOrders.filter((order: any) =>
          assignableStatuses.includes(order.status?.toLowerCase())
        );
        setPendingOrders(orders);
      }
    } catch (error: any) {
      console.error('Failed to fetch pending orders:', error);
      // Silent error - no toast notification
    } finally {
      setLoadingOrders(false);
    }
  }, []);

  // Load data on mount
  React.useEffect(() => {
    fetchDeliveryAgents();
    fetchStores();
    fetchPendingOrders();
  }, [fetchDeliveryAgents, fetchStores, fetchPendingOrders]);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setFormError(''); // Clear error when user types
  };

  // Handle store selection
  const handleStoreChange = (value: string) => {
    setFormData({ ...formData, storeId: value });
    setFormError(''); // Clear error when user selects
  };

  // Handle form submission
  const handleCreateAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted with data:', formData);
    setFormError(''); // Clear any previous errors

    // Validation
    if (
      !formData.name ||
      !formData.phone ||
      !formData.password ||
      !formData.storeId
    ) {
      console.log('Validation failed: missing required fields');
      setFormError('Please fill in all required fields');
      return;
    }

    // Validate phone format
    if (!formData.phone.startsWith('+')) {
      console.log('Validation failed: phone format');
      setFormError(
        'Phone number must be in international format (e.g., +919876543210)'
      );
      return;
    }

    // Validate password length
    if (formData.password.length < 6) {
      console.log('Validation failed: password length');
      setFormError('Password must be at least 6 characters long');
      return;
    }

    try {
      setLoading(true);
      console.log('Calling API to create agent...');
      const response = await deliveryAgentAPI.create({
        name: formData.name,
        phone: formData.phone,
        email: formData.email || undefined,
        password: formData.password,
        storeId: formData.storeId,
      });

      console.log('API response:', response);

      if (response.success) {
        // Success - close dialog and refresh list
        setIsCreateDialogOpen(false);
        setFormData({
          name: '',
          phone: '',
          email: '',
          password: '',
          storeId: '',
        });
        setFormError('');
        fetchDeliveryAgents();
      }
    } catch (error: any) {
      console.error('Error creating agent:', error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'Failed to create delivery agent';
      setFormError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Delivery zones feature - to be implemented with API
  const [deliveryZones, setDeliveryZones] = React.useState<any[]>([]);

  return (
    <div className='space-y-6'>
      <Tabs defaultValue='partners' className='space-y-4'>
        <TabsList>
          <TabsTrigger value='partners'>Delivery Partners</TabsTrigger>
          <TabsTrigger value='assignments'>Order Assignment</TabsTrigger>
          <TabsTrigger value='zones'>Delivery Zones</TabsTrigger>
          <TabsTrigger value='eta'>ETA Management</TabsTrigger>
        </TabsList>

        <TabsContent value='partners' className='space-y-4'>
          <Card>
            <CardHeader>
              <div className='flex items-center justify-between'>
                <div>
                  <CardTitle>Delivery Partners</CardTitle>
                  <CardDescription>
                    Manage delivery partners and their performance
                  </CardDescription>
                </div>
                <Dialog
                  open={isCreateDialogOpen}
                  onOpenChange={(open) => {
                    setIsCreateDialogOpen(open);
                    if (!open) setFormError('');
                  }}
                >
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className='mr-2 h-4 w-4' />
                      Add Partner
                    </Button>
                  </DialogTrigger>
                  <DialogContent className='sm:max-w-[500px]'>
                    <form onSubmit={handleCreateAgent}>
                      <DialogHeader>
                        <DialogTitle>Create Delivery Agent</DialogTitle>
                        <DialogDescription>
                          Create a new delivery agent account. The phone number
                          will be used as the agent ID.
                        </DialogDescription>
                      </DialogHeader>
                      <div className='grid gap-4 py-4'>
                        <div className='grid gap-2'>
                          <Label htmlFor='name'>
                            Name <span className='text-red-500'>*</span>
                          </Label>
                          <Input
                            id='name'
                            name='name'
                            placeholder='Enter agent name'
                            value={formData.name}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                        <div className='grid gap-2'>
                          <Label htmlFor='phone'>
                            Phone Number <span className='text-red-500'>*</span>
                          </Label>
                          <Input
                            id='phone'
                            name='phone'
                            type='tel'
                            placeholder='+919876543210'
                            value={formData.phone}
                            onChange={handleInputChange}
                            required
                          />
                          <p className='text-xs text-slate-500'>
                            Use international format (e.g., +919876543210). This
                            will be the agent ID.
                          </p>
                        </div>
                        <div className='grid gap-2'>
                          <Label htmlFor='email'>Email (Optional)</Label>
                          <Input
                            id='email'
                            name='email'
                            type='email'
                            placeholder='agent@example.com'
                            value={formData.email}
                            onChange={handleInputChange}
                          />
                        </div>
                        <div className='grid gap-2'>
                          <Label htmlFor='password'>
                            Password <span className='text-red-500'>*</span>
                          </Label>
                          <Input
                            id='password'
                            name='password'
                            type='password'
                            placeholder='Enter password (min. 6 characters)'
                            value={formData.password}
                            onChange={handleInputChange}
                            required
                            minLength={6}
                          />
                        </div>
                        <div className='grid gap-2'>
                          <Label htmlFor='storeId'>
                            Assigned Store{' '}
                            <span className='text-red-500'>*</span>
                          </Label>
                          <Select
                            value={formData.storeId}
                            onValueChange={handleStoreChange}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder='Select a store' />
                            </SelectTrigger>
                            <SelectContent>
                              {stores.length === 0 ? (
                                <div className='p-2 text-sm text-slate-500'>
                                  No active stores found
                                </div>
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
                      </div>
                      {formError && (
                        <div className='rounded-md bg-red-50 p-3 mt-2'>
                          <p className='text-sm text-red-600'>{formError}</p>
                        </div>
                      )}
                      <DialogFooter>
                        <Button
                          type='button'
                          variant='outline'
                          onClick={() => {
                            setIsCreateDialogOpen(false);
                            setFormError('');
                          }}
                          disabled={loading}
                        >
                          Cancel
                        </Button>
                        <Button type='submit' disabled={loading}>
                          {loading ? 'Creating...' : 'Create Agent'}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {loading && deliveryPartners.length === 0 ? (
                <div className='flex items-center justify-center py-8'>
                  <p className='text-slate-500'>Loading delivery agents...</p>
                </div>
              ) : deliveryPartners.length === 0 ? (
                <div className='flex items-center justify-center py-8'>
                  <p className='text-slate-500'>
                    No delivery agents found. Create one to get started.
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Phone (Agent ID)</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {deliveryPartners.map((partner) => (
                      <TableRow key={partner.id}>
                        <TableCell className='font-medium'>
                          {partner.name}
                        </TableCell>
                        <TableCell>{partner.phone}</TableCell>
                        <TableCell>{partner.email || '-'}</TableCell>
                        <TableCell>
                          <Badge
                            variant={partner.isActive ? 'default' : 'secondary'}
                          >
                            {partner.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className='flex items-center gap-2'>
                            <Button variant='outline' size='sm'>
                              <Pencil className='h-4 w-4' />
                            </Button>
                            <Button variant='outline' size='sm'>
                              <Trash2 className='h-4 w-4' />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='assignments' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>Order Assignment</CardTitle>
              <CardDescription>
                Assign orders to delivery partners
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingOrders ? (
                <div className='flex items-center justify-center py-8'>
                  <p className='text-slate-500'>Loading pending orders...</p>
                </div>
              ) : pendingOrders.length === 0 ? (
                <div className='flex items-center justify-center py-8'>
                  <p className='text-slate-500'>No pending orders found.</p>
                </div>
              ) : (
                <div className='space-y-4'>
                  {pendingOrders.map((order) => (
                    <Card key={order.id} className='p-4'>
                      <div className='flex items-start justify-between'>
                        <div className='space-y-2 flex-1'>
                          <div className='flex items-center gap-2'>
                            <span className='font-semibold'>
                              {order.orderNumber}
                            </span>
                            <Badge variant='outline'>{order.status}</Badge>
                          </div>
                          <p className='text-sm text-slate-600'>
                            Customer:{' '}
                            {order.customer?.name ||
                              (typeof order.customer === 'string'
                                ? order.customer
                                : 'Unknown')}
                            {order.customer?.phone && (
                              <span className='ml-2 text-slate-500'>
                                ({order.customer.phone})
                              </span>
                            )}
                          </p>
                          <p className='text-sm text-slate-600'>
                            Store: {order.store || 'Unknown Store'}
                          </p>
                          {order.deliveryAddress && (
                            <div className='space-y-1'>
                              <div className='flex items-center gap-2 text-sm text-slate-600'>
                                <MapPin className='h-4 w-4' />
                                {typeof order.deliveryAddress === 'object'
                                  ? `${order.deliveryAddress.street || ''}, ${
                                      order.deliveryAddress.city || ''
                                    }, ${order.deliveryAddress.state || ''} - ${
                                      order.deliveryAddress.pincode || ''
                                    }`.trim()
                                  : String(order.deliveryAddress)}
                              </div>
                              {typeof order.deliveryAddress === 'object' &&
                                order.deliveryAddress.coordinates && (
                                  <div className='flex items-center gap-2 text-xs text-slate-500 pl-6'>
                                    <span>
                                      📍 Location:{' '}
                                      {order.deliveryAddress.coordinates.latitude?.toFixed(
                                        6
                                      )}
                                      ,{' '}
                                      {order.deliveryAddress.coordinates.longitude?.toFixed(
                                        6
                                      )}
                                    </span>
                                    <a
                                      href={`https://www.google.com/maps?q=${order.deliveryAddress.coordinates.latitude},${order.deliveryAddress.coordinates.longitude}`}
                                      target='_blank'
                                      rel='noopener noreferrer'
                                      className='text-blue-600 hover:underline'
                                    >
                                      View on Map
                                    </a>
                                  </div>
                                )}
                            </div>
                          )}
                          <div className='flex items-center gap-2 text-sm text-slate-600'>
                            <Clock className='h-4 w-4' />
                            {order.timeElapsed
                              ? `Placed ${order.timeElapsed} ago`
                              : 'Time not available'}
                            {order.estimatedDeliveryTime && (
                              <span className='ml-2'>
                                • ETA:{' '}
                                {Math.ceil(order.estimatedDeliveryTime / 60)}{' '}
                                min
                              </span>
                            )}
                          </div>
                          <p className='text-sm font-medium text-slate-700'>
                            Total: ₹{order.total.toFixed(2)}
                          </p>
                        </div>
                        <div className='flex flex-col gap-2 ml-4'>
                          <Button
                            onClick={async () => {
                              // TODO: Implement assign partner functionality
                              // This should open a dialog to select a delivery partner
                              // and call orderAPI.assignDeliveryPartner(order.id, partnerId)
                            }}
                          >
                            Assign Partner
                          </Button>
                          {order.paymentStatus === 'pending' &&
                            order.paymentMethod === 'cod' && (
                              <Badge variant='outline' className='text-xs'>
                                COD Payment Pending
                              </Badge>
                            )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='zones' className='space-y-4'>
          <Card>
            <CardHeader>
              <div className='flex items-center justify-between'>
                <div>
                  <CardTitle>Delivery Zones</CardTitle>
                  <CardDescription>
                    Manage delivery zones and service areas
                  </CardDescription>
                </div>
                <Button disabled>
                  <Plus className='mr-2 h-4 w-4' />
                  Add Zone
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {deliveryZones.length === 0 ? (
                <div className='flex items-center justify-center py-8'>
                  <p className='text-slate-500'>
                    Delivery zones feature coming soon. This will allow you to
                    manage service areas and delivery coverage zones.
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Zone Name</TableHead>
                      <TableHead>Store</TableHead>
                      <TableHead>Radius</TableHead>
                      <TableHead>Avg Delivery Time</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {deliveryZones.map((zone) => (
                      <TableRow key={zone.id}>
                        <TableCell className='font-medium'>
                          {zone.name}
                        </TableCell>
                        <TableCell>{zone.store}</TableCell>
                        <TableCell>{zone.radius}</TableCell>
                        <TableCell>{zone.avgDeliveryTime}</TableCell>
                        <TableCell>
                          <Badge
                            variant={zone.active ? 'default' : 'secondary'}
                          >
                            {zone.active ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button variant='outline' size='sm'>
                            Edit
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='eta' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>ETA Management</CardTitle>
              <CardDescription>
                Configure estimated delivery times by zone and distance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                <p className='text-sm text-slate-600'>
                  ETA configuration will be available here. This will allow you
                  to set estimated delivery times based on zone, distance, and
                  time of day.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

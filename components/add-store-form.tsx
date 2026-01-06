'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { storeAPI } from '@/lib/api';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export function AddStoreForm() {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  // Form state
  const [formData, setFormData] = React.useState({
    name: '',
    latitude: '',
    longitude: '',
    serviceRadiusKm: '5',
    isActive: true,
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validate coordinates
      const lat = parseFloat(formData.latitude);
      const lng = parseFloat(formData.longitude);

      if (isNaN(lat) || isNaN(lng)) {
        setError('Please enter valid latitude and longitude values');
        setLoading(false);
        return;
      }

      if (lat < -90 || lat > 90) {
        setError('Latitude must be between -90 and 90');
        setLoading(false);
        return;
      }

      if (lng < -180 || lng > 180) {
        setError('Longitude must be between -180 and 180');
        setLoading(false);
        return;
      }

      const serviceRadius = parseFloat(formData.serviceRadiusKm);
      if (isNaN(serviceRadius) || serviceRadius <= 0) {
        setError('Service radius must be a positive number');
        setLoading(false);
        return;
      }

      const storeData = {
        name: formData.name,
        location: {
          type: 'Point',
          coordinates: [lng, lat], // [longitude, latitude]
        },
        serviceRadiusKm: serviceRadius,
        isActive: formData.isActive,
      };

      const response = await storeAPI.create(storeData);

      if (response.success) {
        setOpen(false);
        setFormData({
          name: '',
          latitude: '',
          longitude: '',
          serviceRadiusKm: '5',
          isActive: true,
        });
        router.refresh();
      } else {
        setError(
          response.message || 'Failed to create store'
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size='lg'
          className='bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all hover:shadow-md cursor-pointer'
        >
          <MapPin className='mr-2 h-5 w-5' />
          Add Store
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Store</DialogTitle>
          <DialogDescription>
            Create a new store location in your system
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className='space-y-6 py-4'>
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Store Information</CardTitle>
                <CardDescription>
                  Enter the basic details of your store
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='space-y-2'>
                  <Label htmlFor='name'>
                    Store Name <span className='text-red-500'>*</span>
                  </Label>
                  <Input
                    id='name'
                    name='name'
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder='e.g., Downtown Store, Malleshwaram Branch'
                    required
                  />
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div className='space-y-2'>
                    <Label htmlFor='latitude'>
                      Latitude <span className='text-red-500'>*</span>
                    </Label>
                    <Input
                      id='latitude'
                      name='latitude'
                      type='number'
                      step='any'
                      value={formData.latitude}
                      onChange={handleInputChange}
                      placeholder='12.9716'
                      required
                      min='-90'
                      max='90'
                    />
                    <p className='text-xs text-muted-foreground'>
                      Range: -90 to 90
                    </p>
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='longitude'>
                      Longitude <span className='text-red-500'>*</span>
                    </Label>
                    <Input
                      id='longitude'
                      name='longitude'
                      type='number'
                      step='any'
                      value={formData.longitude}
                      onChange={handleInputChange}
                      placeholder='77.5946'
                      required
                      min='-180'
                      max='180'
                    />
                    <p className='text-xs text-muted-foreground'>
                      Range: -180 to 180
                    </p>
                  </div>
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='serviceRadiusKm'>
                    Service Radius (km) <span className='text-red-500'>*</span>
                  </Label>
                  <Input
                    id='serviceRadiusKm'
                    name='serviceRadiusKm'
                    type='number'
                    step='0.1'
                    value={formData.serviceRadiusKm}
                    onChange={handleInputChange}
                    placeholder='5'
                    required
                    min='0.1'
                  />
                  <p className='text-xs text-muted-foreground'>
                    The maximum distance (in kilometers) this store can service
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Status */}
            <Card>
              <CardHeader>
                <CardTitle>Status</CardTitle>
                <CardDescription>
                  Control store visibility and availability
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='flex items-center justify-between'>
                  <div className='space-y-0.5'>
                    <Label htmlFor='isActive'>Active</Label>
                    <p className='text-sm text-muted-foreground'>
                      Make this store available for orders
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
          </div>
          <DialogFooter>
            <Button
              type='button'
              variant='outline'
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type='submit'
              disabled={loading}
              className='bg-emerald-600 hover:bg-emerald-700'
            >
              {loading ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  Creating...
                </>
              ) : (
                <>
                  <MapPin className='mr-2 h-4 w-4' />
                  Create Store
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}


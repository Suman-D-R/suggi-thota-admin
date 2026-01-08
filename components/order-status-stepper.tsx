'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
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
import { CheckCircle2, Circle, Clock, Package, Truck, XCircle, RotateCcw, DollarSign, UserPlus } from 'lucide-react';
import { orderAPI, deliveryAgentAPI } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
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

type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'out_for_delivery' | 'delivered' | 'cancelled' | 'refunded';

interface OrderStatusStepperProps {
  orderId: string;
  orderNumber: string;
  currentStatus: OrderStatus;
  paymentMethod?: 'cod' | 'online' | 'wallet';
  paymentStatus?: 'pending' | 'paid' | 'failed' | 'refunded';
  orderTotal?: number;
  deliveryPartner?: string;
  deliveryPartnerId?: string;
  onStatusUpdate?: (newStatus: OrderStatus) => void;
  onPaymentCollected?: () => void;
  onDeliveryPartnerAssigned?: () => void;
}

const statusConfig: Record<OrderStatus, { label: string; icon: React.ComponentType<{ className?: string }>; color: string }> = {
  pending: { label: 'Pending', icon: Clock, color: 'text-yellow-600' },
  confirmed: { label: 'Confirmed', icon: CheckCircle2, color: 'text-blue-600' },
  preparing: { label: 'Preparing', icon: Package, color: 'text-purple-600' },
  ready: { label: 'Ready', icon: Package, color: 'text-indigo-600' },
  out_for_delivery: { label: 'Out for Delivery', icon: Truck, color: 'text-green-600' },
  delivered: { label: 'Delivered', icon: CheckCircle2, color: 'text-emerald-600' },
  cancelled: { label: 'Cancelled', icon: XCircle, color: 'text-red-600' },
  refunded: { label: 'Refunded', icon: RotateCcw, color: 'text-orange-600' },
};

const statusFlow: OrderStatus[] = ['pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered'];

export function OrderStatusStepper({ 
  orderId, 
  orderNumber, 
  currentStatus, 
  paymentMethod = 'cod',
  paymentStatus = 'pending',
  orderTotal = 0,
  deliveryPartner,
  deliveryPartnerId,
  onStatusUpdate,
  onPaymentCollected,
  onDeliveryPartnerAssigned
}: OrderStatusStepperProps) {
  const [isUpdating, setIsUpdating] = React.useState(false);
  const [isCollectingPayment, setIsCollectingPayment] = React.useState(false);
  const [isAssigningPartner, setIsAssigningPartner] = React.useState(false);
  const [pendingStatus, setPendingStatus] = React.useState<OrderStatus | null>(null);
  const [showPaymentDialog, setShowPaymentDialog] = React.useState(false);
  const [showCancelDialog, setShowCancelDialog] = React.useState(false);
  const [showAssignDialog, setShowAssignDialog] = React.useState(false);
  const [paymentNotes, setPaymentNotes] = React.useState('');
  const [cancelReason, setCancelReason] = React.useState('');
  const [customCancelReason, setCustomCancelReason] = React.useState('');
  const [selectedPartnerId, setSelectedPartnerId] = React.useState('');
  const [deliveryPartners, setDeliveryPartners] = React.useState<Array<{ id: string; name: string; phone: string }>>([]);
  const [loadingPartners, setLoadingPartners] = React.useState(false);
  const { toast } = useToast();

  const isCOD = paymentMethod === 'cod';
  const isPaymentPending = paymentStatus === 'pending';
  const needsPaymentCollection = isCOD && isPaymentPending && (currentStatus === 'out_for_delivery' || currentStatus === 'ready');
  const canAssignPartner = (currentStatus === 'ready' || currentStatus === 'preparing' || currentStatus === 'confirmed') && !deliveryPartner;
  const needsPartnerAssignment = (currentStatus === 'ready' || currentStatus === 'preparing') && !deliveryPartner;

  const currentIndex = statusFlow.indexOf(currentStatus);
  const isCompleted = currentStatus === 'delivered';
  const isCancelled = currentStatus === 'cancelled' || currentStatus === 'refunded';

  const getNextStatus = (): OrderStatus | null => {
    if (isCancelled || isCompleted) return null;
    const nextIndex = currentIndex + 1;
    return nextIndex < statusFlow.length ? statusFlow[nextIndex] : null;
  };

  const handleStatusUpdate = async (newStatus: OrderStatus, reason?: string) => {
    // Check if trying to deliver COD order without payment
    if (newStatus === 'delivered' && isCOD && isPaymentPending) {
      toast({
        title: 'Payment Required',
        description: 'Please collect COD payment before marking order as delivered.',
        variant: 'destructive',
      });
      setShowPaymentDialog(true);
      setPendingStatus(null);
      return;
    }

    try {
      setIsUpdating(true);
      const response = await orderAPI.updateStatus(orderId, newStatus, reason);
      
      if (response.success) {
        toast({
          title: 'Status Updated',
          description: `Order ${orderNumber} status updated to ${statusConfig[newStatus].label}`,
        });
        onStatusUpdate?.(newStatus);
      } else {
        throw new Error(response.message || 'Failed to update status');
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update order status',
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
      setPendingStatus(null);
      setCancelReason('');
    }
  };

  const handleCancelClick = () => {
    setShowCancelDialog(true);
  };

  const handleCancelConfirm = () => {
    const finalReason = cancelReason === 'other' ? customCancelReason : cancelReason;
    
    if (!finalReason.trim()) {
      toast({
        title: 'Reason Required',
        description: 'Please provide a reason for cancellation',
        variant: 'destructive',
      });
      return;
    }
    setShowCancelDialog(false);
    handleStatusUpdate('cancelled', finalReason);
    setCancelReason('');
    setCustomCancelReason('');
  };

  const handleCollectPayment = async () => {
    try {
      setIsCollectingPayment(true);
      const response = await orderAPI.collectPayment(orderId, paymentNotes);
      
      if (response.success) {
        toast({
          title: 'Payment Collected',
          description: `Payment of ₹${orderTotal.toFixed(2)} collected successfully for order ${orderNumber}`,
        });
        setShowPaymentDialog(false);
        setPaymentNotes('');
        onPaymentCollected?.();
      } else {
        throw new Error(response.message || 'Failed to collect payment');
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to collect payment',
        variant: 'destructive',
      });
    } finally {
      setIsCollectingPayment(false);
    }
  };

  // Fetch delivery partners when assign dialog opens
  React.useEffect(() => {
    if (showAssignDialog && deliveryPartners.length === 0) {
      fetchDeliveryPartners();
    }
  }, [showAssignDialog]);

  const fetchDeliveryPartners = async () => {
    try {
      setLoadingPartners(true);
      const response = await deliveryAgentAPI.getAll({ isActive: true, limit: 100 });
      if (response.success && response.data?.agents) {
        setDeliveryPartners(response.data.agents.map((agent: any) => ({
          id: agent._id || agent.id,
          name: agent.name,
          phone: agent.phone,
        })));
      }
    } catch (error: any) {
      console.error('Failed to fetch delivery partners:', error);
      toast({
        title: 'Error',
        description: 'Failed to load delivery partners',
        variant: 'destructive',
      });
    } finally {
      setLoadingPartners(false);
    }
  };

  const handleAssignPartner = async () => {
    if (!selectedPartnerId) {
      toast({
        title: 'Partner Required',
        description: 'Please select a delivery partner',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsAssigningPartner(true);
      const response = await orderAPI.assignDeliveryPartner(orderId, selectedPartnerId);
      
      if (response.success) {
        toast({
          title: 'Partner Assigned',
          description: `Delivery partner assigned successfully for order ${orderNumber}`,
        });
        setShowAssignDialog(false);
        setSelectedPartnerId('');
        onDeliveryPartnerAssigned?.();
        // If status was ready, it might have changed to out_for_delivery
        if (response.data?.order?.status) {
          onStatusUpdate?.(response.data.order.status as OrderStatus);
        }
      } else {
        throw new Error(response.message || 'Failed to assign delivery partner');
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to assign delivery partner',
        variant: 'destructive',
      });
    } finally {
      setIsAssigningPartner(false);
    }
  };

  const nextStatus = getNextStatus();

  return (
    <div className="space-y-4">
      {/* Status Flow Visualization */}
      <div className="relative">
        <div className="flex items-center justify-between">
          {statusFlow.map((status, index) => {
            const config = statusConfig[status];
            const Icon = config.icon;
            const isActive = index === currentIndex;
            const isCompleted = index < currentIndex;
            const isUpcoming = index > currentIndex;
            const isClickable = index === currentIndex + 1 && !isCancelled && !isCompleted;

            return (
              <React.Fragment key={status}>
                <div className="flex flex-col items-center flex-1">
                  <button
                    type="button"
                    onClick={() => isClickable && setPendingStatus(status)}
                    disabled={!isClickable || isUpdating}
                    className={`
                      relative z-10 flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all
                      ${isCompleted ? 'bg-emerald-500 border-emerald-500 text-white' : ''}
                      ${isActive ? 'bg-blue-500 border-blue-500 text-white ring-4 ring-blue-200' : ''}
                      ${isUpcoming ? 'bg-slate-100 border-slate-300 text-slate-400' : ''}
                      ${isClickable ? 'hover:scale-110 cursor-pointer' : 'cursor-not-allowed'}
                      ${isUpdating ? 'opacity-50' : ''}
                    `}
                  >
                    <Icon className="w-5 h-5" />
                  </button>
                  <div className="mt-2 text-center">
                    <p className={`text-xs font-medium ${isActive ? 'text-blue-600' : isCompleted ? 'text-emerald-600' : 'text-slate-400'}`}>
                      {config.label}
                    </p>
                    {isActive && (
                      <p className="text-xs text-slate-500 mt-1">Current</p>
                    )}
                  </div>
                </div>
                {index < statusFlow.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 ${index < currentIndex ? 'bg-emerald-500' : 'bg-slate-200'}`} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Delivery Partner Assignment Alert */}
      {needsPartnerAssignment && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <div className="flex items-start gap-3">
            <UserPlus className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-semibold text-blue-900 mb-1">Delivery Partner Required</h4>
              <p className="text-sm text-blue-700 mb-3">
                Please assign a delivery partner before marking order as "Out for Delivery".
              </p>
              <Button
                onClick={() => setShowAssignDialog(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
                size="sm"
              >
                Assign Partner
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Current Delivery Partner Display */}
      {deliveryPartner && (
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-slate-600" />
              <div>
                <p className="text-sm font-medium text-slate-900">Delivery Partner</p>
                <p className="text-xs text-slate-600">{deliveryPartner}</p>
              </div>
            </div>
            {canAssignPartner && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAssignDialog(true)}
              >
                Change Partner
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Payment Collection Alert for COD */}
      {needsPaymentCollection && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
          <div className="flex items-start gap-3">
            <DollarSign className="w-5 h-5 text-amber-600 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-semibold text-amber-900 mb-1">Payment Collection Required</h4>
              <p className="text-sm text-amber-700 mb-3">
                This is a COD order. Please collect payment of <strong>₹{orderTotal.toFixed(2)}</strong> before marking as delivered.
              </p>
              <Button
                onClick={() => setShowPaymentDialog(true)}
                className="bg-amber-600 hover:bg-amber-700 text-white"
                size="sm"
              >
                Collect Payment
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {!isCancelled && !isCompleted && nextStatus && (
        <div className="flex gap-2 justify-center">
          <Button
            onClick={() => {
              // Check if trying to move to out_for_delivery without partner
              if (nextStatus === 'out_for_delivery' && !deliveryPartner) {
                toast({
                  title: 'Partner Required',
                  description: 'Please assign a delivery partner before marking as "Out for Delivery"',
                  variant: 'destructive',
                });
                setShowAssignDialog(true);
                return;
              }
              setPendingStatus(nextStatus);
            }}
            disabled={isUpdating || (nextStatus === 'delivered' && isCOD && isPaymentPending) || (nextStatus === 'out_for_delivery' && !deliveryPartner)}
            className="min-w-[140px]"
          >
            {isUpdating ? 'Updating...' : `Mark as ${statusConfig[nextStatus].label}`}
          </Button>
        </div>
      )}

      {/* Cancellation/Refund Actions */}
      {!isCompleted && !isCancelled && (
        <div className="flex gap-2 justify-center pt-2 border-t">
          <Button
            variant="destructive"
            size="sm"
            onClick={handleCancelClick}
            disabled={isUpdating}
          >
            Cancel Order
          </Button>
        </div>
      )}

      {/* Status Display for Cancelled/Refunded */}
      {(isCancelled || currentStatus === 'refunded') && (
        <div className="text-center py-2">
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${statusConfig[currentStatus].color} bg-opacity-10`}>
            {React.createElement(statusConfig[currentStatus].icon, { className: 'w-5 h-5' })}
            <span className="font-medium">{statusConfig[currentStatus].label}</span>
          </div>
        </div>
      )}

      {/* Payment Collection Dialog */}
      <AlertDialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Collect COD Payment</AlertDialogTitle>
            <AlertDialogDescription>
              Collect payment for order <strong>{orderNumber}</strong>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label className="text-sm font-medium">Amount to Collect</Label>
              <div className="mt-1 text-2xl font-bold text-slate-900">
                ₹{orderTotal.toFixed(2)}
              </div>
            </div>
            <div>
              <Label htmlFor="payment-notes">Notes (Optional)</Label>
              <Textarea
                id="payment-notes"
                placeholder="Add any notes about the payment collection..."
                value={paymentNotes}
                onChange={(e) => setPaymentNotes(e.target.value)}
                className="mt-1"
                rows={3}
              />
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isCollectingPayment}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCollectPayment}
              disabled={isCollectingPayment}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {isCollectingPayment ? 'Collecting...' : 'Confirm Payment Collected'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delivery Partner Assignment Dialog */}
      <AlertDialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Assign Delivery Partner</AlertDialogTitle>
            <AlertDialogDescription>
              Select a delivery partner for order <strong>{orderNumber}</strong>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="delivery-partner">Delivery Partner <span className="text-red-500">*</span></Label>
              {loadingPartners ? (
                <div className="mt-2 text-sm text-slate-500">Loading partners...</div>
              ) : (
                <Select value={selectedPartnerId} onValueChange={setSelectedPartnerId}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select a delivery partner" />
                  </SelectTrigger>
                  <SelectContent>
                    {deliveryPartners.length === 0 ? (
                      <div className="p-2 text-sm text-slate-500">No active delivery partners found</div>
                    ) : (
                      deliveryPartners.map((partner) => (
                        <SelectItem key={partner.id} value={partner.id}>
                          {partner.name} ({partner.phone})
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel 
              disabled={isAssigningPartner}
              onClick={() => {
                setSelectedPartnerId('');
                setShowAssignDialog(false);
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleAssignPartner}
              disabled={isAssigningPartner || !selectedPartnerId || loadingPartners}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isAssigningPartner ? 'Assigning...' : 'Assign Partner'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Cancellation Dialog with Reason */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Order</AlertDialogTitle>
            <AlertDialogDescription>
              Please provide a reason for cancelling order <strong>{orderNumber}</strong>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="cancel-reason">Cancellation Reason <span className="text-red-500">*</span></Label>
              <Select value={cancelReason} onValueChange={setCancelReason}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select a reason" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="customer_request">Customer Request</SelectItem>
                  <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                  <SelectItem value="payment_failed">Payment Failed</SelectItem>
                  <SelectItem value="delivery_issue">Delivery Issue</SelectItem>
                  <SelectItem value="duplicate_order">Duplicate Order</SelectItem>
                  <SelectItem value="fraudulent">Fraudulent Order</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              {cancelReason === 'other' && (
                <Textarea
                  id="cancel-reason-custom"
                  placeholder="Please specify the reason..."
                  value={customCancelReason}
                  onChange={(e) => setCustomCancelReason(e.target.value)}
                  className="mt-2"
                  rows={3}
                />
              )}
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel 
              disabled={isUpdating}
              onClick={() => {
                setCancelReason('');
                setCustomCancelReason('');
                setShowCancelDialog(false);
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelConfirm}
              disabled={isUpdating || !cancelReason.trim() || (cancelReason === 'other' && !customCancelReason.trim())}
              className="bg-red-600 hover:bg-red-700"
            >
              {isUpdating ? 'Cancelling...' : 'Confirm Cancellation'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Status Update Confirmation Dialog */}
      <AlertDialog open={pendingStatus !== null && pendingStatus !== 'cancelled'} onOpenChange={(open) => !open && setPendingStatus(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Status Update</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to update order <strong>{orderNumber}</strong> status from{' '}
              <strong>{statusConfig[currentStatus].label}</strong> to{' '}
              <strong>{pendingStatus ? statusConfig[pendingStatus].label : ''}</strong>?
            </AlertDialogDescription>
            {pendingStatus === 'delivered' && isCOD && !isPaymentPending && (
              <div className="mt-2 text-sm text-emerald-600">
                ✓ Payment has been collected
              </div>
            )}
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isUpdating}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => pendingStatus && handleStatusUpdate(pendingStatus)}
              disabled={isUpdating}
            >
              {isUpdating ? 'Updating...' : 'Confirm'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}


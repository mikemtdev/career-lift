import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPayment: (paymentMethod: 'mobile_money' | 'card', phoneNumber?: string) => void;
  isLoading: boolean;
}

export function PaymentDialog({
  open,
  onOpenChange,
  onPayment,
  isLoading,
}: PaymentDialogProps) {
  const [selectedMethod, setSelectedMethod] = useState<'mobile_money' | 'card' | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');

  const handleProceed = () => {
    if (!selectedMethod) return;
    onPayment(selectedMethod, selectedMethod === 'mobile_money' ? phoneNumber : undefined);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Payment Required</DialogTitle>
          <DialogDescription>
            Additional CVs cost $1.00. Please select your preferred payment method.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Mobile Money Option - First Priority */}
          <div
            className={`border rounded-lg p-4 cursor-pointer transition-colors ${
              selectedMethod === 'mobile_money'
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50'
            }`}
            onClick={() => setSelectedMethod('mobile_money')}
          >
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-2xl">📱</span>
                </div>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">Mobile Money</h3>
                <p className="text-sm text-muted-foreground">
                  Pay securely with your mobile money account
                </p>
              </div>
              <div>
                {selectedMethod === 'mobile_money' && (
                  <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                    <span className="text-white text-sm">✓</span>
                  </div>
                )}
              </div>
            </div>

            {selectedMethod === 'mobile_money' && (
              <div className="mt-4 space-y-2">
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input
                  id="phoneNumber"
                  type="tel"
                  placeholder="+1234567890"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  Enter your mobile money phone number
                </p>
              </div>
            )}
          </div>

          {/* Card Payment Option - Second Priority */}
          <div
            className={`border rounded-lg p-4 cursor-pointer transition-colors ${
              selectedMethod === 'card'
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50'
            }`}
            onClick={() => setSelectedMethod('card')}
          >
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-2xl">💳</span>
                </div>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">Card Payment</h3>
                <p className="text-sm text-muted-foreground">
                  Pay with credit or debit card
                </p>
              </div>
              <div>
                {selectedMethod === 'card' && (
                  <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                    <span className="text-white text-sm">✓</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleProceed}
            disabled={
              !selectedMethod ||
              (selectedMethod === 'mobile_money' && !phoneNumber) ||
              isLoading
            }
          >
            {isLoading ? 'Processing...' : 'Proceed to Payment'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

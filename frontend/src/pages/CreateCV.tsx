import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CVForm } from '@/components/CVForm';
import { CVFormData } from '@/types';
import { apiClient } from '@/lib/api';
import { useCvs } from '@/hooks/useCvs';
import { usePricing } from '@/hooks/usePricing';
import { withAuth } from '@/hocs/withAuth';
import { ArrowLeft } from 'lucide-react';
import { PaymentDialog } from '@/components/PaymentDialog';

const CreateCVComponent = () => {
  const navigate = useNavigate();
  const { cvs, mutate } = useCvs();
  const { pricing } = usePricing();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [pendingCvData, setPendingCvData] = useState<CVFormData | null>(null);
  const [currentPrice, setCurrentPrice] = useState('1.00');

  useEffect(() => {
    if (pricing) {
      setCurrentPrice((pricing / 100).toFixed(2));
    }
  }, [pricing]);

  const handleSubmit = async (data: CVFormData) => {
    setError('');

    // Check if this is the first CV (free) or requires payment
    if (cvs.length === 0) {
      // First CV is free, create directly
      setIsLoading(true);
      try {
        await apiClient.createCv(data);
        await mutate();
        navigate('/dashboard');
      } catch (err: any) {
        setError(err.message || 'Failed to create CV');
      } finally {
        setIsLoading(false);
      }
    } else {
      // Additional CV requires payment
      setPendingCvData(data);
      setShowPaymentDialog(true);
    }
  };

  const handlePayment = async (
    paymentMethod: 'mobile_money' | 'card',
    phoneNumber?: string
  ) => {
    if (!pendingCvData) return;

    setIsLoading(true);
    setError('');

    try {
      // Initiate payment with Lenco
      const paymentData = {
        paymentMethod,
        phoneNumber,
        amount: 1,
        currency: 'USD',
        cvData: pendingCvData,
      };

      const response = await apiClient.initiatePayment(paymentData);

      // Redirect to Lenco payment page if authorization URL is provided
      if (response.authorization_url) {
        window.location.href = response.authorization_url;
      } else {
        // For demo purposes, simulate payment success
        setTimeout(async () => {
          try {
            const verifyResponse = await apiClient.verifyPayment(response.payment?.reference || 'demo-ref');
            if (verifyResponse.status === 'success') {
              // Create CV with payment confirmed
              await apiClient.createCv(pendingCvData);
              await mutate();
              setShowPaymentDialog(false);
              navigate('/dashboard');
            } else {
              setError('Payment verification failed. Please try again.');
            }
          } catch (err: any) {
            setError(err.message || 'Payment verification failed');
          } finally {
            setIsLoading(false);
          }
        }, 2000);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to initiate payment');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-2xl font-bold">Create New CV</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {cvs.length === 0 && (
          <div className="mb-6 p-4 bg-primary/10 border border-primary/20 rounded-lg">
            <p className="text-sm">
              🎉 This is your first CV - it's completely free! Additional CVs cost ${currentPrice} each.
            </p>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        <CVForm onSubmit={handleSubmit} isLoading={isLoading} />
      </main>

      <PaymentDialog
        open={showPaymentDialog}
        onOpenChange={setShowPaymentDialog}
        onPayment={handlePayment}
        isLoading={isLoading}
      />
    </div>
  );
};

export const CreateCV = withAuth(CreateCVComponent);

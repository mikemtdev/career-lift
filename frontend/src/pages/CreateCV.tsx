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

const CreateCVComponent = () => {
  const navigate = useNavigate();
  const { cvs, mutate } = useCvs();
  const { pricing } = usePricing();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPaymentWarning, setShowPaymentWarning] = useState(false);
  const [currentPrice, setCurrentPrice] = useState('1.00');

  useEffect(() => {
    if (pricing) {
      setCurrentPrice((pricing / 100).toFixed(2));
    }
  }, [pricing]);

  const handleSubmit = async (data: CVFormData, confirmPayment = false) => {
    setError('');
    setIsLoading(true);

    try {
      const payload = confirmPayment ? { ...data, paymentConfirmed: true } : data;
      await apiClient.createCv(payload);
      await mutate();
      navigate('/dashboard');
    } catch (err: any) {
      if (err.message.includes('Payment required')) {
        setShowPaymentWarning(true);
        setError(`This is your additional CV. It costs $${currentPrice}. Click "Confirm & Create" to proceed.`);
      } else {
        setError(err.message || 'Failed to create CV');
      }
    } finally {
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
            {showPaymentWarning && (
              <div className="mt-4">
                <p className="text-sm mb-2">
                  Note: In a production environment, this would integrate with a payment processor
                  like Stripe. For this demo, click the button below to proceed without payment.
                </p>
                <Button
                  variant="destructive"
                  onClick={() => {
                    setShowPaymentWarning(false);
                    setError('');
                  }}
                >
                  Confirm & Create (Demo Mode)
                </Button>
              </div>
            )}
          </div>
        )}

        <CVForm onSubmit={(data) => handleSubmit(data, showPaymentWarning)} isLoading={isLoading} />
      </main>
    </div>
  );
};

export const CreateCV = withAuth(CreateCVComponent);

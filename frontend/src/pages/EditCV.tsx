import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CVForm } from '@/components/CVForm';
import { CVFormData } from '@/types';
import { apiClient } from '@/lib/api';
import { useCvs } from '@/hooks/useCvs';
import { withAuth } from '@/hocs/withAuth';
import { ArrowLeft } from 'lucide-react';

const EditCVComponent = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { mutate } = useCvs();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState('');
  const [initialData, setInitialData] = useState<CVFormData | null>(null);

  useEffect(() => {
    const fetchCV = async () => {
      if (!id) {
        navigate('/dashboard');
        return;
      }

      try {
        setIsFetching(true);
        const response = await apiClient.getCv(id);
        setInitialData({
          title: response.cv.title,
          personalInfo: response.cv.personalInfo,
          education: response.cv.education,
          experience: response.cv.experience,
          skills: response.cv.skills,
        });
      } catch (err: any) {
        setError(err.message || 'Failed to load CV');
      } finally {
        setIsFetching(false);
      }
    };

    fetchCV();
  }, [id, navigate]);

  const handleSubmit = async (data: CVFormData) => {
    if (!id) return;

    setError('');
    setIsLoading(true);

    try {
      await apiClient.updateCv(id, data);
      await mutate();
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to update CV');
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
          <h1 className="text-2xl font-bold">Edit CV</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {error && (
          <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {isFetching ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading CV...</p>
          </div>
        ) : initialData ? (
          <CVForm
            onSubmit={handleSubmit}
            isLoading={isLoading}
            initialData={initialData}
            submitButtonText="Update CV"
          />
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">CV not found</p>
          </div>
        )}
      </main>
    </div>
  );
};

export const EditCV = withAuth(EditCVComponent);

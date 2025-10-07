import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useCvs } from '@/hooks/useCvs';
import { usePricing } from '@/hooks/usePricing';
import { apiClient } from '@/lib/api';
import { Download, Plus, FileText, Shield, Edit } from 'lucide-react';
import { withAuth } from '@/hocs/withAuth';

const DashboardComponent = () => {
  const { user, logout } = useAuth();
  const { cvs, isLoading } = useCvs();
  const { pricing } = usePricing();
  const navigate = useNavigate();

  const priceInDollars = pricing ? (pricing / 100).toFixed(2) : '1.00';

  const handleLogout = () => {
    apiClient.logout();
    logout();
    navigate('/login');
  };

  const handleDownload = async (cvId: string) => {
    try {
      await apiClient.downloadCv(cvId);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">CareerLift</h1>
          <div className="flex items-center gap-4">
            {user?.isAdmin && (
              <Button variant="outline" onClick={() => navigate('/admin')}>
                <Shield className="w-4 h-4 mr-2" />
                Admin
              </Button>
            )}
            <span className="text-sm text-muted-foreground">
              {user?.email}
            </span>
            <Button variant="outline" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold">My CVs</h2>
            <p className="text-muted-foreground mt-2">
              {cvs.length === 0 ? (
                'Create your first CV for free!'
              ) : (
                `You have ${cvs.length} CV${cvs.length > 1 ? 's' : ''}. Additional CVs cost $${priceInDollars}.`
              )}
            </p>
          </div>
          <Button onClick={() => navigate('/create-cv')} size="lg">
            <Plus className="w-5 h-5 mr-2" />
            Create New CV
          </Button>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading your CVs...</p>
          </div>
        ) : cvs.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent className="pt-6">
              <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">No CVs yet</h3>
              <p className="text-muted-foreground mb-4">
                Get started by creating your first CV - it's free!
              </p>
              <Button onClick={() => navigate('/create-cv')}>
                Create Your First CV
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cvs.map((cv) => (
              <Card key={cv.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    {cv.title}
                  </CardTitle>
                  <CardDescription>
                    Created: {new Date(cv.createdAt).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p>Education entries: {cv.education.length}</p>
                    <p>Experience entries: {cv.experience.length}</p>
                    <p>Skills: {cv.skills.length}</p>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button
                      className="flex-1"
                      variant="outline"
                      onClick={() => navigate(`/edit-cv/${cv.id}`)}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      className="flex-1"
                      variant="outline"
                      onClick={() => handleDownload(cv.id)}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export const Dashboard = withAuth(DashboardComponent);

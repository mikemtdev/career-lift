import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useAdminStats } from '@/hooks/useAdminStats';
import { apiClient } from '@/lib/api';
import { ArrowLeft, Users, FileText, DollarSign, Settings } from 'lucide-react';
import { withAuth } from '@/hocs/withAuth';

const AdminDashboardComponent = () => {
  const { user, logout } = useAuth();
  const { stats, pricing, isLoading, mutate } = useAdminStats();
  const navigate = useNavigate();
  const [isEditingPrice, setIsEditingPrice] = useState(false);
  const [newPrice, setNewPrice] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleLogout = () => {
    apiClient.logout();
    logout();
    navigate('/login');
  };

  const handleUpdatePrice = async () => {
    setError('');
    setSuccess('');
    
    try {
      const priceInDollars = parseFloat(newPrice);
      if (isNaN(priceInDollars) || priceInDollars < 0) {
        setError('Please enter a valid price');
        return;
      }
      
      const priceInCents = Math.round(priceInDollars * 100);
      await apiClient.updateAdminPricing(priceInCents);
      await mutate();
      setSuccess('Price updated successfully!');
      setIsEditingPrice(false);
      setNewPrice('');
    } catch (err: any) {
      setError(err.message || 'Failed to update price');
    }
  };

  // Check if user is admin
  if (!user?.isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-[400px]">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>You don't have admin privileges.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/dashboard')} className="w-full">
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back
            </Button>
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          </div>
          <div className="flex items-center gap-4">
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
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Platform Overview</h2>
          <p className="text-muted-foreground">
            Monitor platform statistics and manage pricing
          </p>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading statistics...</p>
          </div>
        ) : (
          <>
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    Registered accounts
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total CVs</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.totalCvs || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    All CVs created
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Free CVs</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.freeCvs || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    First CV for each user
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Paid CVs</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.paidCvs || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    Additional paid CVs
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Pricing Configuration */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="w-5 h-5" />
                      Pricing Configuration
                    </CardTitle>
                    <CardDescription>
                      Set the price for additional CVs (first CV is always free)
                    </CardDescription>
                  </div>
                  {!isEditingPrice && (
                    <Button onClick={() => {
                      setIsEditingPrice(true);
                      setNewPrice(((pricing?.additionalCvPrice || 100) / 100).toFixed(2));
                    }}>
                      Update Price
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {error && (
                  <div className="mb-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                    <p className="text-sm text-destructive">{error}</p>
                  </div>
                )}
                {success && (
                  <div className="mb-4 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                    <p className="text-sm text-green-600">{success}</p>
                  </div>
                )}

                {isEditingPrice ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Price per additional CV (USD)
                      </label>
                      <div className="flex gap-2">
                        <div className="flex-1">
                          <div className="relative">
                            <span className="absolute left-3 top-2.5 text-muted-foreground">$</span>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={newPrice}
                              onChange={(e) => setNewPrice(e.target.value)}
                              className="w-full pl-7 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                              placeholder="0.00"
                            />
                          </div>
                        </div>
                        <Button onClick={handleUpdatePrice}>
                          Save
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => {
                            setIsEditingPrice(false);
                            setNewPrice('');
                            setError('');
                            setSuccess('');
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-4">
                    <div className="text-4xl font-bold text-primary">
                      ${((pricing?.additionalCvPrice || 100) / 100).toFixed(2)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Current price per additional CV
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </main>
    </div>
  );
};

export const AdminDashboard = withAuth(AdminDashboardComponent);

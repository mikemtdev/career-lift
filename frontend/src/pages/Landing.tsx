import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, DollarSign, Shield, Download, Sparkles, Zap } from 'lucide-react';

export const Landing = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <FileText className="w-8 h-8 text-primary" />,
      title: 'ATS-Friendly PDFs',
      description: 'Professional CV export optimized for Applicant Tracking Systems'
    },
    {
      icon: <DollarSign className="w-8 h-8 text-primary" />,
      title: 'Free First CV',
      description: 'Create your first CV for free, additional CVs only $1'
    },
    {
      icon: <Shield className="w-8 h-8 text-primary" />,
      title: 'Secure & Private',
      description: 'JWT authentication with encrypted password protection'
    },
    {
      icon: <Download className="w-8 h-8 text-primary" />,
      title: 'Instant Download',
      description: 'Generate and download your CV as a PDF instantly'
    },
    {
      icon: <Sparkles className="w-8 h-8 text-primary" />,
      title: 'Modern Design',
      description: 'Clean, minimalist interface built with latest technologies'
    },
    {
      icon: <Zap className="w-8 h-8 text-primary" />,
      title: 'Fast & Responsive',
      description: 'Lightning-fast performance on all devices'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">CareerLift</h1>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => navigate('/login')}>
              Login
            </Button>
            <Button onClick={() => navigate('/signup')}>
              Sign Up
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24 text-center">
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
          Build Your Professional CV
        </h2>
        <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Create ATS-friendly CVs in minutes. Your first CV is free.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" onClick={() => navigate('/signup')} className="text-lg px-8 py-6">
            Get Started Free
          </Button>
          <Button size="lg" variant="outline" onClick={() => navigate('/login')} className="text-lg px-8 py-6">
            Login
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <h3 className="text-3xl md:text-4xl font-bold text-center mb-12">
          Everything You Need
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="mb-4">{feature.icon}</div>
                <CardTitle>{feature.title}</CardTitle>
                <CardDescription className="text-base">
                  {feature.description}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <Card className="bg-primary text-primary-foreground">
          <CardContent className="py-12 text-center">
            <h3 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Create Your CV?
            </h3>
            <p className="text-lg mb-8 opacity-90">
              Join hundreds of professionals who trust CareerLift
            </p>
            <Button size="lg" variant="secondary" onClick={() => navigate('/signup')} className="text-lg px-8 py-6">
              Get Started Now
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t mt-16">
        <div className="container mx-auto px-4 py-8 text-center text-muted-foreground">
          <p>© 2024 CareerLift. Built with React, Node.js, and PostgreSQL.</p>
        </div>
      </footer>
    </div>
  );
};


import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { GeneratedItemData, Platform } from '@/types/item';
import AddItemForm from '@/components/AddItemForm';
import ReviewItemForm from '@/components/ReviewItemForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const AddItemPage = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState<'add' | 'review'>('add');
  const [generatedData, setGeneratedData] = useState<GeneratedItemData | null>(null);
  const [connectedPlatforms, setConnectedPlatforms] = useState<Record<Platform, boolean>>({
    facebook: false,
    olx: false,
    vinted: false
  });
  
  useEffect(() => {
    // Redirect if not authenticated
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to add items",
      });
      navigate('/login');
    }
    
    // Fetch connected platforms
    const fetchConnectedPlatforms = async () => {
      try {
        const token = localStorage.getItem('flipit_token');
        if (!token) return;
        
        const response = await fetch('http://127.0.0.1:8000/FlipIt/api/connected-platforms', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setConnectedPlatforms(data);
        }
      } catch (error) {
        console.error('Error fetching connected platforms:', error);
      }
    };
    
    if (isAuthenticated) {
      fetchConnectedPlatforms();
    }
  }, [isAuthenticated, isLoading, navigate, toast]);
  
  const handleComplete = (data: GeneratedItemData) => {
    setGeneratedData(data);
    setStep('review');
  };
  
  const handleBack = () => {
    setStep('add');
  };
  
  if (isLoading) {
    return (
      <div className="container mx-auto py-12">
        <div className="flex justify-center items-center min-h-[50vh]">
          <div className="animate-pulse text-xl">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">
          {step === 'add' ? 'Add New Item' : 'Review Your Item'}
        </h1>
        
        {step === 'add' ? (
          <Card>
            <CardHeader>
              <CardTitle>Upload Item</CardTitle>
              <CardDescription>
                Start by adding images and basic information. Our AI will help fill in the details.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AddItemForm onComplete={handleComplete} />
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Review and Publish</CardTitle>
              <CardDescription>
                Review the generated information, make any changes, and choose where to publish your item.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {generatedData && (
                <ReviewItemForm 
                  initialData={generatedData} 
                  connectedPlatforms={connectedPlatforms}
                  onBack={handleBack}
                />
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AddItemPage;

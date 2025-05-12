
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import ConnectAccountCard from '@/components/ConnectAccountCard';
import { CheckCircle, ArrowRight, Lock } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

const ConnectAccountsPage = () => {
  const [activeStep, setActiveStep] = useState(1);
  const [accountsConnected, setAccountsConnected] = useState(0);
  const [connectedPlatforms, setConnectedPlatforms] = useState<Record<string, boolean>>({});
  
  
  const handleNextStep = () => {
    if (activeStep < 3) {
      setActiveStep(activeStep + 1);
      
      // Show toast notification when moving to the next step
      if (activeStep === 1) {
        toast.success("Great! Your preferences have been saved.");
      } else if (activeStep === 2) {
        toast.success("You're all set to start flipping!");
      }
    }
  };

  const handleAccountConnected = () => {
    setAccountsConnected(prev => prev + 1);
  };

  // Animation variants for staggered animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, 
      transition: { 
        type: "spring",
        stiffness: 100
      }
    },
  };

    useEffect(() => {
    const fetchConnectedPlatforms = async () => {
      try {
        const response = await fetch("http://127.0.0.1:8000/FlipIt/api/connected-platforms", {
          method: "GET",
          credentials: "include", // Include cookies for authentication
        });

        if (!response.ok) {
          throw new Error("Failed to fetch connected platforms");
        }

        const data = await response.json();
        setConnectedPlatforms(data); // Example response: { facebook: true, olx: false, vinted: true }
      } catch (error) {
        console.error("Error fetching connected platforms:", error);
        toast.error("Failed to load connected platforms. Please try again.");
      }
    };

    fetchConnectedPlatforms();
  }, []);

  return (
    <div className="container mx-auto">
      <h1 className="text-2xl font-bold mb-6">Connect Your Accounts</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ConnectAccountCard
          platform="facebook"
          platformName="Facebook"
          logoSrc="https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/2021_Facebook_icon.svg/2048px-2021_Facebook_icon.svg.png"
          isConnected={connectedPlatforms.facebook}
        />
        <ConnectAccountCard
          platform="olx"
          platformName="OLX"
          logoSrc="https://images.seeklogo.com/logo-png/39/1/olx-logo-png_seeklogo-390322.png"
          isConnected={connectedPlatforms.olx}
        />
        <ConnectAccountCard
          platform="vinted"
          platformName="Vinted"
          logoSrc="https://upload.wikimedia.org/wikipedia/commons/2/29/Vinted_logo.png"
          isConnected={connectedPlatforms.vinted}
        />
      </div>
    </div>
  );
};

export default ConnectAccountsPage;


import { useState, useEffect, useRef } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { PresentationSections } from '@/components/sales-presentations/PresentationSections';
import { PresentationDisplaySettings } from '@/types/salesPresentation';
import { fetchSharedPresentation } from '@/api/salesPresentations/fetchSharedPresentation';
import { 
  trackPresentationView, 
  updatePresentationViewTime,
  recordSectionView 
} from '@/api/salesPresentations/trackPresentationView';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const SharedPresentationView = () => {
  const { accessCode } = useParams<{ accessCode: string }>();
  const location = useLocation();
  const [presentation, setPresentation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewId, setViewId] = useState<string | null>(null);
  const lastHeartbeatRef = useRef<number>(Date.now());
  const activeTimeRef = useRef<number>(0);
  const checkIntervalRef = useRef<number | null>(null);
  const heartbeatIntervalRef = useRef<number | null>(null);
  
  // Track user activity
  const handleUserActivity = () => {
    lastHeartbeatRef.current = Date.now();
  };
  
  // Function to get browser and device info
  const getBrowserInfo = () => {
    const ua = navigator.userAgent;
    let browserName = "Unknown";
    
    if (ua.indexOf("Firefox") > -1) {
      browserName = "Firefox";
    } else if (ua.indexOf("SamsungBrowser") > -1) {
      browserName = "Samsung Browser";
    } else if (ua.indexOf("Opera") > -1 || ua.indexOf("OPR") > -1) {
      browserName = "Opera";
    } else if (ua.indexOf("Trident") > -1) {
      browserName = "Internet Explorer";
    } else if (ua.indexOf("Edge") > -1) {
      browserName = "Edge";
    } else if (ua.indexOf("Chrome") > -1) {
      browserName = "Chrome";
    } else if (ua.indexOf("Safari") > -1) {
      browserName = "Safari";
    }
    
    return browserName;
  };
  
  // Get device type
  const getDeviceType = () => {
    const ua = navigator.userAgent;
    if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
      return "Tablet";
    }
    if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
      return "Mobile";
    }
    return "Desktop";
  };
  
  // Initialize activity tracking
  useEffect(() => {
    // Add event listeners to track user activity
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(event => {
      document.addEventListener(event, handleUserActivity);
    });
    
    // Set interval to check if user is still active
    const checkActivity = () => {
      const now = Date.now();
      const timeSinceLastActivity = now - lastHeartbeatRef.current;
      
      // If user has been active in the last minute, count this time
      if (timeSinceLastActivity < 60000) {
        // Add time since last check (max 5 seconds to prevent counting when tab is in background)
        activeTimeRef.current += Math.min(5, (now - lastHeartbeatRef.current) / 1000);
      }
      lastHeartbeatRef.current = now;
    };
    
    // Check activity every 5 seconds
    checkIntervalRef.current = window.setInterval(checkActivity, 5000);
    
    // Clean up event listeners
    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleUserActivity);
      });
      if (checkIntervalRef.current) clearInterval(checkIntervalRef.current);
      if (heartbeatIntervalRef.current) clearInterval(heartbeatIntervalRef.current);
    };
  }, []);
  
  useEffect(() => {
    // Fetch the shared presentation data by access code
    const fetchPresentation = async () => {
      try {
        if (!accessCode) {
          setError('Invalid access code');
          setLoading(false);
          return;
        }
        
        const { data, error } = await fetchSharedPresentation(accessCode);
        
        if (error) {
          console.error('Error fetching presentation:', error);
          setError('Failed to load presentation');
          setLoading(false);
          return;
        }
        
        if (!data) {
          console.error('No presentation data found');
          setError('Presentation not found');
          setLoading(false);
          return;
        }
        
        setPresentation(data);
        
        // Track the presentation view with detailed information
        const newViewId = await trackPresentationView({
          presentationId: data.id,
          viewerInfo: {
            device: getDeviceType(),
            browser: getBrowserInfo(),
            referrer: document.referrer || null,
          }
        });
        
        setViewId(newViewId);
        
        // Reset activity timer
        activeTimeRef.current = 0;
        lastHeartbeatRef.current = Date.now();
      } catch (err) {
        console.error('Error in shared presentation view:', err);
        setError('An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };
    
    fetchPresentation();
  }, [accessCode]);
  
  // Send periodic heartbeats to update last_activity and track time spent
  useEffect(() => {
    if (!presentation?.id || !viewId) return;
    
    const sendHeartbeat = async () => {
      try {
        // Only send update if we have tracked time
        if (activeTimeRef.current > 0) {
          await updatePresentationViewTime(
            presentation.id,
            viewId,
            Math.round(activeTimeRef.current)
          );
          // Reset tracked time after sending
          activeTimeRef.current = 0;
        }
      } catch (err) {
        console.error('Failed to update view activity:', err);
      }
    };
    
    // Send heartbeat every 30 seconds
    heartbeatIntervalRef.current = window.setInterval(sendHeartbeat, 30000);
    
    // Send heartbeat when component unmounts
    return () => {
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
        // Final heartbeat when leaving
        sendHeartbeat();
      }
    };
  }, [presentation?.id, viewId]);
  
  // Handle downloading the presentation (if enabled)
  const handleDownload = () => {
    // This would be implemented to generate a PDF of the presentation
    console.log('Download functionality would be implemented here');
  };
  
  if (loading) {
    return (
      <div className="container mx-auto py-8 space-y-6">
        <div className="text-center">
          <Skeleton className="h-10 w-3/4 mx-auto" />
          <Skeleton className="h-24 w-full mt-4" />
        </div>
        <div className="mt-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-64 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="bg-destructive/10 p-6 rounded-lg max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-destructive mb-2">Error</h1>
          <p className="text-muted-foreground">{error}</p>
          <p className="mt-4 text-sm">The presentation you're trying to access may have expired or been removed.</p>
        </div>
      </div>
    );
  }
  
  if (!presentation) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="bg-muted p-6 rounded-lg max-w-md w-full text-center">
          <h1 className="text-2xl font-bold mb-2">Presentation Not Found</h1>
          <p className="text-muted-foreground">The presentation you're looking for doesn't exist or has expired.</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold">{presentation.title}</h1>
        {presentation.description && (
          <Card className="mt-4">
            <CardContent className="pt-6">
              <p className="text-muted-foreground">{presentation.description}</p>
            </CardContent>
          </Card>
        )}
        
        {presentation.allow_downloads && (
          <div className="mt-4">
            <Button 
              variant="outline" 
              onClick={handleDownload}
              className="flex items-center gap-2"
            >
              <Download size={16} />
              Download Presentation
            </Button>
          </div>
        )}
      </div>
      
      <div className="mt-8">
        <PresentationSections
          presentationId={presentation.id}
          isEditable={false}
          displaySettings={presentation.display_settings as PresentationDisplaySettings}
          viewId={viewId || undefined}
          isPublicView={true}
        />
      </div>
    </div>
  );
};

export default SharedPresentationView;

import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabaseCustom } from '@/integrations/supabase/client-custom';
import { SalesPresentation, PresentationSection, PresentationItem } from '@/types/salesPresentation';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { trackPresentationView } from '@/api/salesPresentations';
import { v4 as uuidv4 } from 'uuid';

const SharedPresentationView = () => {
  const { accessCode } = useParams<{ accessCode: string }>();
  const [presentation, setPresentation] = useState<SalesPresentation | null>(null);
  const [sections, setSections] = useState<PresentationSection[]>([]);
  const [items, setItems] = useState<Record<string, PresentationItem[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewId, setViewId] = useState<string>('');

  useEffect(() => {
    const viewSessionId = localStorage.getItem(`presentation_view_${accessCode}`) || uuidv4();
    setViewId(viewSessionId);
    localStorage.setItem(`presentation_view_${accessCode}`, viewSessionId);

    const fetchPresentation = async () => {
      try {
        setLoading(true);
        
        const { data: shareData, error: shareError } = await supabaseCustom
          .from('presentation_shares')
          .select('presentation_id, expires_at')
          .eq('share_link', window.location.href)
          .single();
          
        if (shareError) {
          throw new Error('Invalid or expired share link');
        }
        
        if (shareData.expires_at && new Date(shareData.expires_at) < new Date()) {
          throw new Error('This share link has expired');
        }
        
        const { data: presentationData, error: presentationError } = await supabaseCustom
          .from('sales_presentations')
          .select('*')
          .eq('id', shareData.presentation_id)
          .eq('status', 'published')
          .single();
          
        if (presentationError) {
          throw new Error('Presentation not found or not published');
        }
        
        setPresentation({
          ...presentationData,
          display_settings: presentationData.display_settings as SalesPresentation['display_settings']
        } as SalesPresentation);
        
        const { data: sectionsData, error: sectionsError } = await supabaseCustom
          .from('presentation_sections')
          .select('*')
          .eq('presentation_id', presentationData.id)
          .order('section_order', { ascending: true });
          
        if (sectionsError) {
          throw new Error('Error fetching presentation sections');
        }
        
        setSections(sectionsData as PresentationSection[]);
        
        const itemsMap: Record<string, PresentationItem[]> = {};
        
        for (const section of sectionsData) {
          const { data: itemsData, error: itemsError } = await supabaseCustom
            .from('presentation_items')
            .select('*')
            .eq('section_id', section.id)
            .order('display_order', { ascending: true });
            
          if (itemsError) {
            console.error('Error fetching items for section', section.id, itemsError);
            continue;
          }
          
          itemsMap[section.id] = itemsData as PresentationItem[];
        }
        
        setItems(itemsMap);
        
        const deviceInfo = {
          browser: navigator.userAgent,
          screenWidth: window.innerWidth,
          screenHeight: window.innerHeight,
        };
        
        await trackPresentationView({
          presentationId: presentationData.id,
          viewId: viewSessionId,
          viewerInfo: {
            device: JSON.stringify(deviceInfo),
          }
        });
      } catch (err) {
        console.error('Error fetching presentation:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchPresentation();

    const heartbeatInterval = setInterval(async () => {
      if (presentation?.id) {
        await trackPresentationView({
          presentationId: presentation.id,
          viewId: viewSessionId,
        });
      }
    }, 30000);

    return () => {
      clearInterval(heartbeatInterval);
    };
  }, [accessCode]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto space-y-8">
          <Skeleton className="h-12 w-3/4" />
          <Skeleton className="h-6 w-1/2" />
          
          <div className="space-y-6">
            <Skeleton className="h-8 w-1/3" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Skeleton className="h-64" />
              <Skeleton className="h-64" />
            </div>
          </div>
          
          <div className="space-y-6">
            <Skeleton className="h-8 w-1/3" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Skeleton className="h-64" />
              <Skeleton className="h-64" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md text-center">
          <h2 className="text-xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button onClick={() => window.history.back()}>Go Back</Button>
        </div>
      </div>
    );
  }

  if (!presentation) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md text-center">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Presentation Not Found</h2>
          <p className="text-gray-600 mb-6">
            The presentation you're looking for doesn't exist or is no longer available.
          </p>
          <Button onClick={() => window.history.back()}>Go Back</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{presentation.title}</h1>
            {presentation.description && (
              <p className="mt-1 text-sm text-gray-500">{presentation.description}</p>
            )}
          </div>
        </div>
      </header>

      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {sections.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <h2 className="text-xl font-medium text-gray-900">No content available</h2>
              <p className="mt-2 text-gray-500">This presentation doesn't have any content yet.</p>
            </div>
          ) : (
            <div className="space-y-8">
              {sections.map((section) => (
                <div key={section.id} className="bg-white shadow rounded-lg overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-medium text-gray-900">{section.title}</h2>
                    {section.description && (
                      <p className="mt-1 text-sm text-gray-500">{section.description}</p>
                    )}
                  </div>
                  
                  <div className="p-6">
                    {items[section.id]?.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {items[section.id].map((item) => (
                          <div key={item.id} className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                            <div className="h-40 bg-gray-100 flex items-center justify-center">
                              <p className="text-gray-400">{item.item_type} preview</p>
                            </div>
                            
                            <div className="p-4">
                              <h3 className="font-medium">{item.title || "Untitled"}</h3>
                              {item.description && (
                                <p className="mt-1 text-sm text-gray-500 line-clamp-2">{item.description}</p>
                              )}
                              {item.custom_price && (
                                <p className="mt-2 font-bold">
                                  {new Intl.NumberFormat('en-US', {
                                    style: 'currency',
                                    currency: item.currency || 'USD'
                                  }).format(item.custom_price)}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-4">No items in this section</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <p className="text-sm text-gray-500 text-center">
            This is a secure presentation. View ID: {viewId.substring(0, 8)}
          </p>
        </div>
      </footer>
    </div>
  );
};

export default SharedPresentationView;

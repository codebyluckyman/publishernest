import { useState, useCallback, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useOrganization } from './useOrganization';
import { useAuth } from '@/context/AuthContext';
import { useFormats } from './useFormats';
import { AIMessage, AIConversation, AISuggestion, AIContext } from '@/types/aiAssistant';
import { aiService } from '@/services/aiService';
import { toast } from 'sonner';

interface UseAIAssistantProps {
  contextData?: any;
  currentPage?: string;
}

export function useAIAssistant({ contextData, currentPage }: UseAIAssistantProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentOrganization, isLoading: isLoadingOrganization } = useOrganization();
  const { user } = useAuth();
  const { useCreateFormat } = useFormats();
  const createFormatMutation = useCreateFormat();
  
  const [conversation, setConversation] = useState<AIConversation>({
    id: `conv_${Date.now()}`,
    messages: [],
    context: {
      currentPage: currentPage || location.pathname,
      currentRoute: location.pathname,
      organizationId: currentOrganization?.id,
      userId: user?.id,
      recentActions: []
    },
    createdAt: new Date(),
    updatedAt: new Date()
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [pendingFormatCreation, setPendingFormatCreation] = useState<any>(null);

  // Update context when location or data changes
  useEffect(() => {
    setConversation(prev => ({
      ...prev,
      context: {
        ...prev.context,
        currentPage: currentPage || location.pathname,
        currentRoute: location.pathname,
        organizationId: currentOrganization?.id,
        userId: user?.id,
        ...contextData
      },
      updatedAt: new Date()
    }));
    
    // Generate suggestions based on current context
    generateContextSuggestions();
  }, [location.pathname, currentPage, contextData, currentOrganization?.id, user?.id]);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;

    const userMessage: AIMessage = {
      role: 'user',
      content: content.trim(),
      timestamp: new Date()
    };

    setConversation(prev => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      updatedAt: new Date()
    }));

    setIsLoading(true);

    try {
      const response = await aiService.processMessage({
        message: content,
        context: conversation.context,
        conversationHistory: conversation.messages
      });

      const assistantMessage: AIMessage = {
        role: 'assistant',
        content: response.content,
        timestamp: new Date(),
        actions: response.actions?.map(action => ({
          ...action,
          handler: () => executeAction(action)
        }))
      };

      setConversation(prev => ({
        ...prev,
        messages: [...prev.messages, assistantMessage],
        updatedAt: new Date()
      }));

      // Update suggestions based on response
      if (response.suggestions) {
        setSuggestions(response.suggestions);
      }

      // Check if this is a format creation response and store pending creation
      if (response.actions?.some(action => action.type === 'create' && action.data.entity === 'format')) {
        const formatAction = response.actions.find(action => action.type === 'create' && action.data.entity === 'format');
        if (formatAction) {
          setPendingFormatCreation(formatAction.data);
        }
      }

    } catch (error) {
      console.error('AI Assistant error:', error);
      
      const errorMessage: AIMessage = {
        role: 'assistant',
        content: 'I apologize, but I encountered an error processing your request. Please try again.',
        timestamp: new Date()
      };

      setConversation(prev => ({
        ...prev,
        messages: [...prev.messages, errorMessage],
        updatedAt: new Date()
      }));

      toast.error('AI Assistant encountered an error');
    } finally {
      setIsLoading(false);
    }
  }, [conversation.context, conversation.messages]);

  const executeAction = useCallback((action: any) => {
    try {
      switch (action.type) {
        case 'navigate':
          navigate(action.data.route);
          break;
        case 'create':
          if (action.data.entity === 'format') {
            handleFormatCreationRequest(action.data);
          } else {
            handleCreateAction(action.data);
          }
          break;
        case 'update':
          if (action.data.entity === 'format') {
            handleFormatUpdate(action.data);
          } else {
            handleUpdateAction(action.data);
          }
          break;
        case 'search':
          handleSearchAction(action.data);
          break;
        default:
          console.log('Executing action:', action);
      }
      
      toast.success(`Action completed: ${action.label}`);
    } catch (error) {
      console.error('Action execution error:', error);
      toast.error(`Failed to execute: ${action.label}`);
    }
  }, [navigate]);

  const handleFormatCreationRequest = useCallback((data: any) => {
    // Add comprehensive debugging for organization context
    console.log('🔍 AI Assistant Format Creation Debug - Start');
    console.log('📊 Organization loading state:', isLoadingOrganization);
    console.log('🏢 Current organization object:', currentOrganization);
    console.log('🆔 Organization ID:', currentOrganization?.id);
    console.log('📝 Organization name:', currentOrganization?.name);
    console.log('🔧 Organization type:', currentOrganization?.organization_type);
    console.log('👤 Current user:', user?.id);
    console.log('📋 Format data to create:', data);
    console.log('⏰ Context at creation time:', {
      isLoadingOrganization,
      hasCurrentOrganization: !!currentOrganization,
      organizationId: currentOrganization?.id,
      userId: user?.id,
      timestamp: new Date().toISOString()
    });

    if (isLoadingOrganization) {
      console.warn('⚠️ Organization is still loading, cannot create format yet');
      toast.error('Organization is still loading. Please wait a moment and try again.');
      return;
    }

    if (!currentOrganization?.id) {
      console.error('❌ No organization selected for format creation');
      console.log('🔍 Full organization object:', currentOrganization);
      toast.error('No organization selected. Please ensure you have an organization set up.');
      return;
    }

    console.log('✅ Proceeding with format creation confirmation');

    // Show confirmation dialog through AI conversation
    const confirmationMessage: AIMessage = {
      role: 'assistant',
      content: `I've prepared the format specifications. Would you like me to create this format now?\n\n**${data.specifications.format_name}**\n- Size: ${data.specifications.tps_width_mm}mm × ${data.specifications.tps_height_mm}mm\n- Binding: ${data.specifications.binding_type}\n- Cover Material: ${data.specifications.cover_material}\n- Internal Material: ${data.specifications.internal_material}\n- Extent: ${data.specifications.extent}`,
      timestamp: new Date(),
      actions: [{
        type: 'confirm_create_format',
        label: 'Yes, Create Format',
        handler: () => createFormatDirectly(data.specifications)
      }, {
        type: 'cancel',
        label: 'Cancel',
        handler: () => cancelFormatCreation()
      }]
    };

    setConversation(prev => ({
      ...prev,
      messages: [...prev.messages, confirmationMessage],
      updatedAt: new Date()
    }));
  }, [currentOrganization?.id, isLoadingOrganization, user?.id]);

  const createFormatDirectly = useCallback(async (specifications: any) => {
    // Add debugging at the actual creation point
    console.log('🚀 AI Assistant Direct Format Creation - Start');
    console.log('📊 Organization loading state at creation:', isLoadingOrganization);
    console.log('🏢 Current organization at creation:', currentOrganization);
    console.log('🆔 Organization ID at creation:', currentOrganization?.id);

    if (isLoadingOrganization) {
      console.warn('⚠️ Organization still loading during direct creation');
      toast.error('Organization is still loading. Please wait a moment and try again.');
      return;
    }

    if (!currentOrganization?.id) {
      console.error('❌ No organization ID available during direct creation');
      console.log('🔍 Organization object during creation:', currentOrganization);
      toast.error('No organization selected');
      return;
    }

    setIsLoading(true);

    try {
      const formatData = {
        ...specifications,
        organization_id: currentOrganization.id
      };

      console.log('📝 Final format data being sent:', formatData);

      await createFormatMutation.mutateAsync(formatData);

      console.log('✅ Format creation successful');

      const successMessage: AIMessage = {
        role: 'assistant',
        content: `✅ Successfully created format "${specifications.format_name}"! The format has been added to your formats library.`,
        timestamp: new Date(),
        actions: [{
          type: 'navigate',
          label: 'View All Formats',
          handler: () => navigate('/formats')
        }]
      };

      setConversation(prev => ({
        ...prev,
        messages: [...prev.messages, successMessage],
        updatedAt: new Date()
      }));

      setPendingFormatCreation(null);
      toast.success('Format created successfully!');

    } catch (error: any) {
      console.error('❌ Format creation error:', error);
      console.log('🔍 Error details:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      });
      
      const errorMessage: AIMessage = {
        role: 'assistant',
        content: `❌ Failed to create format: ${error.message || 'Unknown error occurred'}. Please try again or create the format manually.`,
        timestamp: new Date(),
        actions: [{
          type: 'navigate',
          label: 'Go to Formats Page',
          handler: () => navigate('/formats')
        }]
      };

      setConversation(prev => ({
        ...prev,
        messages: [...prev.messages, errorMessage],
        updatedAt: new Date()
      }));

      toast.error('Failed to create format');
    } finally {
      setIsLoading(false);
    }
  }, [currentOrganization?.id, isLoadingOrganization, createFormatMutation, navigate]);

  const cancelFormatCreation = useCallback(() => {
    console.log('🚫 Format creation cancelled by user');
    setPendingFormatCreation(null);
    
    const cancelMessage: AIMessage = {
      role: 'assistant',
      content: 'Format creation cancelled. Is there anything else I can help you with?',
      timestamp: new Date()
    };

    setConversation(prev => ({
      ...prev,
      messages: [...prev.messages, cancelMessage],
      updatedAt: new Date()
    }));
  }, []);

  const handleFormatUpdate = useCallback((data: any) => {
    console.log('Updating format:', data);
    
    if (data.formatId) {
      navigate(`/formats/${data.formatId}/edit`, {
        state: { suggestions: data.suggestions }
      });
    } else {
      navigate('/formats', {
        state: { searchMode: true, updateContext: data }
      });
    }
  }, [navigate]);

  const handleCreateAction = (data: any) => {
    // Implementation will depend on entity type
    console.log('Create action:', data);
  };

  const handleUpdateAction = (data: any) => {
    // Implementation will depend on entity type
    console.log('Update action:', data);
  };

  const handleSearchAction = (data: any) => {
    // Implementation will depend on search context
    console.log('Search action:', data);
  };

  const generateContextSuggestions = useCallback(() => {
    const currentPath = location.pathname;
    const contextSuggestions: string[] = [];

    // Generate suggestions based on current page
    if (currentPath.includes('/formats')) {
      contextSuggestions.push(
        'Create a hardcover format for children\'s picture books',
        'Create a paperback format for adult novels',
        'Update format specifications for binding type',
        'Show me format usage analytics',
        'Suggest optimal dimensions for board books'
      );
    } else if (currentPath.includes('/products')) {
      contextSuggestions.push(
        'Suggest optimal format for this product',
        'Find products missing format assignments',
        'Analyze format-product relationships'
      );
    } else if (currentPath.includes('/quotes')) {
      contextSuggestions.push(
        'Find best suppliers for current quote',
        'Optimize quote pricing',
        'Suggest production timeline'
      );
    } else if (currentPath.includes('/sales-orders')) {
      contextSuggestions.push(
        'Check order delivery status',
        'Suggest upsell opportunities',
        'Generate order insights'
      );
    } else {
      contextSuggestions.push(
        'Show me today\'s priorities',
        'What needs my attention?',
        'Analyze recent performance'
      );
    }

    setSuggestions(contextSuggestions.map((text, index) => ({
      text,
      category: 'workflow' as const,
      priority: index,
      context: currentPath
    })));
  }, [location.pathname]);

  const getSuggestions = useCallback(() => {
    return suggestions.map(s => s.text);
  }, [suggestions]);

  const clearConversation = useCallback(() => {
    setConversation(prev => ({
      ...prev,
      messages: [],
      updatedAt: new Date()
    }));
    setPendingFormatCreation(null);
  }, []);

  return {
    conversation,
    isLoading,
    suggestions,
    sendMessage,
    getSuggestions,
    clearConversation,
    executeAction,
    pendingFormatCreation
  };
}

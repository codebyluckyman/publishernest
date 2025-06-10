
import { useState, useCallback, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useOrganization } from './useOrganization';
import { useAuth } from '@/context/AuthContext';
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
  const { currentOrganization } = useOrganization();
  const { user } = useAuth();
  
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
          // Handle create actions based on entity type
          handleCreateAction(action.data);
          break;
        case 'update':
          // Handle update actions
          handleUpdateAction(action.data);
          break;
        case 'search':
          // Handle search actions
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
        'Create a new format for children\'s books',
        'Show me popular format specifications',
        'Compare format costs'
      );
    } else if (currentPath.includes('/products')) {
      contextSuggestions.push(
        'Suggest optimal format for this product',
        'Find products missing ISBN numbers',
        'Analyze pricing trends'
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
  }, []);

  return {
    conversation,
    isLoading,
    suggestions,
    sendMessage,
    getSuggestions,
    clearConversation,
    executeAction
  };
}

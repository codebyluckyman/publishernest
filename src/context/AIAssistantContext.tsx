
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { AIConversation, AIAnalytics } from '@/types/aiAssistant';

interface AIAssistantContextType {
  isEnabled: boolean;
  setIsEnabled: (enabled: boolean) => void;
  analytics: AIAnalytics;
  updateAnalytics: (analytics: Partial<AIAnalytics>) => void;
  globalConversation: AIConversation | null;
  setGlobalConversation: (conversation: AIConversation | null) => void;
}

const AIAssistantContext = createContext<AIAssistantContextType | undefined>(undefined);

export function AIAssistantProvider({ children }: { children: ReactNode }) {
  const [isEnabled, setIsEnabled] = useState(true);
  const [globalConversation, setGlobalConversation] = useState<AIConversation | null>(null);
  const [analytics, setAnalytics] = useState<AIAnalytics>({
    totalQueries: 0,
    successfulActions: 0,
    averageResponseTime: 0,
    mostUsedFeatures: [],
    userSatisfaction: 0
  });

  const updateAnalytics = (newAnalytics: Partial<AIAnalytics>) => {
    setAnalytics(prev => ({ ...prev, ...newAnalytics }));
  };

  return (
    <AIAssistantContext.Provider
      value={{
        isEnabled,
        setIsEnabled,
        analytics,
        updateAnalytics,
        globalConversation,
        setGlobalConversation
      }}
    >
      {children}
    </AIAssistantContext.Provider>
  );
}

export function useAIAssistantContext() {
  const context = useContext(AIAssistantContext);
  if (context === undefined) {
    throw new Error('useAIAssistantContext must be used within an AIAssistantProvider');
  }
  return context;
}

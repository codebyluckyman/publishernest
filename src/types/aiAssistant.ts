
export interface AIMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  actions?: AIAction[];
  metadata?: any;
}

export interface AIAction {
  label: string;
  type: 'navigate' | 'create' | 'update' | 'delete' | 'search' | 'suggest';
  handler: () => void;
  data?: any;
}

export interface AIConversation {
  id: string;
  messages: AIMessage[];
  context: AIContext;
  createdAt: Date;
  updatedAt: Date;
}

export interface AIContext {
  currentPage: string;
  currentRoute: string;
  selectedItems?: any[];
  filters?: any;
  searchQuery?: string;
  organizationId?: string;
  userId?: string;
  recentActions?: string[];
}

export interface AISuggestion {
  text: string;
  category: 'workflow' | 'data' | 'analysis' | 'automation';
  priority: number;
  context: string;
}

export interface AICapability {
  name: string;
  description: string;
  examples: string[];
  requiredContext: string[];
}

export interface AIAnalytics {
  totalQueries: number;
  successfulActions: number;
  averageResponseTime: number;
  mostUsedFeatures: string[];
  userSatisfaction: number;
}

export interface AIWorkflowSuggestion {
  title: string;
  description: string;
  steps: string[];
  estimatedTime: string;
  benefits: string[];
  category: 'efficiency' | 'cost-savings' | 'quality' | 'automation';
}

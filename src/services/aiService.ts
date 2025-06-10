
import { AIContext, AIMessage, AISuggestion } from '@/types/aiAssistant';

interface ProcessMessageRequest {
  message: string;
  context: AIContext;
  conversationHistory: AIMessage[];
}

interface ProcessMessageResponse {
  content: string;
  actions?: any[];
  suggestions?: AISuggestion[];
  confidence: number;
}

class AIService {
  private baseUrl = '/api/ai-assistant';

  async processMessage(request: ProcessMessageRequest): Promise<ProcessMessageResponse> {
    // For now, we'll simulate AI responses based on patterns
    // Later this will connect to your actual AI/LLM service
    
    const { message, context } = request;
    const lowerMessage = message.toLowerCase();

    // Pattern matching for common queries
    if (lowerMessage.includes('create') || lowerMessage.includes('new')) {
      return this.handleCreateRequest(message, context);
    }
    
    if (lowerMessage.includes('find') || lowerMessage.includes('search') || lowerMessage.includes('show')) {
      return this.handleSearchRequest(message, context);
    }
    
    if (lowerMessage.includes('suggest') || lowerMessage.includes('recommend')) {
      return this.handleSuggestionRequest(message, context);
    }
    
    if (lowerMessage.includes('analyze') || lowerMessage.includes('report')) {
      return this.handleAnalysisRequest(message, context);
    }

    // Default response
    return this.handleGeneralQuery(message, context);
  }

  private handleCreateRequest(message: string, context: AIContext): ProcessMessageResponse {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('format')) {
      return {
        content: "I can help you create a new format! Based on your current context, I'd suggest starting with these steps:",
        actions: [
          {
            type: 'navigate',
            label: 'Go to Formats',
            data: { route: '/formats' }
          },
          {
            type: 'create',
            label: 'Create Format',
            data: { entity: 'format', template: 'standard' }
          }
        ],
        suggestions: [
          { text: 'Create hardcover format', category: 'workflow', priority: 1, context: 'formats' },
          { text: 'Create paperback format', category: 'workflow', priority: 2, context: 'formats' }
        ],
        confidence: 0.8
      };
    }
    
    if (lowerMessage.includes('product')) {
      return {
        content: "I'll help you create a new product. Let me guide you through the process:",
        actions: [
          {
            type: 'navigate',
            label: 'Go to Products',
            data: { route: '/products' }
          }
        ],
        confidence: 0.8
      };
    }

    return {
      content: "I can help you create new records. What would you like to create? (formats, products, quotes, customers, etc.)",
      confidence: 0.6
    };
  }

  private handleSearchRequest(message: string, context: AIContext): ProcessMessageResponse {
    const currentPage = context.currentPage || '';
    
    if (currentPage.includes('/products')) {
      return {
        content: "I can help you search through your products. Here are some things I can find:",
        actions: [
          {
            type: 'search',
            label: 'Search Products',
            data: { query: message, entity: 'products' }
          }
        ],
        suggestions: [
          { text: 'Find products without formats', category: 'data', priority: 1, context: 'products' },
          { text: 'Show bestselling products', category: 'analysis', priority: 2, context: 'products' }
        ],
        confidence: 0.9
      };
    }

    return {
      content: "I can search across formats, products, quotes, suppliers, and customers. What specific information are you looking for?",
      confidence: 0.7
    };
  }

  private handleSuggestionRequest(message: string, context: AIContext): ProcessMessageResponse {
    return {
      content: "Based on your current workflow and data patterns, here are my recommendations:",
      suggestions: [
        { text: 'Optimize quote pricing strategy', category: 'automation', priority: 1, context: 'quotes' },
        { text: 'Standardize format specifications', category: 'workflow', priority: 2, context: 'formats' },
        { text: 'Improve supplier performance tracking', category: 'automation', priority: 3, context: 'suppliers' }
      ],
      confidence: 0.8
    };
  }

  private handleAnalysisRequest(message: string, context: AIContext): ProcessMessageResponse {
    return {
      content: "I can provide insights and analysis on your publishing workflows. Here's what I can analyze:",
      actions: [
        {
          type: 'navigate',
          label: 'View Analytics Dashboard',
          data: { route: '/analytics' }
        }
      ],
      suggestions: [
        { text: 'Analyze quote conversion rates', category: 'analysis', priority: 1, context: 'quotes' },
        { text: 'Review supplier performance', category: 'analysis', priority: 2, context: 'suppliers' },
        { text: 'Format popularity trends', category: 'analysis', priority: 3, context: 'formats' }
      ],
      confidence: 0.8
    };
  }

  private handleGeneralQuery(message: string, context: AIContext): ProcessMessageResponse {
    const currentPage = context.currentPage || '';
    
    return {
      content: `I'm WorkflowGPT, your AI assistant for publishing and print management. I can help you with:

• Creating and managing formats, products, and quotes
• Finding and analyzing data across your workflow
• Suggesting optimizations and best practices
• Automating routine tasks

Currently you're on ${currentPage}. What would you like to do?`,
      suggestions: this.getContextualSuggestions(context),
      confidence: 0.9
    };
  }

  private getContextualSuggestions(context: AIContext): AISuggestion[] {
    const currentPage = context.currentPage || '';
    
    if (currentPage.includes('/formats')) {
      return [
        { text: 'Create a new format', category: 'workflow', priority: 1, context: 'formats' },
        { text: 'Analyze format usage', category: 'analysis', priority: 2, context: 'formats' },
        { text: 'Suggest format optimizations', category: 'automation', priority: 3, context: 'formats' }
      ];
    }
    
    if (currentPage.includes('/products')) {
      return [
        { text: 'Add new product', category: 'workflow', priority: 1, context: 'products' },
        { text: 'Find products missing data', category: 'data', priority: 2, context: 'products' },
        { text: 'Suggest pricing strategy', category: 'analysis', priority: 3, context: 'products' }
      ];
    }
    
    return [
      { text: 'Show me today\'s priorities', category: 'workflow', priority: 1, context: 'general' },
      { text: 'What needs my attention?', category: 'workflow', priority: 2, context: 'general' },
      { text: 'Analyze recent performance', category: 'analysis', priority: 3, context: 'general' }
    ];
  }

  async getWorkflowSuggestions(context: AIContext) {
    // This would eventually call your AI service for workflow optimization
    return [];
  }

  async executeAction(action: any, context: AIContext) {
    // This would execute the specific action requested by the AI
    console.log('Executing AI action:', action, 'with context:', context);
  }
}

export const aiService = new AIService();

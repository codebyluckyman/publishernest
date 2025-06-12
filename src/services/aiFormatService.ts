
import { AIContext, AIMessage, AISuggestion } from '@/types/aiAssistant';

interface FormatCreationRequest {
  type: 'hardcover' | 'paperback' | 'board_book' | 'custom';
  targetAudience?: 'children' | 'adult' | 'young_adult';
  bookType?: 'picture_book' | 'novel' | 'textbook' | 'reference';
  specifications?: Partial<FormatSpecifications>;
}

interface FormatSpecifications {
  format_name: string;
  tps_height_mm?: number;
  tps_width_mm?: number;
  tps_depth_mm?: number;
  binding_type?: string;
  cover_material?: string;
  internal_material?: string;
  orientation?: string;
  extent?: string;
}

class AIFormatService {
  
  /**
   * Analyze user input to detect format creation intent
   */
  detectFormatIntent(message: string): FormatCreationRequest | null {
    const lowerMessage = message.toLowerCase();
    
    // Detect format type
    let type: FormatCreationRequest['type'] = 'custom';
    if (lowerMessage.includes('hardcover') || lowerMessage.includes('hard cover')) {
      type = 'hardcover';
    } else if (lowerMessage.includes('paperback') || lowerMessage.includes('soft cover')) {
      type = 'paperback';
    } else if (lowerMessage.includes('board book') || lowerMessage.includes('boardbook')) {
      type = 'board_book';
    }
    
    // Detect target audience
    let targetAudience: FormatCreationRequest['targetAudience'];
    if (lowerMessage.includes('children') || lowerMessage.includes('kids') || lowerMessage.includes('child')) {
      targetAudience = 'children';
    } else if (lowerMessage.includes('young adult') || lowerMessage.includes('ya') || lowerMessage.includes('teen')) {
      targetAudience = 'young_adult';
    } else if (lowerMessage.includes('adult')) {
      targetAudience = 'adult';
    }
    
    // Detect book type
    let bookType: FormatCreationRequest['bookType'];
    if (lowerMessage.includes('picture book') || lowerMessage.includes('picture')) {
      bookType = 'picture_book';
    } else if (lowerMessage.includes('novel') || lowerMessage.includes('fiction')) {
      bookType = 'novel';
    } else if (lowerMessage.includes('textbook') || lowerMessage.includes('educational')) {
      bookType = 'textbook';
    } else if (lowerMessage.includes('reference') || lowerMessage.includes('manual')) {
      bookType = 'reference';
    }
    
    // Only return if we detected format-related intent
    if (lowerMessage.includes('format') && (lowerMessage.includes('create') || lowerMessage.includes('new') || lowerMessage.includes('add'))) {
      return { type, targetAudience, bookType };
    }
    
    return null;
  }
  
  /**
   * Generate intelligent format specifications based on detected intent
   */
  generateFormatSpecifications(request: FormatCreationRequest): FormatSpecifications {
    const baseSpecs = this.getBaseSpecifications(request.type, request.targetAudience, request.bookType);
    
    return {
      format_name: this.generateFormatName(request),
      ...baseSpecs,
      ...request.specifications
    };
  }
  
  /**
   * Get base specifications for different format types
   */
  private getBaseSpecifications(type: string, audience?: string, bookType?: string): Partial<FormatSpecifications> {
    const specs: Record<string, Partial<FormatSpecifications>> = {
      hardcover_children_picture: {
        tps_height_mm: 280,
        tps_width_mm: 216,
        tps_depth_mm: 10,
        binding_type: 'Case Bound',
        cover_material: 'Art Board',
        internal_material: 'Art Paper',
        orientation: 'Portrait',
        extent: '32pp'
      },
      paperback_adult_novel: {
        tps_height_mm: 198,
        tps_width_mm: 129,
        tps_depth_mm: 15,
        binding_type: 'Perfect Bound',
        cover_material: 'Art Board',
        internal_material: 'Book Paper',
        orientation: 'Portrait',
        extent: '320pp'
      },
      board_book_children: {
        tps_height_mm: 180,
        tps_width_mm: 180,
        tps_depth_mm: 15,
        binding_type: 'Board Book',
        cover_material: 'Board',
        internal_material: 'Board',
        orientation: 'Square',
        extent: '12pp'
      }
    };
    
    const key = `${type}_${audience || 'adult'}_${bookType || 'novel'}`;
    return specs[key] || specs.paperback_adult_novel;
  }
  
  /**
   * Generate intelligent format name
   */
  private generateFormatName(request: FormatCreationRequest): string {
    const parts = [];
    
    if (request.targetAudience) {
      parts.push(request.targetAudience.replace('_', ' '));
    }
    
    if (request.bookType) {
      parts.push(request.bookType.replace('_', ' '));
    }
    
    parts.push(request.type.replace('_', ' '));
    
    return parts.map(part => 
      part.split(' ').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ')
    ).join(' ');
  }
  
  /**
   * Generate contextual suggestions for format operations
   */
  generateFormatSuggestions(context: AIContext): AISuggestion[] {
    const suggestions: AISuggestion[] = [];
    
    if (context.currentPage?.includes('/formats')) {
      suggestions.push(
        { text: 'Create children\'s picture book format', category: 'workflow', priority: 1, context: 'formats' },
        { text: 'Create adult novel paperback format', category: 'workflow', priority: 2, context: 'formats' },
        { text: 'Create hardcover format for textbooks', category: 'workflow', priority: 3, context: 'formats' }
      );
    }
    
    return suggestions;
  }
  
  /**
   * Detect format update intent
   */
  detectUpdateIntent(message: string): { formatId?: string; updates: string[] } {
    const lowerMessage = message.toLowerCase();
    const updates: string[] = [];
    
    if (lowerMessage.includes('update') || lowerMessage.includes('change') || lowerMessage.includes('modify')) {
      if (lowerMessage.includes('size') || lowerMessage.includes('dimension')) {
        updates.push('dimensions');
      }
      if (lowerMessage.includes('binding')) {
        updates.push('binding');
      }
      if (lowerMessage.includes('material')) {
        updates.push('materials');
      }
      if (lowerMessage.includes('name') || lowerMessage.includes('title')) {
        updates.push('name');
      }
    }
    
    return { updates };
  }
}

export const aiFormatService = new AIFormatService();

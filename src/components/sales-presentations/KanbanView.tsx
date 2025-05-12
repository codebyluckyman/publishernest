
import { useState, useEffect } from 'react';
import KanbanBoard from 'react-custom-kanban-board';
import { Product } from '@/types/product';
import { formatPrice } from '@/utils/productUtils';

interface KanbanViewProps {
  products: Array<{
    product: Product;
    customPrice?: number;
    customDescription?: string;
  }>;
  onSelectProduct: (product: {
    product: Product;
    customPrice?: number;
    customDescription?: string;
  }) => void;
}

export function KanbanView({ products, onSelectProduct }: KanbanViewProps) {
  const [boardData, setBoardData] = useState<any[]>([]);
  
  useEffect(() => {
    // Transform products into kanban-compatible data
    const publishers = new Map<string, any[]>();
    
    // Group products by publisher
    products.forEach(item => {
      const publisherName = item.product.publisher_name || 'Other';
      
      if (!publishers.has(publisherName)) {
        publishers.set(publisherName, []);
      }
      
      publishers.get(publisherName)?.push({
        id: item.product.id,
        title: item.product.title,
        description: item.product.synopsis 
          ? item.product.synopsis.substring(0, 100) + '...' 
          : '',
        metadata: {
          isbn: item.product.isbn13 || 'N/A',
          price: formatPrice(item.product.list_price, item.product.default_currency),
          imageUrl: item.product.cover_image_url,
          publicationDate: item.product.publication_date 
            ? new Date(item.product.publication_date).toLocaleDateString() 
            : 'N/A',
          originalItem: item
        }
      });
    });
    
    // Convert to the structure required by the kanban board
    const columnsData = Array.from(publishers.entries()).map(([publisherName, items]) => ({
      id: publisherName,
      title: publisherName,
      cards: items
    }));
    
    setBoardData(columnsData);
  }, [products]);
  
  // Custom card component to render product cards
  const CustomCard = ({ card }: { card: any }) => {
    const handleClick = () => {
      if (card && card.metadata && card.metadata.originalItem) {
        onSelectProduct(card.metadata.originalItem);
      }
    };
    
    return (
      <div 
        className="bg-white rounded-lg shadow p-4 cursor-pointer hover:shadow-md transition-shadow"
        onClick={handleClick}
      >
        {card.metadata.imageUrl ? (
          <img 
            src={card.metadata.imageUrl} 
            alt={card.title} 
            className="w-full h-32 object-cover mb-3 rounded"
          />
        ) : (
          <div className="w-full h-32 bg-gray-100 flex items-center justify-center mb-3 rounded">
            <span className="text-gray-400">No Image</span>
          </div>
        )}
        
        <h3 className="font-medium text-sm line-clamp-2 mb-1">{card.title}</h3>
        
        <div className="text-xs text-gray-500 mb-1">
          <span className="font-medium">ISBN:</span> {card.metadata.isbn}
        </div>
        
        <div className="text-xs text-gray-500 mb-1">
          <span className="font-medium">Price:</span> {card.metadata.price}
        </div>
        
        {card.description && (
          <p className="text-xs text-gray-500 mt-2 line-clamp-2">
            {card.description}
          </p>
        )}
      </div>
    );
  };

  // Extract all cards to create initialCards array required by KanbanBoard
  const initialCards = boardData.flatMap(column => column.cards || []);

  // Function for columnForAddCard prop - this determines which column a new card would be added to
  // We'll default to the first column, or "Other" if available
  const columnForAddCard = () => {
    if (boardData.length === 0) return "";
    const otherColumn = boardData.find(col => col.id === 'Other');
    return otherColumn ? otherColumn.id : boardData[0].id;
  };

  return (
    <div className="w-full">
      <div className="kanban-wrapper">
        <style dangerouslySetInnerHTML={{
          __html: `
          .kanban-wrapper {
            margin-top: 20px;
          }
          .custom-kanban-board {
            background-color: #f9fafb;
            padding: 1rem;
            border-radius: 0.5rem;
            display: flex;
            overflow-x: auto;
            gap: 1rem;
            min-height: 400px;
          }
          .custom-kanban-column {
            background-color: #f3f4f6;
            border-radius: 0.5rem;
            padding: 0.75rem;
            width: 300px;
            min-width: 300px;
          }
          .custom-kanban-column-header {
            margin-bottom: 0.75rem;
            font-weight: 600;
            padding: 0.5rem;
            border-bottom: 1px solid #e5e7eb;
          }
          .custom-kanban-card-list {
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
          }
        `}} />

        <KanbanBoard 
          columns={boardData}
          renderCard={(props) => <CustomCard card={props} />}
          initialCards={initialCards}
          columnForAddCard={columnForAddCard}
        />
      </div>
    </div>
  );
}

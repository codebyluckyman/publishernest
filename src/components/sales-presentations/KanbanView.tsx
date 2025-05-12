
import { useState, useEffect } from 'react';
import { 
  KanbanComponent, 
  ColumnsDirective, 
  ColumnDirective,
  CardSettingsModel
} from '@syncfusion/ej2-react-kanban';
import '@syncfusion/ej2-base/styles/material.css';
import '@syncfusion/ej2-react-kanban/styles/material.css';
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

interface KanbanProduct {
  Id: string;
  Title: string;
  Price: string;
  ISBN: string;
  Publisher: string;
  PublicationDate: string;
  ImageUrl?: string;
  Category: string;
  Summary?: string;
  _original: {
    product: Product;
    customPrice?: number;
    customDescription?: string;
  };
}

export function KanbanView({ products, onSelectProduct }: KanbanViewProps) {
  const [kanbanData, setKanbanData] = useState<KanbanProduct[]>([]);
  
  useEffect(() => {
    // Transform products into kanban-compatible data
    const transformedData = products.map(item => {
      const publisherCategory = item.product.publisher_name || 'Other';
      
      return {
        Id: item.product.id,
        Title: item.product.title,
        Price: formatPrice(item.product.list_price, item.product.default_currency),
        ISBN: item.product.isbn13 || 'N/A',
        Publisher: item.product.publisher_name || 'N/A',
        PublicationDate: item.product.publication_date 
          ? new Date(item.product.publication_date).toLocaleDateString() 
          : 'N/A',
        ImageUrl: item.product.cover_image_url,
        Category: publisherCategory,
        Summary: item.product.synopsis?.substring(0, 100) + '...',
        _original: item
      };
    });
    
    setKanbanData(transformedData);
    
  }, [products]);
  
  // Group products by publisher
  const getUniquePublishers = () => {
    const publishers = products
      .map(item => item.product.publisher_name || 'Other')
      .filter((v, i, a) => a.indexOf(v) === i);
    
    return publishers.length > 0 ? publishers : ['Other'];
  };
  
  const cardSettings: CardSettingsModel = {
    contentField: 'Title',
    headerField: 'Title',
    template: '#kanbanCardTemplate'
  };
  
  const publishers = getUniquePublishers();

  const handleCardClick = (args: any) => {
    if (args.data && args.data._original) {
      onSelectProduct(args.data._original);
    }
  };
  
  return (
    <div className="w-full">
      <style>
        {`
          .e-kanban .e-card-wrapper {
            cursor: pointer;
          }
          .e-kanban .e-card .e-card-image {
            width: 100%;
            height: 120px;
            object-fit: cover;
            margin-bottom: 8px;
          }
          .e-kanban .e-card .e-card-isbn,
          .e-kanban .e-card .e-card-price {
            font-size: 12px;
            color: #666;
            margin-top: 4px;
          }
        `}
      </style>
      
      <div id="kanbanCardTemplate" style={{ display: 'none' }}>
        <div className="e-card-content">
          ${if(ImageUrl)}$
          <img className="e-card-image" src="${ImageUrl}" alt="${Title}" />
          ${else}$
          <div style="height: 120px; background-color: #f2f2f2; display: flex; align-items: center; justify-content: center; margin-bottom: 8px;">
            No Image
          </div>
          ${/if}$
          <div className="e-card-title">${Title}</div>
          <div className="e-card-isbn">ISBN: ${ISBN}</div>
          <div className="e-card-price">${Price}</div>
          ${if(Summary)}$
          <div className="e-card-summary" style="margin-top: 8px; font-size: 12px; color: #666;">${Summary}</div>
          ${/if}$
        </div>
      </div>
      
      <KanbanComponent
        id="kanbanProducts"
        keyField="Category"
        dataSource={kanbanData}
        cardSettings={cardSettings}
        cardClick={handleCardClick}
        height="600px"
      >
        <ColumnsDirective>
          {publishers.map(publisher => (
            <ColumnDirective 
              key={publisher} 
              headerText={publisher} 
              keyField={publisher} 
            />
          ))}
        </ColumnsDirective>
      </KanbanComponent>
    </div>
  );
}

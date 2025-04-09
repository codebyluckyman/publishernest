# Project Knowledge File

## Project Overview
This is a publishing company management application designed for designers, production personnel, and sales people. The application focuses on managing quotes, formats, suppliers, and products with a clean, minimalistic design approach. At the heart of the project is the ability for external parties (suppliers) to submit quotes through the platform, reducing the amount of manual workload to manage email responses and paper trails.

## Design Principles
- **Clean & Minimalistic**: The UI should be simple, uncluttered, and easy to navigate
- **Consistency**: Maintain design consistency across all pages, modals, popovers, and dropdowns
- **Visual Appeal**: Use professional, appealing visuals that reflect publishing industry standards
- **Accessibility**: Ensure the application is accessible to all users regardless of technical expertise

## Navigation Structure
The application's navigation is organized into three primary categories:

1. **Quotes**
   - Quote Requests - Create and manage quote requests to suppliers
   - Quotes - View and manage supplier quotes and responses

2. **Production**
   - Suppliers - Manage supplier information and relationships
   - Print Runs - Track production timelines
   - Purchase Orders - Create and manage orders to suppliers

3. **Sales**
   - Customers - Maintain customer information and relationships
   - Sales Orders - Generate and track client orders

Each category has a collapsed/expandable submenu for easier navigation and organization.

## Core Features

### Quote Request Management
- Create, view, edit and delete quote requests
- Send quote requests to suppliers
- Track quote request status
- Manage supplier quotes and responses
- Compare quotes from different suppliers
- Auto-generated reference IDs (QR-XXXXXX format) for each organization

## Supplier Quote Management
- Suppliers to create, view, edit, submit and delete quotes and responses
- Suppliers to see only the quote responses they have been invited to respond to
- Suppliers to collaborate with publishers through chat features

### Format Management
- Create and manage format specifications (dimensions, material, binding, etc.)
- Link formats to products
- Apply formats to quote requests

### Product Management
- Store and manage product information
- Associate products with formats
- Track product inventory

### Supplier Management
- Maintain supplier information and contacts
- Track supplier performance
- Manage supplier relationships

## User Roles

### Designers
- Need access to format specifications
- Create and manage formats
- Collaborate on product specifications

### Production Personnel
- Create and manage quote requests
- Evaluate supplier quotes
- Track production timelines
- Manage formats and product specifications

### Sales People
- Access pricing information
- View product details and availability
- Generate quotes for clients

## Technical Implementation

### Frontend
- React application built with Vite
- TypeScript for type safety
- Tailwind CSS for styling
- Shadcn UI component library
- React Query for data fetching and state management

### Backend
- Supabase for database and authentication
- PostgreSQL database
- Row-level security policies
- Edge functions for custom server-side logic

### Data Structure
- Organizations own all other entities
- Formats define physical specifications of products
- Products are linked to formats
- Quote requests can include multiple formats and products
- Supplier quotes respond to quote requests

## Common Workflows

### Creating a Quote Request
1. User navigates to Quote Requests page
2. User clicks "Create Quote Request"
3. User fills in basic information
4. User adds formats and/or products
5. User specifies quantity, additional costs, and savings
6. User selects suppliers to send the request to
7. User submits the quote request

### Managing Supplier Quotes
1. Supplier receives a quote request
2. Supplier creates a quote response with pricing
3. Supplier submits the quote
4. Production personnel reviews and compares quotes
5. Production personnel accepts or declines quotes

### Working with Formats
1. Designer creates a new format with specifications
2. Format is saved to the database
3. Format becomes available for use in products and quote requests
4. Production personnel can use the format when creating quote requests

## Application Structure

### Pages
- Dashboard/Home
- Formats
- Products
- Quote Requests
- Supplier Quotes
- Suppliers
- Organization Settings

### Core Components
- Format specifications display
- Quote request form
- Supplier quote form
- Price breaks section
- Format selection

## Data Flows

### Quote Request Flow
Quote Request → Format Selection → Product Association → Price Breaks → Extra Costs/Savings → Supplier Selection → Submission

### Supplier Quote Flow
Quote Request Received → Review Request → Create Quote Response → Set Pricing → Submit Quote

### Format Management Flow
1. When not associated with a product (for new formats, a product may not exist yet).
Create Format → Set Specifications → Use in Quote Requests
2. When a associated with a product
Create Format → Set Specifications → Associate with Products → Use in Quote Requests

## Important Considerations
- Ensure currency consistency across the application
- Maintain data integrity between related entities
- Preserve user context when navigating between pages
- Optimize performance for potentially large data sets
- Ensure proper permissions based on user roles

## Product Display Guidelines

### Product Detail Presentation
When displaying products in line item tables, lists, or detail views, always include the following information in this order:
1. Cover Image (with a fallback placeholder if no image is available)
2. Product Title
3. ISBN-13 (if available)
4. Additional details like format, edition, etc.

#### Recommended Display Approach
- Cover Image: Small thumbnail (50-75px height recommended)
- Use `object-fit: cover` to maintain image aspect ratio
- Fallback to a default placeholder image if no cover image exists
- Ensure images are aligned and consistent across different views

#### Minimum Required Fields
For each product display, prioritize:
- `cover_image_url`
- `title`
- `isbn13`
- `format_name` (if applicable)

#### Fallback and Error Handling
- Always provide a fallback mechanism for missing images
  - Use `/placeholder.svg` for missing cover images
- Gracefully handle missing data:
  - Use "N/A" or "—" for missing ISBN or other identifiers
  - Provide meaningful default text for missing information

#### Consistent Formatting
- Use Tailwind CSS classes for consistent styling
- Implement responsive design principles
- Maintain a clean, minimalistic approach to product information display

This ensures a uniform and informative product representation across the application, improving user experience and information clarity.

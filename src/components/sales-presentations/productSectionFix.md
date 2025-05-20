
# ProductSection.tsx Fix Instructions

To fix the type errors in ProductSection.tsx:

1. Import the adapter at the top of the file:
```typescript
import { adaptProductsToProductWithFormat } from "@/utils/productFormatAdapter";
```

2. Find lines 407, 409, and 411 where there are type errors about incompatible Product vs ProductWithFormat.

3. For each of these lines, wrap the product arrays with the adapter function:

```typescript
// Original code:
setFilteredProducts(filteredProducts.filter(...));

// Fixed code:
setFilteredProducts(adaptProductsToProductWithFormat(filteredProducts.filter(...)));
```

4. Similarly, find any other places where product arrays are assigned to state variables or props that expect ProductWithFormat[] and apply the same fix.

Exact fixes for the three lines:

```typescript
// Line 407 fix:
setFilteredProducts(
  adaptProductsToProductWithFormat(
    filteredProducts.filter((p) => p.product.title.toLowerCase().includes(search.toLowerCase()))
  )
);

// Line 409 fix:
setFilteredProducts(
  adaptProductsToProductWithFormat(
    filteredProducts.sort((a, b) => a.product.title.localeCompare(b.product.title))
  )
);

// Line 411 fix:
setFilteredProducts(
  adaptProductsToProductWithFormat(
    filteredProducts.sort((a, b) => b.product.title.localeCompare(a.product.title))
  )
);
```

# PresentationsTable.tsx Fix Instructions

For the PresentationsTable.tsx error, look for line 148 where you're using `accessorKey` and change it to `accessor`:

```typescript
// Original code:
const column = sortConfig.column as keyof SalesPresentation;
const aValue = a[column]; // This is likely fine
const bValue = b[column]; // This is likely fine

// If you're using something like:
columns.find(col => col.accessorKey === someValue)

// Change it to:
columns.find(col => col.accessor === someValue) // or appropriate property
```

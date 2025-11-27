# StatusTable Component Documentation

## Overview

A fully-featured, production-ready table component with search, sorting, and pagination capabilities built with React, TypeScript, and Tailwind CSS.

## Features

✅ **Search Functionality**
- Real-time client-side search across multiple fields
- Search reset when cleared
- Auto-reset to first page on search

✅ **Column Sorting**
- Click column headers to sort
- Toggle between ascending/descending
- Visual indicators for sort direction
- Supports string, boolean, and date sorting

✅ **Pagination**
- Configurable items per page (5, 10, 25, 50)
- Smart page number display with ellipsis
- First/Previous/Next/Last navigation
- Current page indicator
- Results count display

✅ **Accessibility**
- ARIA labels for controls
- Semantic HTML
- Keyboard navigation support
- Proper form labels

✅ **Performance**
- Uses `useMemo` for filtering and sorting
- Optimized re-renders
- Client-side data processing

✅ **Responsive Design**
- Mobile-friendly layout
- Flex-based controls
- Overflow handling for table content

✅ **Dark Mode Support**
- Full theme compatibility
- Dynamic color classes

## Usage

### Basic Implementation

```tsx
import StatusTable from '@/components/admin/status/statusTable';
import { fetchAllStatuses } from '@/actions/status';

export default async function StatusPage() {
  const result = await fetchAllStatuses();
  
  return (
    <div>
      <h1>Status Management</h1>
      <StatusTable initialData={result.data} />
    </div>
  );
}
```

### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `initialData` | `readonly StatusData[]` | Yes | Array of status objects to display |

### Data Type

```typescript
interface StatusData {
  _id: string;
  status_name: string;
  type_id: string;
  description: string;
  isactive: boolean;
  createdAt: string;
  updatedAt: string;
}
```

## Best Practices Implemented

### 1. **Type Safety**
- Full TypeScript implementation
- Readonly props to prevent mutations
- Proper type definitions for all functions

### 2. **Performance Optimization**
- `useMemo` for expensive computations
- Prevents unnecessary re-renders
- Efficient filtering and sorting algorithms

### 3. **Code Quality**
- ESLint compliant
- No array index keys (uses unique IDs)
- Proper accessibility attributes
- Clean, maintainable code structure

### 4. **User Experience**
- Instant visual feedback
- Clear data presentation
- Intuitive controls
- Loading states considered

### 5. **State Management**
- Local state for UI controls
- No prop drilling
- Clear separation of concerns

### 6. **Search Implementation**
- Case-insensitive search
- Multi-field search capability
- Debouncing can be added if needed

### 7. **Pagination Logic**
- Smart ellipsis placement
- Maintains state correctly
- Edge case handling

## Customization

### Adding New Columns

1. Update the `StatusData` interface in `actions/status.ts`
2. Add new table header in the `<thead>` section
3. Add corresponding data cell in the `<tbody>` section
4. Optionally add sorting capability

Example:
```tsx
<th
  className="cursor-pointer px-4 py-4 font-medium text-black dark:text-white"
  onClick={() => handleSort('new_field')}
>
  <div className="flex items-center gap-2">
    New Field
    {renderSortIcon('new_field')}
  </div>
</th>
```

### Adjusting Search Fields

Modify the filter function in `filteredAndSortedData`:

```tsx
const filtered = [...initialData].filter((item) => {
  const searchLower = searchTerm.toLowerCase();
  return (
    item.status_name.toLowerCase().includes(searchLower) ||
    item.type_id.toLowerCase().includes(searchLower) ||
    item.description.toLowerCase().includes(searchLower) ||
    item.new_field.toLowerCase().includes(searchLower) // Add new field
  );
});
```

### Changing Default Settings

Modify initial state values:

```tsx
const [itemsPerPage, setItemsPerPage] = useState(25); // Change default
const [sortField, setSortField] = useState<SortField>('status_name'); // Change default sort
```

## Server Actions

### Required Action

Create or update `actions/status.ts`:

```typescript
'use server';

import Status from "@/models/status";
import connectDB from "@/config/database";
import { convertToPlainObject } from "@/lib/utils";

export interface StatusData {
  _id: string;
  status_name: string;
  type_id: string;
  description: string;
  isactive: boolean;
  createdAt: string;
  updatedAt: string;
}

export async function fetchAllStatuses(): Promise<{ data: StatusData[] }> {
  try {
    await connectDB();
    const statuses = await Status.find({});
    const plainStatuses = statuses.map(convertToPlainObject);
    return {
      data: plainStatuses as StatusData[],
    };
  } catch (error) {
    console.error("Error fetching statuses:", error);
    return {
      data: [],
    };
  }
}
```

## Extending Functionality

### Adding Server-Side Pagination

For large datasets, implement server-side pagination:

1. Modify the component to accept pagination callbacks
2. Create server actions with skip/limit
3. Update state management to trigger API calls
4. Add loading states

### Adding Filters

Add filter controls above the table:

```tsx
const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

// In the filter logic
const filtered = [...initialData].filter((item) => {
  if (statusFilter !== 'all' && item.isactive !== (statusFilter === 'active')) {
    return false;
  }
  // ... rest of search logic
});
```

### Adding Export Functionality

```tsx
const exportToCSV = () => {
  const csv = [
    ['Status Name', 'Type ID', 'Description', 'Active', 'Created'],
    ...filteredAndSortedData.map(item => [
      item.status_name,
      item.type_id,
      item.description,
      item.isactive ? 'Yes' : 'No',
      new Date(item.createdAt).toLocaleDateString()
    ])
  ].map(row => row.join(',')).join('\n');
  
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'statuses.csv';
  a.click();
};
```

## Testing Considerations

### Unit Tests

Test the following:
- Search filtering logic
- Sorting algorithms
- Pagination calculations
- State updates

### Integration Tests

- Full user workflows
- Search → Sort → Paginate
- Edge cases (empty data, single item)

## Dependencies

Required packages:
```json
{
  "@heroicons/react": "^2.x",
  "react": "^18.x",
  "next": "^14.x"
}
```

## Troubleshooting

### Issue: Data not displaying
- Ensure `initialData` prop is passed correctly
- Check data format matches `StatusData` interface
- Verify server action returns proper structure

### Issue: Search not working
- Check field names in filter function match data structure
- Ensure data includes searchable string fields

### Issue: Pagination incorrect
- Verify `totalPages` calculation
- Check `currentPage` state updates
- Ensure `itemsPerPage` is set correctly

## Future Enhancements

- [ ] Server-side pagination for large datasets
- [ ] Column visibility toggle
- [ ] Bulk actions (select multiple rows)
- [ ] Export to CSV/Excel
- [ ] Advanced filters
- [ ] Saved views/preferences
- [ ] Row expansion for details
- [ ] Inline editing
- [ ] Drag-and-drop column reordering
- [ ] Customizable column widths

## License

This component is part of your Next.js application.

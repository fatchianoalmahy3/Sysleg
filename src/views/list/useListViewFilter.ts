import { useMemo } from 'react';
import { ModuleSchema } from '../../core/types';
import { FilterState } from '../../components/FilterModal';

interface UseListViewFilterProps {
  schema: ModuleSchema;
  data: any[];
  searchQuery: string;
  activeFilters: FilterState;
}

export function useListViewFilter({
  schema,
  data,
  searchQuery,
  activeFilters
}: UseListViewFilterProps) {
  // Compute active filter criteria count safely
  const activeFilterCount = useMemo(() => {
    let count = 0;
    Object.keys(activeFilters.categories).forEach((key) => {
      const arr = activeFilters.categories[key];
      if (Array.isArray(arr) && arr.length > 0) count += arr.length;
    });
    Object.keys(activeFilters.numberRanges).forEach((key) => {
      const range = activeFilters.numberRanges[key];
      if (range && range.min !== undefined && range.min !== '') count++;
      if (range && range.max !== undefined && range.max !== '') count++;
    });
    if (activeFilters.sortBy) count++;
    return count;
  }, [activeFilters]);

  // Apply search query, filters, and sorting to data
  const filteredAndSortedData = useMemo(() => {
    let result = [...data];

    // 1. Text Search across schema fields
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(item => {
        return schema.fields.some(field => {
          const val = item[field.key];
          if (val === undefined || val === null) return false;
          if (typeof val === 'object') {
            return JSON.stringify(val).toLowerCase().includes(q);
          }
          return String(val).toLowerCase().includes(q);
        }) || (item.id && String(item.id).toLowerCase().includes(q));
      });
    }

    // 2. Multi-Select / Category Filters
    Object.keys(activeFilters.categories).forEach((fieldKey) => {
      const selectedVals = activeFilters.categories[fieldKey];
      if (Array.isArray(selectedVals) && selectedVals.length > 0) {
        result = result.filter(item => selectedVals.includes(String(item[fieldKey])));
      }
    });

    // 3. Number Ranges Filters
    Object.keys(activeFilters.numberRanges).forEach((fieldKey) => {
      const range = activeFilters.numberRanges[fieldKey];
      if (range) {
        if (range.min !== undefined && range.min !== '') {
          result = result.filter(item => {
            const num = Number(item[fieldKey]);
            return !isNaN(num) && num >= Number(range.min);
          });
        }
        if (range.max !== undefined && range.max !== '') {
          result = result.filter(item => {
            const num = Number(item[fieldKey]);
            return !isNaN(num) && num <= Number(range.max);
          });
        }
      }
    });

    // 4. Sorting
    if (activeFilters.sortBy) {
      const sortKey = activeFilters.sortBy;
      const isDesc = activeFilters.sortOrder === 'desc';
      result.sort((a, b) => {
        const valA = a[sortKey];
        const valB = b[sortKey];

        if (valA === undefined || valA === null) return isDesc ? -1 : 1;
        if (valB === undefined || valB === null) return isDesc ? 1 : -1;

        if (typeof valA === 'number' && typeof valB === 'number') {
          return isDesc ? valB - valA : valA - valB;
        }

        const strA = String(valA).toLowerCase();
        const strB = String(valB).toLowerCase();
        if (strA < strB) return isDesc ? 1 : -1;
        if (strA > strB) return isDesc ? -1 : 1;
        return 0;
      });
    }

    return result;
  }, [data, searchQuery, activeFilters, schema.fields]);

  return {
    activeFilterCount,
    filteredAndSortedData
  };
}

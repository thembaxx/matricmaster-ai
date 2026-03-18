import { useCallback, useMemo, useState } from 'react';

export type SortDirection = 'asc' | 'desc';

export interface FilterConfig<T> {
	searchFields: (keyof T | string)[];
	selectFilters?: {
		key: keyof T | string;
		options: string[];
		multiple?: boolean;
	}[];
	booleanFilters?: {
		key: keyof T | string;
	}[];
	dateRangeField?: keyof T | string;
	defaultSort?: {
		field: keyof T | string;
		direction: SortDirection;
	};
}

export interface UseFilterOptions<T> {
	data: T[];
	config: FilterConfig<T>;
	debounceMs?: number;
}

export interface UseFilterReturn<T> {
	searchQuery: string;
	setSearchQuery: (value: string) => void;
	clearSearch: () => void;
	selectedFilters: Record<string, string[]>;
	setSelectedFilter: (key: string, value: string | string[]) => void;
	toggleArrayFilter: (key: string, value: string) => void;
	clearFilter: (key: string) => void;
	clearAllFilters: () => void;
	booleanFilters: Record<string, boolean>;
	setBooleanFilter: (key: string, value: boolean) => void;
	dateRange: { start: Date | null; end: Date | null };
	setDateRange: (range: { start: Date | null; end: Date | null }) => void;
	sort: { field: string; direction: SortDirection };
	setSort: (field: string, direction?: SortDirection) => void;
	pagination: {
		page: number;
		pageSize: number;
		total: number;
	};
	setPage: (page: number) => void;
	setPageSize: (size: number) => void;
	activeFilterCount: number;
	filteredData: T[];
	sortedData: T[];
	paginatedData: T[];
}

export function useFilter<T>({
	data,
	config,
	debounceMs = 0,
}: UseFilterOptions<T>): UseFilterReturn<T> {
	const [searchQuery, setSearchQueryState] = useState('');
	const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>({});
	const [booleanFilters, setBooleanFiltersState] = useState<Record<string, boolean>>({});
	const [dateRange, setDateRangeState] = useState<{ start: Date | null; end: Date | null }>({
		start: null,
		end: null,
	});
	const [sort, setSortState] = useState<{ field: string; direction: SortDirection }>(() => {
		if (config.defaultSort) {
			return {
				field: String(config.defaultSort.field),
				direction: config.defaultSort.direction,
			};
		}
		return { field: '', direction: 'asc' };
	});
	const [pagination, setPagination] = useState({
		page: 1,
		pageSize: 20,
		total: data.length,
	});

	const setSearchQuery = useCallback(
		(value: string) => {
			setSearchQueryState(value);
			if (debounceMs > 0) {
				return;
			}
		},
		[debounceMs]
	);

	const clearSearch = useCallback(() => {
		setSearchQueryState('');
	}, []);

	const setSelectedFilter = useCallback((key: string, value: string | string[]) => {
		const normalizedValue = Array.isArray(value) ? value : [value];
		setSelectedFilters((prev) => ({
			...prev,
			[key]: normalizedValue,
		}));
	}, []);

	const toggleArrayFilter = useCallback((key: string, value: string) => {
		setSelectedFilters((prev) => {
			const current = prev[key] || [];
			const newValue = current.includes(value)
				? current.filter((v) => v !== value)
				: [...current, value];
			return { ...prev, [key]: newValue };
		});
	}, []);

	const clearFilter = useCallback((key: string) => {
		setSelectedFilters((prev) => {
			const { [key]: _, ...rest } = prev;
			return rest;
		});
	}, []);

	const clearAllFilters = useCallback(() => {
		setSelectedFilters({});
		setSearchQueryState('');
		setBooleanFiltersState({});
		setDateRangeState({ start: null, end: null });
		setPagination((prev) => ({ ...prev, page: 1 }));
	}, []);

	const setBooleanFilter = useCallback((key: string, value: boolean) => {
		setBooleanFiltersState((prev) => ({
			...prev,
			[key]: value,
		}));
	}, []);

	const setDateRange = useCallback((range: { start: Date | null; end: Date | null }) => {
		setDateRangeState(range);
	}, []);

	const setSort = useCallback((field: string, direction?: SortDirection) => {
		setSortState((prev) => ({
			field,
			direction: direction || (prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'),
		}));
	}, []);

	const setPage = useCallback((page: number) => {
		setPagination((prev) => ({ ...prev, page }));
	}, []);

	const setPageSize = useCallback((size: number) => {
		setPagination((prev) => ({ ...prev, pageSize: size, page: 1 }));
	}, []);

	const activeFilterCount = useMemo(() => {
		let count = 0;
		if (searchQuery.trim()) count++;
		Object.values(selectedFilters).forEach((values) => {
			if (values.length > 0) count++;
		});
		Object.values(booleanFilters).forEach((value) => {
			if (value) count++;
		});
		if (dateRange.start || dateRange.end) count++;
		return count;
	}, [searchQuery, selectedFilters, booleanFilters, dateRange]);

	const filteredData = useMemo(() => {
		return data.filter((item) => {
			if (searchQuery.trim()) {
				const query = searchQuery.toLowerCase();
				const matchesSearch = config.searchFields.some((field) => {
					const value = item[field as keyof T];
					if (typeof value === 'string') {
						return value.toLowerCase().includes(query);
					}
					return false;
				});
				if (!matchesSearch) return false;
			}

			if (config.selectFilters) {
				for (const filter of config.selectFilters) {
					const key = String(filter.key);
					const selected = selectedFilters[key];
					if (selected && selected.length > 0) {
						const itemValue = item[filter.key as keyof T];
						if (filter.multiple) {
							const itemArray = Array.isArray(itemValue)
								? itemValue
								: typeof itemValue === 'string'
									? itemValue.split(',')
									: [];
							const hasMatch = selected.some((s) =>
								itemArray.map((v) => String(v).toLowerCase()).includes(s.toLowerCase())
							);
							if (!hasMatch) return false;
						} else {
							if (!selected.includes(String(itemValue).toLowerCase())) return false;
						}
					}
				}
			}

			if (config.booleanFilters) {
				for (const filter of config.booleanFilters) {
					const key = String(filter.key);
					const filterValue = booleanFilters[key];
					if (filterValue !== undefined) {
						const itemValue = item[filter.key as keyof T];
						if (filterValue && !itemValue) return false;
					}
				}
			}

			if (config.dateRangeField && (dateRange.start || dateRange.end)) {
				const dateValue = item[config.dateRangeField as keyof T];
				if (dateValue instanceof Date) {
					if (dateRange.start && dateValue < dateRange.start) return false;
					if (dateRange.end && dateValue > dateRange.end) return false;
				} else if (typeof dateValue === 'string' || typeof dateValue === 'number') {
					const timestamp = new Date(dateValue).getTime();
					if (dateRange.start && timestamp < dateRange.start.getTime()) return false;
					if (dateRange.end && timestamp > dateRange.end.getTime()) return false;
				}
			}

			return true;
		});
	}, [data, searchQuery, selectedFilters, booleanFilters, dateRange, config]);

	const sortedData = useMemo(() => {
		if (!sort.field) return filteredData;

		return [...filteredData].sort((a, b) => {
			const aValue = a[sort.field as keyof T];
			const bValue = b[sort.field as keyof T];

			let comparison = 0;
			if (aValue === bValue) {
				comparison = 0;
			} else if (aValue === null || aValue === undefined) {
				comparison = 1;
			} else if (bValue === null || bValue === undefined) {
				comparison = -1;
			} else if (typeof aValue === 'string' && typeof bValue === 'string') {
				comparison = aValue.localeCompare(bValue);
			} else if (typeof aValue === 'number' && typeof bValue === 'number') {
				comparison = aValue - bValue;
			} else {
				comparison = String(aValue).localeCompare(String(bValue));
			}

			return sort.direction === 'asc' ? comparison : -comparison;
		});
	}, [filteredData, sort]);

	const paginatedData = useMemo(() => {
		const start = (pagination.page - 1) * pagination.pageSize;
		const end = start + pagination.pageSize;
		return sortedData.slice(start, end);
	}, [sortedData, pagination.page, pagination.pageSize]);

	useMemo(() => {
		setPagination((prev) => ({ ...prev, total: filteredData.length }));
	}, [filteredData.length]);

	return {
		searchQuery,
		setSearchQuery,
		clearSearch,
		selectedFilters,
		setSelectedFilter,
		toggleArrayFilter,
		clearFilter,
		clearAllFilters,
		booleanFilters,
		setBooleanFilter,
		dateRange,
		setDateRange,
		sort,
		setSort,
		pagination: {
			...pagination,
			total: filteredData.length,
		},
		setPage,
		setPageSize,
		activeFilterCount,
		filteredData,
		sortedData,
		paginatedData,
	};
}

export type { UseFilterReturn as UseFilter };

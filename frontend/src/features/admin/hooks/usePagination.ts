import React, { useEffect, useMemo, useState } from "react";

export interface UsePaginationOptions<T> {
    items: T[];
    itemsPerPage?: number;
    resetDependencies?: React.DependencyList;
}

export interface UsePaginationResult<T> {
    currentPage: number;
    totalPages: number;
    startIndex: number;
    endIndex: number;
    paginatedItems: T[];
    setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
    goToPage: (page: number) => void;
    nextPage: () => void;
    previousPage: () => void;
}

export function usePagination<T>({
    items,
    itemsPerPage = 5,
    resetDependencies = [],
}: UsePaginationOptions<T>): UsePaginationResult<T> {
    const [currentPage, setCurrentPage] = useState(1);

    // Reset current page when filter/search dependencies change
    useEffect(() => {
        setCurrentPage(1);
    }, resetDependencies);

    const totalPages = Math.max(1, Math.ceil(items.length / itemsPerPage));

    // Ensure currentPage does not exceed totalPages when items are deleted
    useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(totalPages);
        }
    }, [currentPage, totalPages]);

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;

    const paginatedItems = useMemo(() => {
        return items.slice(startIndex, endIndex);
    }, [items, startIndex, endIndex]);

    const goToPage = (page: number) => {
        const pageNumber = Math.max(1, Math.min(page, totalPages));
        setCurrentPage(pageNumber);
    };

    const nextPage = () => {
        goToPage(currentPage + 1);
    };

    const previousPage = () => {
        goToPage(currentPage - 1);
    };

    return {
        currentPage,
        totalPages,
        startIndex,
        endIndex,
        paginatedItems,
        setCurrentPage,
        goToPage,
        nextPage,
        previousPage,
    };
}

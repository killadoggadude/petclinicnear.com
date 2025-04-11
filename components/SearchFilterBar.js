import React from 'react';

// Placeholder icons (replace with actual SVGs or an icon library if desired)
const SearchIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
);

const FilterIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
    </svg>
);

// This component receives props for state management
export default function SearchFilterBar({
    searchTerm = '',
    onSearchChange = () => {},
    categories = [], // Array of { slug: string, name: string }
    selectedCategory = '',
    onCategoryChange = () => {},
    selectedRating = 0,
    onRatingChange = () => {},
    selectedReviews = 0,
    onReviewsChange = () => {},
    showCategoryFilter = false // Control if category dropdown is visible
}) {
  return (
    <div className="mb-8 bg-white p-4 md:p-6 rounded-lg shadow-sm border border-gray-200">
      {/* Search Bar Row */}
      <div className="relative mb-4">
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
        />
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <SearchIcon />
        </div>
      </div>

      {/* Filter Row */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        {/* Filter Label & Icon */}
        <div className="flex items-center text-sm font-medium text-gray-700 flex-shrink-0">
          <FilterIcon />
          <span className="ml-1.5">Filter:</span>
        </div>

        {/* Dropdown Filters */}
        <div className="flex-grow flex flex-wrap items-center gap-x-3 gap-y-2">

          {/* Remove Category Filter Section */}
          {/* 
          {showCategoryFilter && categories.length > 0 && (
             <select ... >
                // ... options ...
             </select>
          )}
          */}

          {/* Rating Filter */}
          <select
            value={selectedRating}
            onChange={(e) => onRatingChange(Number(e.target.value))}
            className="form-select block w-auto py-1.5 pl-3 pr-8 border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm rounded-md shadow-sm"
          >
            <option value="0">Any Rating</option>
            <option value="5">★★★★★</option>
            <option value="4">★★★★☆+</option>
            <option value="3">★★★☆☆+</option>
            <option value="2">★★☆☆☆+</option>
            <option value="1">★☆☆☆☆+</option>
          </select>

          {/* Reviews Filter */}
          <select 
            value={selectedReviews}
            onChange={(e) => onReviewsChange(Number(e.target.value))}
            className="form-select block w-auto py-1.5 pl-3 pr-8 border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm rounded-md shadow-sm"
          >
            <option value="0">Any Reviews</option>
            <option value="1">1+ Reviews</option>
            <option value="5">5+ Reviews</option>
            <option value="10">10+ Reviews</option>
            <option value="25">25+ Reviews</option>
            <option value="50">50+ Reviews</option>
          </select>

          {/* Add more dropdowns here if needed */}
        </div>
      </div>
    </div>
  );
}

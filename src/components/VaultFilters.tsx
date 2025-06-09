'use client';

import { useState } from 'react';

interface VaultFiltersProps {
  onFilterChange: (filterBy: string) => void;
  onSortChange: (sortBy: string) => void;
}

export default function VaultFilters({ onFilterChange, onSortChange }: VaultFiltersProps) {
  const [filterBy, setFilterBy] = useState('All Providers');
  const [sortBy, setSortBy] = useState('Target APY');
  const [openDropdown, setOpenDropdown] = useState<'filter' | 'sort' | null>(null);

  const handleFilterChange = (filter: string) => {
    setFilterBy(filter);
    onFilterChange(filter);
    setOpenDropdown(null);
  };

  const handleSortChange = (sort: string) => {
    setSortBy(sort);
    onSortChange(sort);
    setOpenDropdown(null);
  };

  // Close dropdown when clicking outside
  const handleClickOutside = () => {
    setOpenDropdown(null);
  };

  // Toggle dropdown
  const toggleDropdown = (dropdown: 'filter' | 'sort') => {
    setOpenDropdown(openDropdown === dropdown ? null : dropdown);
  };

  return (
    <>
      {/* Overlay to handle clicking outside */}
      {openDropdown && (
        <div
          onClick={handleClickOutside}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 5
          }}
        />
      )}
      
      <div className="filter-container">
        <div className="filter-button-container">
          <button 
            className="filter-button"
            onClick={() => toggleDropdown('filter')}
          >
            <span>Filter by: {filterBy}</span>
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              style={{
                width: '1rem',
                height: '1rem',
                transform: openDropdown === 'filter' ? 'rotate(180deg)' : 'none',
                transition: 'transform 0.2s'
              }}
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {openDropdown === 'filter' && (
            <div className="filter-dropdown">
              <div className="filter-dropdown-item" onClick={() => handleFilterChange('All Providers')}>
                All Providers
              </div>
              <div className="filter-dropdown-item" onClick={() => handleFilterChange('Lagoon Finance')}>
                Lagoon Finance
              </div>
            </div>
          )}
        </div>

        <div className="filter-button-container">
          <button 
            className="filter-button"
            onClick={() => toggleDropdown('sort')}
          >
            <span>Sort by: {sortBy}</span>
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              style={{
                width: '1rem',
                height: '1rem',
                transform: openDropdown === 'sort' ? 'rotate(180deg)' : 'none',
                transition: 'transform 0.2s'
              }}
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {openDropdown === 'sort' && (
            <div className="filter-dropdown">
              <div className="filter-dropdown-item" onClick={() => handleSortChange('Target APY')}>
                APR (Highest)
              </div>
              <div className="filter-dropdown-item" onClick={() => handleSortChange('TVL')}>
                TVL (Highest)
              </div>
            </div>
          )}
        </div>


      </div>
    </>
  );
} 
'use client';

import { useState } from 'react';

interface VaultFiltersProps {
  onFilterChange: (filterBy: string) => void;
  onSortChange: (sortBy: string) => void;
}

export default function VaultFilters({ onFilterChange, onSortChange }: VaultFiltersProps) {
  const [filterBy, setFilterBy] = useState('All Providers');
  const [sortBy, setSortBy] = useState('Target APY');

  const filterStyles = {
    container: {
      display: 'flex',
      flexWrap: 'wrap' as 'wrap',
      gap: '1rem',
      marginBottom: '1.5rem'
    },
    buttonContainer: {
      position: 'relative' as 'relative'
    },
    button: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      width: '16rem',
      padding: '0.5rem 1rem',
      border: '1px solid #d1d5db',
      borderRadius: '0.5rem',
      backgroundColor: 'white',
      cursor: 'pointer'
    },
    dropdownIcon: {
      width: '1rem',
      height: '1rem'
    }
  };

  const handleFilterChange = (filter: string) => {
    setFilterBy(filter);
    onFilterChange(filter);
  };

  const handleSortChange = (sort: string) => {
    setSortBy(sort);
    onSortChange(sort);
  };

  return (
    <div style={filterStyles.container}>
      <div style={filterStyles.buttonContainer}>
        <button style={filterStyles.button}>
          <span>Filter by: {filterBy}</span>
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            style={filterStyles.dropdownIcon}
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {/* Dropdown would go here in a real implementation */}
      </div>

      <div style={filterStyles.buttonContainer}>
        <button style={filterStyles.button}>
          <span>Sort by: {sortBy}</span>
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            style={filterStyles.dropdownIcon}
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {/* Dropdown would go here in a real implementation */}
      </div>
    </div>
  );
} 
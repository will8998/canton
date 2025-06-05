'use client';

import { useState } from 'react';

interface VaultFiltersProps {
  onFilterChange: (filterBy: string) => void;
  onSortChange: (sortBy: string) => void;
  onGeographyChange: (geography: string) => void;
}

export default function VaultFilters({ onFilterChange, onSortChange, onGeographyChange }: VaultFiltersProps) {
  const [filterBy, setFilterBy] = useState('All Providers');
  const [sortBy, setSortBy] = useState('Target APY');
  const [geography, setGeography] = useState('All Regions');
  const [openDropdown, setOpenDropdown] = useState<'filter' | 'sort' | 'geography' | null>(null);

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
    },
    dropdown: {
      position: 'absolute' as 'absolute',
      top: 'calc(100% + 0.5rem)',
      left: 0,
      width: '16rem',
      backgroundColor: 'white',
      border: '1px solid #d1d5db',
      borderRadius: '0.5rem',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      zIndex: 10
    },
    dropdownItem: {
      padding: '0.5rem 1rem',
      cursor: 'pointer',
      ':hover': {
        backgroundColor: '#f3f4f6'
      }
    }
  };

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

  const handleGeographyChange = (geo: string) => {
    setGeography(geo);
    onGeographyChange(geo);
    setOpenDropdown(null);
  };

  // Close dropdown when clicking outside
  const handleClickOutside = () => {
    setOpenDropdown(null);
  };

  // Toggle dropdown
  const toggleDropdown = (dropdown: 'filter' | 'sort' | 'geography') => {
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
      
      <div style={filterStyles.container}>
        <div style={filterStyles.buttonContainer}>
          <button 
            style={filterStyles.button}
            onClick={() => toggleDropdown('filter')}
          >
            <span>Filter by: {filterBy}</span>
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              style={{
                ...filterStyles.dropdownIcon,
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
            <div style={filterStyles.dropdown}>
              <div style={filterStyles.dropdownItem} onClick={() => handleFilterChange('All Providers')}>
                All Providers
              </div>
              <div style={filterStyles.dropdownItem} onClick={() => handleFilterChange('XBTO')}>
                XBTO
              </div>
              <div style={filterStyles.dropdownItem} onClick={() => handleFilterChange('Atitlan')}>
                Atitlan
              </div>
              <div style={filterStyles.dropdownItem} onClick={() => handleFilterChange('Forteus')}>
                Forteus
              </div>
            </div>
          )}
        </div>

        <div style={filterStyles.buttonContainer}>
          <button 
            style={filterStyles.button}
            onClick={() => toggleDropdown('sort')}
          >
            <span>Sort by: {sortBy}</span>
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              style={{
                ...filterStyles.dropdownIcon,
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
            <div style={filterStyles.dropdown}>
              <div style={filterStyles.dropdownItem} onClick={() => handleSortChange('Target APY')}>
                Target APY
              </div>
            </div>
          )}
        </div>

        <div style={filterStyles.buttonContainer}>
          <button 
            style={filterStyles.button}
            onClick={() => toggleDropdown('geography')}
          >
            <span>Geography: {geography}</span>
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              style={{
                ...filterStyles.dropdownIcon,
                transform: openDropdown === 'geography' ? 'rotate(180deg)' : 'none',
                transition: 'transform 0.2s'
              }}
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {openDropdown === 'geography' && (
            <div style={filterStyles.dropdown}>
              <div style={filterStyles.dropdownItem} onClick={() => handleGeographyChange('All Regions')}>
                All Regions
              </div>
              <div style={filterStyles.dropdownItem} onClick={() => handleGeographyChange('US')}>
                US
              </div>
              <div style={filterStyles.dropdownItem} onClick={() => handleGeographyChange('Non-US')}>
                Non-US
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
} 
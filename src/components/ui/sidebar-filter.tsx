import React, { useState } from 'react';

interface SidebarFilterProps {
  categories: { id: number; title: string }[];
  selectedCategories: string[];
  onCategoryChange: (cat: string) => void;
  priceRange: [number, number];
  setPriceRange: (range: [number, number]) => void;
  availability: string;
  setAvailability: (val: string) => void;
  onClearAll: () => void;
  filterCount: number;
  searchValue: string;
  setSearchValue: (val: string) => void;
  selectedFilters: { type: string; value: string }[];
  onRemoveFilter: (type: string, value: string) => void;
  onReset: () => void;
  isMobile?: boolean;
  onCloseMobile?: () => void;
}

const SidebarFilter: React.FC<SidebarFilterProps> = ({
  categories,
  selectedCategories,
  onCategoryChange,
  priceRange,
  setPriceRange,
  availability,
  setAvailability,
  onClearAll,
  filterCount,
  searchValue,
  setSearchValue,
  selectedFilters,
  onRemoveFilter,
  onReset,
  isMobile = false,
  onCloseMobile,
}) => {
  const [categoryOpen, setCategoryOpen] = useState(true);
  const [priceOpen, setPriceOpen] = useState(true);
  const [availabilityOpen, setAvailabilityOpen] = useState(true);

  // Filtered categories by search
  const filteredCategories = categories.filter(cat =>
    cat.title.toLowerCase().includes(searchValue.toLowerCase())
  );

  return (
    <aside className={`w-full md:w-64 bg-white border border-[#E73828] rounded-xl p-4 shadow-lg transition-all duration-300 ${isMobile ? 'fixed z-50 top-0 left-0 h-full max-w-[90vw] overflow-y-auto' : ''}`}
      style={isMobile ? { minHeight: '100vh' } : {}}>
      {/* Mobile close button */}
      {isMobile && (
        <button className="mb-4 text-[#E73828] font-bold text-lg" onClick={onCloseMobile}>Close ✕</button>
      )}
      {/* Filter count and clear/reset */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs text-gray-500">{filterCount} products</span>
        <div className="flex gap-2">
          <button className="text-xs text-[#E73828] underline" onClick={onClearAll}>Clear All</button>
          <button className="text-xs text-gray-600 underline" onClick={onReset}>Reset</button>
        </div>
      </div>
      {/* Selected filters as chips */}
      <div className="flex flex-wrap gap-2 mb-4">
        {selectedFilters.map(f => (
          <span key={f.type + f.value} className="bg-[#ffeaea] text-[#E73828] rounded-full px-3 py-1 text-xs flex items-center gap-1 animate-fade-in">
            {f.value}
            <button onClick={() => onRemoveFilter(f.type, f.value)} className="ml-1 text-[#E73828]">✕</button>
          </span>
        ))}
      </div>
      {/* Category group */}
      <div className="mb-4">
        <button className="flex items-center justify-between w-full mb-2" onClick={() => setCategoryOpen(v => !v)}>
          <span className="font-semibold">Category</span>
          <span>{categoryOpen ? '▲' : '▼'}</span>
        </button>
        {categoryOpen && (
          <div className="animate-fade-in">
            <input
              type="text"
              placeholder="Search categories..."
              value={searchValue}
              onChange={e => setSearchValue(e.target.value)}
              className="w-full mb-2 px-3 py-1 border border-[#E0E0E0] rounded"
            />
            <div className="flex flex-col gap-2 max-h-48 overflow-y-auto">
              {filteredCategories.map(cat => (
                <label
                  key={cat.id}
                  className={`flex items-center gap-2 cursor-pointer rounded transition-all duration-200 px-2 py-1
                    ${selectedCategories.includes(cat.title) ? 'bg-[#ffeaea] font-bold border-l-4 border-[#E73828]' : 'hover:bg-[#ffeaea]'}
                  `}
                >
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(cat.title)}
                    onChange={() => onCategoryChange(cat.title)}
                    className="accent-[#E73828]"
                  />
                  <span className={`text-sm transition-colors ${selectedCategories.includes(cat.title) ? 'text-[#E73828]' : 'hover:text-[#E73828]'}`}>{cat.title}</span>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>
      <hr className="my-4 border-[#E0E0E0]" />
      {/* Price group */}
      <div className="mb-4">
        <button className="flex items-center justify-between w-full mb-2" onClick={() => setPriceOpen(v => !v)}>
          <span className="font-semibold">Price</span>
          <span>{priceOpen ? '▲' : '▼'}</span>
        </button>
        {priceOpen && (
          <div className="animate-fade-in flex flex-col gap-2">
            <div className="flex gap-2 items-center">
              <input
                type="number"
                min={0}
                value={priceRange[0]}
                onChange={e => setPriceRange([+e.target.value, priceRange[1]])}
                className="w-20 px-2 py-1 border border-[#E0E0E0] rounded"
                placeholder="Min"
              />
              <span>-</span>
              <input
                type="number"
                min={0}
                value={priceRange[1]}
                onChange={e => setPriceRange([priceRange[0], +e.target.value])}
                className="w-20 px-2 py-1 border border-[#E0E0E0] rounded"
                placeholder="Max"
              />
            </div>
          </div>
        )}
      </div>
      <hr className="my-4 border-[#E0E0E0]" />
      {/* Availability group */}
      <div className="mb-4">
        <button className="flex items-center justify-between w-full mb-2" onClick={() => setAvailabilityOpen(v => !v)}>
          <span className="font-semibold">Availability</span>
          <span>{availabilityOpen ? '▲' : '▼'}</span>
        </button>
        {availabilityOpen && (
          <div className="animate-fade-in flex flex-col gap-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="availability"
                value="all"
                checked={availability === 'all'}
                onChange={() => setAvailability('all')}
                className="accent-[#E73828]"
              />
              <span className="text-sm">All</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="availability"
                value="inStock"
                checked={availability === 'inStock'}
                onChange={() => setAvailability('inStock')}
                className="accent-[#E73828]"
              />
              <span className="text-sm">In Stock</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="availability"
                value="outOfStock"
                checked={availability === 'outOfStock'}
                onChange={() => setAvailability('outOfStock')}
                className="accent-[#E73828]"
              />
              <span className="text-sm">Out of Stock</span>
            </label>
          </div>
        )}
      </div>
    </aside>
  );
};

export default SidebarFilter; 
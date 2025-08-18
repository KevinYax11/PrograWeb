import { useState } from 'react';

export default function PokeNav({ 
  onSearch, 
  onLoad, 
  onFilter, 
  searchQuery, 
  activeFilter, 
  favorites,
  pokemonTypes = [
    'normal', 'fire', 'water', 'electric', 'grass', 'ice',
    'fighting', 'poison', 'ground', 'flying', 'psychic',
    'bug', 'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy'
  ]
}) {
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [localSearch, setLocalSearch] = useState(searchQuery || '');

  const handleSearchChange = (value) => {
    setLocalSearch(value);
    onSearch(value);
  };

  const handleFilterSelect = (filterType) => {
    onFilter(filterType);
    setShowFilterDropdown(false);
  };

  const clearFilters = () => {
    setLocalSearch('');
    onSearch('');
    onFilter('all');
    setShowFilterDropdown(false);
  };

  return (
    <div className="poke-nav">
      {/* Barra de acciones principal */}
      <div className="action-bar">
        <button 
          className="nav-btn load-btn" 
          onClick={onLoad}
        >
          🔄 Cargar Pokémon
        </button>
        
        <div className="search-section">
          <input
            type="text"
            id="searchInput"
            className="search-input"
            placeholder="Buscar por nombre o ID"
            value={localSearch}
            onChange={(e) => handleSearchChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                onSearch(localSearch);
              }
            }}
          />
          <button 
            className="nav-btn search-btn"
            onClick={() => onSearch(localSearch)}
          >
            🔍 Buscar
          </button>
        </div>

        {/* Dropdown de filtros */}
        <div className="filter-section">
          <button 
            className={`nav-btn filter-btn ${showFilterDropdown ? 'active' : ''}`}
            onClick={() => setShowFilterDropdown(!showFilterDropdown)}
          >
            🎯 Filtrar por tipo
            <span 
              className="dropdown-arrow"
              style={{
                transform: showFilterDropdown ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s ease'
              }}
            >
              ▼
            </span>
          </button>

          {showFilterDropdown && (
            <div className="filter-dropdown">
              <div 
                className={`filter-option ${activeFilter === 'all' ? 'selected' : ''}`}
                onClick={() => handleFilterSelect('all')}
              >
                🌟 Todos los Pokémon
              </div>
              
              <div 
                className={`filter-option ${activeFilter === 'favorites' ? 'selected' : ''}`}
                onClick={() => handleFilterSelect('favorites')}
              >
                ❤️ Favoritos ({favorites?.length || 0})
              </div>
              
              <div className="filter-divider"></div>
              
              {pokemonTypes.map(type => (
                <div 
                  key={type}
                  className={`filter-option type-option ${activeFilter === type ? 'selected' : ''}`}
                  onClick={() => handleFilterSelect(type)}
                >
                  <span className={`type-badge type-${type}`}>
                    {type}
                  </span>
                  <span className="type-name">
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </span>
                </div>
              ))}
              
              <div className="filter-divider"></div>
              
              <div 
                className="filter-option clear-option"
                onClick={clearFilters}
              >
                🗑️ Limpiar filtros
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Indicadores de filtros activos */}
      {(activeFilter !== 'all' || localSearch) && (
        <div className="active-filters">
          {activeFilter !== 'all' && (
            <div className="filter-tag">
              {activeFilter === 'favorites' ? (
                <span>❤️ Favoritos ({favorites?.length || 0})</span>
              ) : (
                <span className={`type-badge type-${activeFilter}`}>
                  Tipo: {activeFilter}
                </span>
              )}
              <button 
                className="remove-filter"
                onClick={() => onFilter('all')}
              >
                ×
              </button>
            </div>
          )}
          
          {localSearch && (
            <div className="filter-tag">
              <span>🔍 "{localSearch}"</span>
              <button 
                className="remove-filter"
                onClick={() => {
                  setLocalSearch('');
                  onSearch('');
                }}
              >
                ×
              </button>
            </div>
          )}
          
          <button 
            className="clear-all-btn"
            onClick={clearFilters}
          >
            Limpiar todo
          </button>
        </div>
      )}
    </div>
  );
}
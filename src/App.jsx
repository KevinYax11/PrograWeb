import { useState, useEffect } from 'react';
import PokeNav from './PokeComponents/PokeNav';
import PokeGallery from './PokeComponents/PokeGallery';
import PokemonModal from './PokeComponents/PokemonModal';

export default function App() {
  const [pokemons, setPokemons] = useState([]);
  const [filteredPokemons, setFilteredPokemons] = useState([]);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedPokemon, setSelectedPokemon] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Estados para evoluciones automáticas
  const [pokemonWithEvolutions, setPokemonWithEvolutions] = useState([]);
  const [loadingEvolutions, setLoadingEvolutions] = useState(false);
  
  // Estados para filtros
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');

  // Lista de tipos para el filtro
  const pokemonTypes = [
    'normal', 'fire', 'water', 'electric', 'grass', 'ice',
    'fighting', 'poison', 'ground', 'flying', 'psychic',
    'bug', 'rock', 'ghost', 'dragon', 'dark', 'steel', 'fairy'
  ];

  // Sincronizar pokémons filtrados
  useEffect(() => {
    applyFilters();
  }, [searchQuery, pokemonWithEvolutions, activeFilter]);

  // Cargar pokémons iniciales
  useEffect(() => {
    loadPokemons();
  }, []);

  const applyFilters = () => {
    let filtered = [...pokemonWithEvolutions];

    // Filtrar por búsqueda
    if (searchQuery.trim() !== '') {
      filtered = filtered.filter(p => {
        const searchTerm = searchQuery.toLowerCase();
        // Buscar en el nombre del Pokémon base Y en toda la cadena evolutiva
        return p.basePokemon.name.toLowerCase().includes(searchTerm) ||
               p.basePokemon.id.toString().includes(searchQuery) ||
               p.evolutionChain.some(evo => 
                 evo.name.toLowerCase().includes(searchTerm) ||
                 evo.id.toString().includes(searchQuery)
               );
      });
    }

    // Filtrar por tipo
    if (activeFilter !== 'all' && activeFilter !== 'favorites') {
      filtered = filtered.filter(p => {
        // Verificar tipos en el Pokémon base Y en toda la cadena evolutiva
        return p.basePokemon.types.some(t => t.type.name === activeFilter) ||
               p.evolutionChain.some(evo => 
                 evo.types && evo.types.some(t => t.type.name === activeFilter)
               );
      });
    }

    // Filtrar por favoritos
    if (activeFilter === 'favorites') {
      filtered = filtered.filter(p => {
        // Verificar si algún Pokémon de la cadena evolutiva está en favoritos
        return favorites.includes(p.basePokemon.id) ||
               p.evolutionChain.some(evo => favorites.includes(evo.id));
      });
    }

    setFilteredPokemons(filtered);
  };

  const loadPokemons = async () => {
    if (loading) return;
    
    setLoading(true);
    setLoadingEvolutions(true);
    
    try {
      const res = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=20&offset=${offset}`);
      const data = await res.json();
      
      const detailed = await Promise.all(
        data.results.map(async (p) => {
          const res = await fetch(p.url);
          return await res.json();
        })
      );

      // Cargar evoluciones para cada Pokémon
      const pokemonsWithEvos = await Promise.all(
        detailed.map(async (pokemon, index) => {
          try {
            const speciesRes = await fetch(pokemon.species.url);
            const speciesData = await speciesRes.json();
            const evoRes = await fetch(speciesData.evolution_chain.url);
            const evoData = await evoRes.json();
            
            const evolutionChain = await extractEvolutionChain(evoData.chain);
            
            return {
              id: `pokemon-${pokemon.id}-${offset + index}`,
              basePokemon: pokemon,
              evolutionChain: evolutionChain,
              evolutionChainUrl: speciesData.evolution_chain.url // Para identificar familias
            };
          } catch (error) {
            console.error(`Error cargando evoluciones para ${pokemon.name}:`, error);
            return {
              id: `pokemon-${pokemon.id}-${offset + index}`,
              basePokemon: pokemon,
              evolutionChain: [pokemon],
              evolutionChainUrl: null
            };
          }
        })
      );

      // Filtrar duplicados de la misma familia evolutiva
      const uniquePokemonFamilies = [];
      const usedEvolutionChains = new Set();

      pokemonsWithEvos.forEach(pokemonData => {
        // Si no tiene cadena evolutiva o no la hemos visto antes
        if (!pokemonData.evolutionChainUrl || !usedEvolutionChains.has(pokemonData.evolutionChainUrl)) {
          // Marcar esta cadena evolutiva como usada
          if (pokemonData.evolutionChainUrl) {
            usedEvolutionChains.add(pokemonData.evolutionChainUrl);
          }
          
          // Usar el primer Pokémon de la cadena evolutiva como representante
          const firstEvolution = pokemonData.evolutionChain[0] || pokemonData.basePokemon;
          uniquePokemonFamilies.push({
            ...pokemonData,
            basePokemon: firstEvolution,
            originalPokemon: pokemonData.basePokemon // Mantener referencia al original
          });
        }
      });

      // Verificar si algún Pokémon de los nuevos ya existe en los actuales
      const filteredUnique = uniquePokemonFamilies.filter(newPokemon => {
        return !pokemonWithEvolutions.some(existingPokemon => 
          existingPokemon.evolutionChainUrl === newPokemon.evolutionChainUrl
        );
      });

      setPokemonWithEvolutions(prev => [...prev, ...filteredUnique]);
      setPokemons(prev => [...prev, ...detailed]);
      setOffset(prev => prev + 20);
    } catch (error) {
      console.error('Error cargando pokémons:', error);
    } finally {
      setLoading(false);
      setLoadingEvolutions(false);
    }
  };

  const extractEvolutionChain = async (chain) => {
    const evolutionChain = [];
    let current = chain;

    while (current) {
      try {
        const pokemonRes = await fetch(`https://pokeapi.co/api/v2/pokemon/${current.species.name}`);
        const pokemonData = await pokemonRes.json();
        
        evolutionChain.push({
          ...pokemonData,
          evolutionCondition: current.evolution_details[0] || null
        });

        current = current.evolves_to[0];
      } catch (error) {
        console.error(`Error obteniendo datos de ${current.species.name}:`, error);
        break;
      }
    }

    return evolutionChain;
  };

  const getEvolutionConditionText = (condition) => {
    if (!condition) return null;
    
    if (condition.min_level) {
      return `Nivel ${condition.min_level}`;
    }
    if (condition.item) {
      return condition.item.name.replace('-', ' ');
    }
    if (condition.trigger) {
      return condition.trigger.name.replace('-', ' ');
    }
    return 'Condición especial';
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const handleFilter = (filterType) => {
    setActiveFilter(filterType);
    setShowFilterDropdown(false);
  };

  const clearFilters = () => {
    setActiveFilter('all');
    setSearchQuery('');
    setShowFilterDropdown(false);
  };

  const handleStats = (poke) => {
    setSelectedPokemon(poke);
    setShowModal(true);
  };

  const handleDetails = (poke) => {
    setSelectedPokemon(poke);
    setShowModal(true);
  };

  const toggleFavorite = (pokemonId) => {
    setFavorites(prev => {
      if (prev.includes(pokemonId)) {
        return prev.filter(id => id !== pokemonId);
      } else {
        return [...prev, pokemonId];
      }
    });
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedPokemon(null);
  };

  return (
    <div className="container">
      <header className="header">
        <h1>Pokédex Profesional</h1>
        <p>Explora el mundo Pokémon con tecnología avanzada</p>
      </header>

      {/* Controles principales */}
      <div className="controls">
        {/* Botones de acción principales */}
        <div className="main-actions">
          <button className="main-btn load-btn" onClick={loadPokemons} disabled={loading}>
            <span className="icon">⚡</span>
            {loading ? 'Cargando...' : 'Cargar Pokémon'}
          </button>

          <button className="main-btn search-btn" onClick={() => document.querySelector('.search-input')?.focus()}>
            <span className="icon">🔍</span>
            Buscar
          </button>

          <div className="filter-group">
            <button 
              className={`main-btn filter-btn-main ${showFilterDropdown ? 'active' : ''}`}
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
            >
              <span className="icon">🎯</span>
              Filtrar por tipo
              <span className="icon" style={{transform: showFilterDropdown ? 'rotate(180deg)' : 'rotate(0deg)'}}>▼</span>
            </button>

            {/* Dropdown de filtros */}
            <div className={`filter-dropdown ${showFilterDropdown ? 'show' : ''}`}>
              <div 
                className={`filter-option ${activeFilter === 'all' ? 'selected' : ''}`}
                onClick={() => handleFilter('all')}
              >
                <span>🌟 Todos los Pokémon</span>
              </div>
              <div 
                className={`filter-option ${activeFilter === 'favorites' ? 'selected' : ''}`}
                onClick={() => handleFilter('favorites')}
              >
                <span>❤️ Favoritos ({favorites.length})</span>
              </div>
              <div style={{borderTop: '1px solid rgba(71, 85, 105, 0.3)', margin: '8px 0'}}></div>
              {pokemonTypes.map(type => (
                <div 
                  key={type}
                  className={`filter-option ${activeFilter === type ? 'selected' : ''}`}
                  onClick={() => handleFilter(type)}
                >
                  <span className={`type-badge type-${type}`} style={{padding: '3px 8px', fontSize: '0.7rem', marginRight: '8px'}}>
                    {type}
                  </span>
                  <span style={{textTransform: 'capitalize'}}>{type}</span>
                </div>
              ))}
              <div style={{borderTop: '1px solid rgba(71, 85, 105, 0.3)', margin: '8px 0'}}></div>
              <div className="filter-option" onClick={clearFilters} style={{color: '#f87171'}}>
                <span>🗑️ Limpiar filtros</span>
              </div>
            </div>
          </div>
        </div>

        {/* Búsqueda */}
        <div className="search-container">
          <div className="search-wrapper">
            <input
              type="text"
              className="search-input"
              placeholder="Buscar Pokémon por nombre o número..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
            />
            <span className="search-icon">🔍</span>
          </div>
        </div>

        {/* Botón limpiar filtros */}
        {(activeFilter !== 'all' || searchQuery) && (
          <div style={{textAlign: 'center'}}>
            <button className="clear-filters-btn" onClick={clearFilters}>
              🗑️ Limpiar todos los filtros
            </button>
          </div>
        )}
      </div>

      {/* Mensaje de no encontrados */}
      {filteredPokemons.length === 0 && pokemonWithEvolutions.length > 0 && searchQuery && (
        <div className="error">
          No se encontraron Pokémon que coincidan con "{searchQuery}"
        </div>
      )}

      {/* Loading inicial */}
      {loadingEvolutions && pokemonWithEvolutions.length === 0 && (
        <div className="loading">
          <p>Cargando Pokémon y sus evoluciones...</p>
        </div>
      )}

      {/* Sección de Pokémon con sus evoluciones */}
      <div className="evolutions-container">
        {filteredPokemons.map((evolutionGroup, index) => (
          <div key={evolutionGroup.id} className="pokemon-evolution-section">
            {/* Título individual del Pokémon */}
            <div className="pokemon-title">
              <img 
                className="pokemon-title-image" 
                src={evolutionGroup.basePokemon.sprites.other['official-artwork']?.front_default || evolutionGroup.basePokemon.sprites.front_default}
                alt={evolutionGroup.basePokemon.name}
              />
              <div className="pokemon-title-info">
                <h2 className="pokemon-title-name">
                  {evolutionGroup.basePokemon.name}
                </h2>
                <span className="pokemon-title-id">
                  #{evolutionGroup.basePokemon.id.toString().padStart(3, '0')}
                </span>
                <div className="pokemon-title-types">
                  {evolutionGroup.basePokemon.types.map(type => (
                    <span key={type.type.name} className={`type-badge type-${type.type.name}`}>
                      {type.type.name}
                    </span>
                  ))}
                </div>
                <div style={{marginTop: '10px', fontSize: '0.9rem', color: '#94a3b8'}}>
                  {evolutionGroup.evolutionChain.length > 1 
                    ? `${evolutionGroup.evolutionChain.length} evoluciones`
                    : 'Sin evoluciones'
                  }
                </div>
                {/* Botones de acción */}
                <div className="card-actions" style={{marginTop: '15px'}}>
                  <button 
                    className="details-btn"
                    onClick={() => handleDetails(evolutionGroup.basePokemon)}
                  >
                    📊 Detalles
                  </button>
                  <button 
                    className={`favorite-btn ${favorites.includes(evolutionGroup.basePokemon.id) ? 'favorited' : ''}`}
                    onClick={() => toggleFavorite(evolutionGroup.basePokemon.id)}
                  >
                    {favorites.includes(evolutionGroup.basePokemon.id) ? '❤️' : '🤍'} Favorito
                  </button>
                </div>
              </div>
            </div>

            {/* Cadena evolutiva individual */}
            <div className="individual-evolution-chain">
              {evolutionGroup.evolutionChain.length > 1 ? (
                evolutionGroup.evolutionChain.map((pokemon, evoIndex) => (
                  <div key={`${pokemon.id}-${evoIndex}`} className="evolution-stage-individual">
                    <div className="evolution-pokemon-individual">
                      <img
                        className="evolution-image-individual"
                        src={pokemon.sprites.other['official-artwork']?.front_default || pokemon.sprites.front_default}
                        alt={pokemon.name}
                        onError={(e) => {
                          e.target.src = pokemon.sprites.front_default;
                        }}
                      />
                      <div className="evolution-name-individual">{pokemon.name}</div>
                      <div className="evolution-id-individual">
                        #{pokemon.id.toString().padStart(3, '0')}
                      </div>
                      <div className="evolution-types-individual">
                        {pokemon.types.map(type => (
                          <span key={type.type.name} className={`type-badge type-${type.type.name}`}>
                            {type.type.name}
                          </span>
                        ))}
                      </div>
                      {pokemon.evolutionCondition && getEvolutionConditionText(pokemon.evolutionCondition) && (
                        <div className="evolution-condition-individual">
                          {getEvolutionConditionText(pokemon.evolutionCondition)}
                        </div>
                      )}
                    </div>
                    
                    {evoIndex < evolutionGroup.evolutionChain.length - 1 && (
                      <div className="evolution-arrow-individual">➜</div>
                    )}
                  </div>
                ))
              ) : (
                <div className="no-evolution-individual">
                  <div className="icon">🚫</div>
                  <p>Este Pokémon no tiene evoluciones</p>
                  <small style={{color: '#64748b', marginTop: '5px'}}>
                    {evolutionGroup.basePokemon.name} es una forma final o única
                  </small>
                </div>
              )}
            </div>

            {/* Separador entre Pokémon */}
            {index < filteredPokemons.length - 1 && (
              <div className="pokemon-divider" style={{margin: '30px 0'}}></div>
            )}
          </div>
        ))}
      </div>

      {/* Loading para más pokémon */}
      {loading && (
        <div className="loading">
          <p>Cargando más Pokémon...</p>
        </div>
      )}

      {/* Botón cargar más */}
      {!searchQuery && (
        <div className="load-more-container">
          <button 
            className="load-more" 
            onClick={loadPokemons}
            disabled={loading}
          >
            {loading ? 'Cargando...' : '🔄 Cargar más pokemones — ¡Descubre nuevas criaturas!'}
          </button>
        </div>
      )}

      {/* Modal */}
      <PokemonModal
        pokemon={selectedPokemon}
        isOpen={showModal}
        onClose={closeModal}
        isFavorite={selectedPokemon ? favorites.includes(selectedPokemon.id) : false}
        onToggleFavorite={toggleFavorite}
      />
    </div>
  );
}
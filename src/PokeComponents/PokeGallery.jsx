import { useState, useEffect } from 'react'
import axios from 'axios'

const PokeGallery = ({ pokemons }) => {
  const [allPokemons, setAllPokemons] = useState([])
  const [currentOffset, setCurrentOffset] = useState(6)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedPokemon, setSelectedPokemon] = useState(null)
  const [pokemonDetails, setPokemonDetails] = useState({})

  const displayPokemons = pokemons.length > 0 ? [...pokemons, ...allPokemons] : allPokemons

  // Cargar detalles adicionales (evoluciones, especies)
  const loadPokemonDetails = async (pokemon) => {
    if (pokemonDetails[pokemon.id]) {
      setSelectedPokemon({ ...pokemon, details: pokemonDetails[pokemon.id] })
      return
    }

    try {
      const speciesResponse = await axios.get(pokemon.species.url)
      const evolutionResponse = await axios.get(speciesResponse.data.evolution_chain.url)
      
      const details = {
        species: speciesResponse.data,
        evolution: evolutionResponse.data,
        description: speciesResponse.data.flavor_text_entries
          .find(entry => entry.language.name === 'en')?.flavor_text || 
          'No description available.'
      }

      setPokemonDetails(prev => ({ ...prev, [pokemon.id]: details }))
      setSelectedPokemon({ ...pokemon, details })
    } catch (error) {
      console.error('Error loading pokemon details:', error)
    }
  }

  const loadMorePokemon = async () => {
    if (isLoading) return
    
    setIsLoading(true)
    setError('')
    
    try {
      const response = await axios.get(
        `https://pokeapi.co/api/v2/pokemon?limit=6&offset=${currentOffset}`
      )
      
      const pokemonDetails = await Promise.all(
        response.data.results.map(pokemon => 
          axios.get(pokemon.url).then(res => res.data)
        )
      )
      
      setAllPokemons(prev => [...prev, ...pokemonDetails])
      setCurrentOffset(prev => prev + 6)
      
    } catch (error) {
      console.error('Error loading more Pokémon:', error)
      setError('Error al cargar más Pokémon. Por favor, intenta de nuevo.')
    } finally {
      setIsLoading(false)
    }
  }

  const getTypeClass = (typeName) => `type-${typeName}`

  const StatBar = ({ statName, value, maxValue = 150 }) => {
    const percentage = Math.min((value / maxValue) * 100, 100)
    return (
      <div className="stat-bar-container">
        <div className="stat-info">
          <span className="stat-name">{statName}</span>
          <span className="stat-value">{value}</span>
        </div>
        <div className="stat-bar">
          <div 
            className="stat-fill" 
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    )
  }

  const PokemonModal = ({ pokemon, onClose }) => {
    if (!pokemon) return null

    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={e => e.stopPropagation()}>
          <button className="modal-close" onClick={onClose}>×</button>
          
          <div className="modal-header">
            <div className="modal-image-container">
              <img 
                src={pokemon.sprites.other['official-artwork']?.front_default || pokemon.sprites.front_default}
                alt={pokemon.name}
                className="modal-image"
              />
              <div className="pokemon-id-large">#{pokemon.id.toString().padStart(3, '0')}</div>
            </div>
            <div className="modal-info">
              <h2 className="modal-title">{pokemon.name}</h2>
              <div className="modal-types">
                {pokemon.types.map((type, index) => (
                  <span key={index} className={`type-badge ${getTypeClass(type.type.name)}`}>
                    {type.type.name}
                  </span>
                ))}
              </div>
              {pokemon.details && (
                <p className="pokemon-description">
                  {pokemon.details.description.replace(/\f/g, ' ')}
                </p>
              )}
            </div>
          </div>

          <div className="modal-body">
            <div className="stats-section">
              <h3 className="section-title">📊 Estadísticas Base</h3>
              <div className="stats-grid">
                {pokemon.stats.map((stat, index) => (
                  <StatBar 
                    key={index}
                    statName={stat.stat.name.replace('-', ' ')}
                    value={stat.base_stat}
                  />
                ))}
              </div>
            </div>

            <div className="info-grid">
              <div className="info-section">
                <h3 className="section-title">📏 Información Física</h3>
                <div className="info-items">
                  <div className="info-item">
                    <span className="info-label">Altura:</span>
                    <span className="info-value">{(pokemon.height / 10).toFixed(1)}m</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Peso:</span>
                    <span className="info-value">{(pokemon.weight / 10).toFixed(1)}kg</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Experiencia Base:</span>
                    <span className="info-value">{pokemon.base_experience}</span>
                  </div>
                </div>
              </div>

              <div className="info-section">
                <h3 className="section-title">⚡ Habilidades</h3>
                <div className="abilities-grid">
                  {pokemon.abilities.map((ability, index) => (
                    <div key={index} className={`ability-badge ${ability.is_hidden ? 'hidden' : ''}`}>
                      <span className="ability-name">{ability.ability.name}</span>
                      {ability.is_hidden && <span className="hidden-tag">Oculta</span>}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="moves-section">
              <h3 className="section-title">🎯 Movimientos Principales</h3>
              <div className="moves-grid">
                {pokemon.moves.slice(0, 8).map((move, index) => (
                  <div key={index} className="move-item">
                    {move.move.name.replace('-', ' ')}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container">
      <header className="header">
        <h1 className="title">🔥 Pokémon Gallery Pro</h1>
        <p className="subtitle">Descubre el mundo Pokémon con información detallada y evoluciones</p>
        <div className="header-stats">
          <div className="header-stat">
            <span className="stat-number">{displayPokemons.length}</span>
            <span className="stat-label">Pokémon Cargados</span>
          </div>
        </div>
      </header>

      {error && (
        <div className="error">
          {error}
        </div>
      )}

      <div className="pokemon-grid">
        {displayPokemons.map((pokemon) => (
          <div key={pokemon.id} className="pokemon-card-pro">
            <div className="card-header">
              <div className="pokemon-id">#{pokemon.id.toString().padStart(3, '0')}</div>
              <div className="card-actions">
                <button 
                  className="action-btn favorite"
                  title="Agregar a favoritos"
                >
                  ❤️
                </button>
              </div>
            </div>

            <div className="pokemon-image-container">
              <img 
                className="pokemon-image" 
                src={
                  pokemon.sprites.other['official-artwork']?.front_default || 
                  pokemon.sprites.front_default || 
                  'https://via.placeholder.com/150?text=No+Image'
                }
                alt={pokemon.name}
                loading="lazy"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/150?text=No+Image'
                }}
              />
              <div className="image-overlay">
                <button 
                  className="view-details-btn"
                  onClick={() => loadPokemonDetails(pokemon)}
                >
                  👁️ Ver Detalles
                </button>
              </div>
            </div>
            
            <div className="card-content">
              <h3 className="pokemon-name">{pokemon.name}</h3>
              
              <div className="pokemon-types">
                {pokemon.types.map((type, index) => (
                  <span 
                    key={index} 
                    className={`type-badge ${getTypeClass(type.type.name)}`}
                  >
                    {type.type.name}
                  </span>
                ))}
              </div>
              
              <div className="quick-stats">
                <div className="quick-stat">
                  <span className="quick-stat-value">{(pokemon.height / 10).toFixed(1)}m</span>
                  <span className="quick-stat-label">Altura</span>
                </div>
                <div className="quick-stat">
                  <span className="quick-stat-value">{(pokemon.weight / 10).toFixed(1)}kg</span>
                  <span className="quick-stat-label">Peso</span>
                </div>
                <div className="quick-stat">
                  <span className="quick-stat-value">{pokemon.base_experience}</span>
                  <span className="quick-stat-label">EXP</span>
                </div>
              </div>

              <div className="card-actions-bottom">
                <button 
                  className="action-button primary"
                  onClick={() => loadPokemonDetails(pokemon)}
                >
                  📊 Estadísticas
                </button>
                <button 
                  className="action-button secondary"
                  onClick={() => loadPokemonDetails(pokemon)}
                >
                  🧬 Evoluciones
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {displayPokemons.length > 0 && (
        <button 
          className={`load-more-pro ${isLoading ? 'loading' : ''}`}
          onClick={loadMorePokemon}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <div className="spinner-small"></div>
              Cargando más Pokémon...
            </>
          ) : (
            <>
              <span>🔍 Cargar más Pokémon</span>
              <span className="load-more-subtitle">Descubre nuevas criaturas</span>
            </>
          )}
        </button>
      )}

      <PokemonModal 
        pokemon={selectedPokemon} 
        onClose={() => setSelectedPokemon(null)} 
      />
    </div>
  )
}

export default PokeGallery
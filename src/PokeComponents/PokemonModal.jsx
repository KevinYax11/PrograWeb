import React from 'react';

const PokemonModal = ({ pokemon, isOpen, onClose, isFavorite, onToggleFavorite }) => {
  if (!isOpen || !pokemon) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className={`modal ${isOpen ? 'show' : ''}`} onClick={handleOverlayClick}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="pokemon-name">{pokemon.name}</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        
        <div className="modal-body">
          <div className="modal-image-section">
            <img 
              className="modal-pokemon-image" 
              src={pokemon.sprites.other['official-artwork']?.front_default || pokemon.sprites.front_default}
              alt={pokemon.name}
            />
            <div className="pokemon-types">
              {pokemon.types.map((type, index) => (
                <span key={index} className={`type-badge type-${type.type.name}`}>
                  {type.type.name}
                </span>
              ))}
            </div>
            <div className="pokemon-id">#{pokemon.id.toString().padStart(3, '0')}</div>
            
            {/* Botón de favorito en el modal */}
            <button 
              className={`modal-favorite-btn ${isFavorite ? 'favorited' : ''}`}
              onClick={() => onToggleFavorite(pokemon.id)}
            >
              {isFavorite ? '💖 Quitar de Favoritos' : '❤️ Agregar a Favoritos'}
            </button>
          </div>
          
          <div className="modal-details">
            {/* Información básica */}
            <div className="basic-info">
              <div className="info-row">
                <span className="info-label">Altura:</span>
                <span className="info-value">{pokemon.height / 10} m</span>
              </div>
              <div className="info-row">
                <span className="info-label">Peso:</span>
                <span className="info-value">{pokemon.weight / 10} kg</span>
              </div>
              <div className="info-row">
                <span className="info-label">Experiencia Base:</span>
                <span className="info-value">{pokemon.base_experience}</span>
              </div>
            </div>

            {/* Habilidades */}
            <div className="abilities">
              <h4>Habilidades</h4>
              <div className="ability-list">
                {pokemon.abilities.map((ability, index) => (
                  <span key={index} className="ability-badge">
                    {ability.ability.name}
                    {ability.is_hidden && <span className="hidden-ability"> (Oculta)</span>}
                  </span>
                ))}
              </div>
            </div>

            {/* Estadísticas */}
            <div className="detailed-stats">
              <h4>Estadísticas Base</h4>
              {pokemon.stats.map((stat, index) => {
                const percentage = Math.min((stat.base_stat / 255) * 100, 100);
                return (
                  <div key={index} className="stat-row">
                    <div className="stat-info">
                      <span className="stat-name">{getStatName(stat.stat.name)}</span>
                      <span className="stat-value">{stat.base_stat}</span>
                    </div>
                    <div className="stat-bar">
                      <div 
                        className="stat-fill" 
                        style={{ 
                          width: `${percentage}%`,
                          backgroundColor: getStatColor(stat.stat.name)
                        }}
                      ></div>
                    </div>
                  </div>
                );
              })}
              
              {/* Total de estadísticas */}
              <div className="stat-total">
                <strong>Total: {pokemon.stats.reduce((sum, stat) => sum + stat.base_stat, 0)}</strong>
              </div>
            </div>

            {/* Movimientos destacados */}
            <div className="moves-section">
              <h4>Movimientos Destacados</h4>
              <div className="moves-grid">
                {pokemon.moves.slice(0, 8).map((move, index) => (
                  <span key={index} className="move-badge">
                    {move.move.name}
                  </span>
                ))}
              </div>
              {pokemon.moves.length > 8 && (
                <p className="moves-more">
                  +{pokemon.moves.length - 8} movimientos más
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Función auxiliar para nombres de estadísticas más legibles
const getStatName = (statName) => {
  const statNames = {
    'hp': 'HP',
    'attack': 'Ataque',
    'defense': 'Defensa',
    'special-attack': 'At. Especial',
    'special-defense': 'Def. Especial',
    'speed': 'Velocidad'
  };
  return statNames[statName] || statName;
};

// Función auxiliar para colores de estadísticas
const getStatColor = (statName) => {
  const statColors = {
    'hp': '#ff6b6b',
    'attack': '#ff8e53',
    'defense': '#4ecdc4',
    'special-attack': '#45b7d1',
    'special-defense': '#96ceb4',
    'speed': '#ffd93d'
  };
  return statColors[statName] || '#3b82f6';
};

export default PokemonModal;
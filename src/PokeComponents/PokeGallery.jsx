export default function PokeGallery({ pokemons, onStats, onDetails, onEvolutions }) {
  return (
    <div className="pokemon-grid">
      {pokemons.map((poke) => {
        const mainType = poke.types[0]?.type?.name;
        return (
          <div key={poke.id} className={`pokemon-card type-${mainType}`}>
            <div className="card-header">
              <h3 className="pokemon-name">{poke.name}</h3>
              <span className="pokemon-id">#{poke.id}</span>
            </div>
            <div className="pokemon-image-container">
              <img src={poke.sprites.front_default} alt={poke.name} className="pokemon-image" />
            </div>
            <div className="card-body">
              <div className="pokemon-types">
                {poke.types.map((t) => (
                  <span key={t.type.name} className="type-badge">{t.type.name}</span>
                ))}
              </div>
              <div className="card-actions">
                <button onClick={() => onStats(poke)}>📊 Estadísticas</button>
                <button onClick={() => onDetails(poke)}>🔍 Detalles</button>
                <button onClick={() => onEvolutions(poke)}>🧬 Evoluciones</button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

const PokeNav = () => {
  return (
    <nav className="poke-nav">
      <div className="nav-container">
        <div className="nav-brand">
          <span className="pokeball">⚪</span>
          <span className="brand-text">PokéDex</span>
        </div>
        
        <div className="nav-links">
          <a href="#home" className="nav-link active">
            🏠 Inicio
          </a>
          <a href="#favorites" className="nav-link">
            ❤️ Favoritos
          </a>
          <a href="#types" className="nav-link">
            🏷️ Tipos
          </a>
          <a href="#about" className="nav-link">
            ℹ️ Acerca de
          </a>
        </div>

        <div className="nav-stats">
          <div className="stat-badge">
            <span className="stat-number">1010</span>
            <span className="stat-label">Pokémon</span>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default PokeNav
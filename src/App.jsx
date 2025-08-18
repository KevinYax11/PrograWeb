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

  // Sincronizar pokémons filtrados cuando cambie la búsqueda o los pokémons
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredPokemons(pokemons);
    } else {
      const filtered = pokemons.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.id.toString().includes(searchQuery)
      );
      setFilteredPokemons(filtered);
    }
  }, [searchQuery, pokemons]);

  // Cargar pokémons iniciales
  useEffect(() => {
    loadPokemons();
  }, []);

  const loadPokemons = async () => {
    if (loading) return;
    
    setLoading(true);
    try {
      const res = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=20&offset=${offset}`);
      const data = await res.json();
      const detailed = await Promise.all(
        data.results.map(async (p) => {
          const res = await fetch(p.url);
          return await res.json();
        })
      );
      setPokemons((prev) => [...prev, ...detailed]);
      setOffset((prev) => prev + 20);
    } catch (error) {
      console.error('Error cargando pokémons:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const handleFilter = (filterType) => {
    if (filterType === 'favorites') {
      const favoritePokemon = pokemons.filter(p => favorites.includes(p.id));
      setFilteredPokemons(favoritePokemon);
    } else if (filterType === 'all') {
      setFilteredPokemons(pokemons);
    } else {
      // Filtrar por tipo
      const typeFiltered = pokemons.filter(p => 
        p.types.some(t => t.type.name === filterType)
      );
      setFilteredPokemons(typeFiltered);
    }
  };

  const handleStats = (poke) => {
    // Abrir modal en lugar de alert
    setSelectedPokemon(poke);
    setShowModal(true);
  };

  const handleDetails = (poke) => {
    // Abrir modal completo con detalles
    setSelectedPokemon(poke);
    setShowModal(true);
  };

  const handleEvolutions = async (poke) => {
    try {
      const res = await fetch(poke.species.url);
      const species = await res.json();
      const evoRes = await fetch(species.evolution_chain.url);
      const evoData = await evoRes.json();
      
      // Extraer cadena evolutiva completa
      const evolutionChain = [];
      let current = evoData.chain;
      
      while (current) {
        evolutionChain.push(current.species.name);
        current = current.evolves_to[0];
      }
      
      alert(`Cadena evolutiva: ${evolutionChain.join(' → ')}`);
    } catch (error) {
      alert('Error al cargar evoluciones');
      console.error('Error:', error);
    }
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

      <PokeNav 
        onSearch={handleSearch} 
        onLoad={loadPokemons} 
        onFilter={handleFilter}
        searchQuery={searchQuery}
        loading={loading}
      />

      {filteredPokemons.length === 0 && pokemons.length > 0 && searchQuery && (
        <div className="error">
          No se encontraron Pokémon que coincidan con "{searchQuery}"
        </div>
      )}

      <PokeGallery
        pokemons={filteredPokemons}
        favorites={favorites}
        onStats={handleStats}
        onDetails={handleDetails}
        onEvolutions={handleEvolutions}
        onToggleFavorite={toggleFavorite}
      />

      {loading && (
        <div className="loading">
          <p>Cargando más Pokémon...</p>
        </div>
      )}

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
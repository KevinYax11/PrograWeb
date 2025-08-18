import { useState, useEffect } from 'react'
import axios from "axios"
import PokeGallery from './PokeComponents/PokeGallery'
import PokeNav from './PokeComponents/PokeNav'

function App() {
  const [pokemons, setPokemons] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  
  useEffect(() => {
    const fetchInitialPokemons = async () => {
      try {
        setIsLoading(true)
        setError('')
        
        // Obtener lista inicial de Pokémon
        const response = await axios.get("https://pokeapi.co/api/v2/pokemon?limit=6")
        
        // Obtener detalles de cada Pokémon
        const pokemonDetails = await Promise.all(
          response.data.results.map(async (pokemon) => {
            try {
              const detailResponse = await axios.get(pokemon.url)
              return detailResponse.data
            } catch (error) {
              console.error(`Error fetching details for ${pokemon.name}:`, error)
              return null
            }
          })
        )
        
        // Filtrar pokémon nulos y establecer estado
        const validPokemons = pokemonDetails.filter(pokemon => pokemon !== null)
        setPokemons(validPokemons)
        
      } catch (error) {
        console.error("Error cargando Pokémon inicial:", error)
        setError('Error al cargar los datos iniciales. Por favor, recarga la página.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchInitialPokemons()
  }, [])

  if (isLoading) {
    return (
      <div className="container">
        <div className="loading-screen">
          <div className="loading-spinner"></div>
          <h2 className="loading-text">Cargando Pokémon...</h2>
          <p className="loading-subtitle">Conectando con la PokéAPI</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container">
        <div className="error-screen">
          <h2 className="error-title">❌ Error</h2>
          <p className="error-message">{error}</p>
          <button 
            className="retry-button"
            onClick={() => window.location.reload()}
          >
            🔄 Reintentar
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      <PokeNav />
      <PokeGallery pokemons={pokemons} />
    </>
  )
}

export default App
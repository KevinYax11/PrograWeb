export default function PokeNav({ onSearch, onLoad, onFilter }) {
  return (
    <div className="action-bar">
      <button onClick={onLoad}>🔄 Cargar Pokémon</button>
      <input
        type="text"
        id="searchInput"
        placeholder="Buscar por nombre o ID"
        onChange={(e) => onSearch(e.target.value)}
      />
      <button onClick={() => onSearch(document.getElementById('searchInput').value)}>🔍 Buscar</button>
      <button onClick={onFilter}>🎯 Filtrar por tipo</button>
    </div>
  );
}

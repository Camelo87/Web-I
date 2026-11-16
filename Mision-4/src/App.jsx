import FormularioReceta from "./components/FormularioReceta.jsx";
import ListaRecetas from "./components/ListaRecetas.jsx";

export default function App() {
  return (
    <main>
      <h1>🍳 La Despensa</h1>
      <p className="sub">Publica tus recetas y descubre las de la comunidad.</p>
      <FormularioReceta />
      <ListaRecetas />
    </main>
  );
}

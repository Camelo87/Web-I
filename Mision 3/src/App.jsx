import { useMemo, useState } from "react";
import { useRecetas } from "./hooks/useRecetas.js";
import { filtrarRecetas, contarPorCategoria } from "./logica.js";
import Buscador from "./components/Buscador.jsx";
import Categorias from "./components/Categorias.jsx";
import ListaRecetas from "./components/ListaRecetas.jsx";
import Mensaje from "./components/Mensaje.jsx";

export default function App() {
  const { estado, recetas, fallidas, error, reintentar } = useRecetas();

  // Estado mínimo: solo lo que elige el usuario.
  const [texto, setTexto] = useState("");
  const [categoria, setCategoria] = useState(""); // "" = todas
  const [soloRapidas, setSoloRapidas] = useState(false);
  const [compra, setCompra] = useState([]); // ids de las recetas elegidas

  // Derivado: se calcula en cada render a partir del estado, no se guarda.
  const visibles = filtrarRecetas(recetas, { texto, categoria, soloRapidas });
  // useMemo: solo cambian cuando llegan recetas nuevas, no en cada tecla.
  const cuenta = useMemo(() => contarPorCategoria(recetas), [recetas]);
  const nombres = useMemo(() => [...new Set(recetas.map((r) => r.nombre))], [recetas]);

  function alternarCompra(id) {
    setCompra((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]));
  }

  function volverAlInicio() {
    setTexto("");
    setCategoria("");
    setSoloRapidas(false);
  }

  return (
    <main>
      <h1>🍳 La Despensa</h1>
      <p className="sub">Todas las recetas, filtradas mientras escribes. Descubre cuántos ingredientes necesitas de verdad.</p>

      <Buscador
        texto={texto}
        onTexto={setTexto}
        nombres={nombres}
        soloRapidas={soloRapidas}
        onSoloRapidas={setSoloRapidas}
        onInicio={volverAlInicio}
      />

      {estado !== "listo" ? (
        <Mensaje estado={estado} error={error} onReintentar={reintentar} />
      ) : (
        <div className="cuerpo">
          <Categorias cuenta={cuenta} total={recetas.length} activa={categoria} onElegir={setCategoria} />
          <section>
            <p className="resumen" aria-live="polite">
              {visibles.length} de {recetas.length} recetas
              {fallidas > 0 && ` · faltan las de ${fallidas} letras por un fallo de red`}
            </p>
            <ListaRecetas recetas={visibles} texto={texto} idsCompra={compra} onAlternar={alternarCompra} />
          </section>
        </div>
      )}
    </main>
  );
}

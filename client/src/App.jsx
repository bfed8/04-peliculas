import { useState, useCallback, useRef } from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header.jsx';
import BottomNav from './components/BottomNav.jsx';
import Toast from './components/Toast.jsx';
import { UserDataProvider } from './context/UserDataContext.jsx';
import Home from './pages/Home.jsx';
import Buscar from './pages/Buscar.jsx';
import Detalle from './pages/Detalle.jsx';
import Favoritos from './pages/Favoritos.jsx';
import Historico from './pages/Historico.jsx';
import MeGusta from './pages/MeGusta.jsx';
import MisResenas from './pages/MisResenas.jsx';
import ProximosEstrenos from './pages/ProximosEstrenos.jsx';
import SeriesHome from './pages/SeriesHome.jsx';
import DetalleSerie from './pages/DetalleSerie.jsx';
import FavoritosSeries from './pages/FavoritosSeries.jsx';
import HistoricoSeries from './pages/HistoricoSeries.jsx';
import MeGustaSeries from './pages/MeGustaSeries.jsx';
import MisResenasSeries from './pages/MisResenasSeries.jsx';
import ProximosEstrenosSeries from './pages/ProximosEstrenosSeries.jsx';
import Perfil from './pages/Perfil.jsx';

// Aplicacion: layout (header + nav) + rutas. Gestiona los toasts globales.
export default function App() {
  const [toast, setToast] = useState(null);
  const temporizador = useRef(null);

  const mostrarToast = useCallback((mensaje) => {
    setToast(mensaje);
    clearTimeout(temporizador.current);
    temporizador.current = setTimeout(() => setToast(null), 2800);
  }, []);

  return (
    <UserDataProvider mostrarToast={mostrarToast}>
      <div className="app">
        <Header />
        <main className="contenedor">
          <Routes>
            <Route path="/" element={<Home mostrarToast={mostrarToast} />} />
            <Route path="/buscar" element={<Buscar mostrarToast={mostrarToast} />} />
            <Route path="/pelicula/:id" element={<Detalle mostrarToast={mostrarToast} />} />
            <Route path="/favoritos" element={<Favoritos />} />
            <Route path="/me-gusta" element={<MeGusta />} />
            <Route path="/historico" element={<Historico />} />
            <Route path="/mis-resenas" element={<MisResenas />} />
            <Route path="/proximos" element={<ProximosEstrenos mostrarToast={mostrarToast} />} />
            <Route path="/series" element={<SeriesHome mostrarToast={mostrarToast} />} />
            <Route path="/serie/:id" element={<DetalleSerie mostrarToast={mostrarToast} />} />
            <Route path="/favoritos-series" element={<FavoritosSeries />} />
            <Route path="/me-gusta-series" element={<MeGustaSeries />} />
            <Route path="/historico-series" element={<HistoricoSeries />} />
            <Route path="/mis-resenas-series" element={<MisResenasSeries />} />
            <Route path="/proximos-series" element={<ProximosEstrenosSeries mostrarToast={mostrarToast} />} />
            <Route path="/perfil" element={<Perfil />} />
          </Routes>
        </main>
        <BottomNav />
        <Toast mensaje={toast} />
      </div>
    </UserDataProvider>
  );
}

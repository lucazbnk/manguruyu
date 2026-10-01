import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Admin from './Admin';
import Tienda from './Tienda';
import Login from './Login';

// Componente guardián para proteger la ruta
function RutaProtegida({ children }) {
  const estaAutenticado = localStorage.getItem("admin_autenticado") === "true";
  
  if (!estaAutenticado) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Vista pública */}
        <Route path="/" element={<Tienda />} />
        
        {/* Login */}
        <Route path="/login" element={<Login />} />
        
        {/* Ruta protegida para el Admin */}
        <Route 
          path="/admin" 
          element={
            <RutaProtegida>
              <Admin />
            </RutaProtegida>
          } 
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
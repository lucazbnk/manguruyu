import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    const claveCorrecta = import.meta.env.VITE_ADMIN_PASSWORD;

    if (password === claveCorrecta) {
      // Guardamos en el navegador que el admin ya inició sesión
      localStorage.setItem("admin_autenticado", "true");
      navigate("/admin"); // Nos manda al panel
    } else {
      setError(true);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md border border-gray-200">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Acceso Administrador 🔒</h2>
        
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1">Contraseña:</label>
            <input 
              type="password" 
              placeholder="Ingresá la contraseña maestra" 
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(false); }}
              className="border border-gray-300 p-3 rounded-lg w-full focus:outline-none focus:border-blue-500"
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm font-semibold text-center">Contraseña incorrecta. Intentá de nuevo.</p>
          )}

          <button 
            type="submit" 
            className="bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition cursor-pointer"
          >
            Ingresar al Panel
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
import { useState, useEffect } from 'react';
import { supabase } from './supabase';
import { Search, ShoppingCart, MessageCircle, ChevronDown, Filter, Plus, Minus, Trash2, X, PackageOpen, CameraOff, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const InstagramIcon = ({ className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

function Tienda() {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [subcategorias, setSubcategorias] = useState([]);
  const [colecciones, setColecciones] = useState([]);
  
  const [categoriaActiva, setCategoriaActiva] = useState("");
  const [subcategoriaActiva, setSubcategoriaActiva] = useState("");
  const [busqueda, setBusqueda] = useState(""); 

  const [menuCategoriasAbierto, setMenuCategoriasAbierto] = useState(false);

  const [carrito, setCarrito] = useState([]);
  const [mostrarCarrito, setMostrarCarrito] = useState(false);
  const [toast, setToast] = useState("");

  const [cargando, setCargando] = useState(true);
  const [productoModal, setProductoModal] = useState(null);
  
  const [indiceFotoActual, setIndiceFotoActual] = useState(0);

  // NUEVO: Lógica para el carrusel de imágenes desde la tarjeta principal
  const [indicesCarrusel, setIndicesCarrusel] = useState({});
  
  const avanzarFotoCarrusel = (e, id, max) => {
    e.stopPropagation(); // Evita que se abra el modal al tocar la flecha
    setIndicesCarrusel(prev => ({ ...prev, [id]: prev[id] !== undefined ? (prev[id] === max - 1 ? 0 : prev[id] + 1) : 1 }));
  };
  
  const retrocederFotoCarrusel = (e, id, max) => {
    e.stopPropagation();
    setIndicesCarrusel(prev => ({ ...prev, [id]: prev[id] !== undefined ? (prev[id] === 0 ? max - 1 : prev[id] - 1) : max - 1 }));
  };

  const [destacados, setDestacados] = useState([]);

  // NUEVO: Lógica para Productos Destacados (Al azar o Elegidos)
  useEffect(() => {
    if (productos.length > 0) {
      // Si a futuro creas una columna 'destacado' en Supabase, usa esos.
      // Si no existe, mezcla el catálogo y elige 6 al azar.
      const elegidos = productos.filter(p => p.destacado);
      if (elegidos.length > 0) {
        setDestacados(elegidos);
      } else {
        const mezclados = [...productos].sort(() => 0.5 - Math.random());
        setDestacados(mezclados.slice(0, 6));
      }
    }
  }, [productos]);

  // NUEVO: Movimiento automático del carrusel de destacados
  useEffect(() => {
    if (destacados.length === 0) return;
    const timer = setInterval(() => {
      const carrusel = document.getElementById('carrusel-destacados');
      if (carrusel) {
        const anchoTarjeta = carrusel.firstChild ? carrusel.firstChild.offsetWidth + 16 : 300;
        // Si llegó al final, vuelve al principio, sino avanza
        if (carrusel.scrollLeft + carrusel.clientWidth >= carrusel.scrollWidth - 10) {
          carrusel.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          carrusel.scrollBy({ left: anchoTarjeta, behavior: 'smooth' });
        }
      }
    }, 3500); // Cambia de producto cada 3 segundos y medio
    return () => clearInterval(timer);
  }, [destacados]);
  
  const numeroWhatsApp = "5493435300833"; 

  useEffect(() => {
    const cargarTodo = async () => {
      setCargando(true);
      await obtenerCategorias();
      await obtenerSubcategorias();
      await obtenerProductos();
      await obtenerColecciones();
      setTimeout(() => setCargando(false), 600); 
    };
    cargarTodo();
  }, []);

  const obtenerCategorias = async () => {
    const { data } = await supabase.from('categorias').select('*').order('id');
    if (data) setCategorias(data);
  };

  const obtenerSubcategorias = async () => {
    const { data } = await supabase.from('subcategorias').select('*').order('id');
    if (data) setSubcategorias(data);
  };

  const obtenerProductos = async () => {
    const { data } = await supabase.from('productos').select('*').order('id');
    if (data) setProductos(data);
  };

  const obtenerColecciones = async () => {
    const { data } = await supabase.from('colecciones').select('*').order('id', { ascending: true });
    if (data) setColecciones(data);
  };

  const mostrarToast = (mensaje) => {
    setToast(mensaje);
    setTimeout(() => {
      setToast("");
    }, 3000);
  };

  const agregarAlCarrito = (prod) => {
    const itemExistente = carrito.find(item => item.id === prod.id);
    if (itemExistente) {
      // EXCEPCIÓN: Si es por encargue o si todavía no llegaste al límite de stock físico
      if (prod.por_encargue || itemExistente.cantidad < prod.stock) {
        setCarrito(carrito.map(item => item.id === prod.id ? { ...item, cantidad: item.cantidad + 1 } : item));
      } else {
        mostrarToast("¡Stock máximo alcanzado para este producto!");
      }
    } else {
      setCarrito([...carrito, { ...prod, cantidad: 1 }]);
    }
    setMostrarCarrito(true);
  };

  const cambiarCantidad = (id, operacion) => {
    setCarrito(carrito.map(item => {
      if (item.id === id) {
        // EXCEPCIÓN: Si es sumar y (es por encargue O hay stock)
        if (operacion === 'sumar' && (item.por_encargue || item.cantidad < item.stock)) {
          return { ...item, cantidad: item.cantidad + 1 };
        } else if (operacion === 'sumar' && (!item.por_encargue && item.cantidad >= item.stock)) {
          mostrarToast("¡Stock máximo alcanzado para este producto!");
          return item;
        } else if (operacion === 'restar' && item.cantidad > 1) {
          return { ...item, cantidad: item.cantidad - 1 };
        }
      }
      return item;
    }));
  };

  const quitarDelCarrito = (id) => {
    setCarrito(carrito.filter(item => item.id !== id));
  };

  const calcularTotal = () => {
    return carrito.reduce((total, item) => total + (item.precio * item.cantidad), 0);
  };

  const cantidadItems = carrito.reduce((total, item) => total + item.cantidad, 0);

  const pedirCarritoPorWhatsApp = () => {
    if (carrito.length === 0) return;
    let texto = "¡Hola El Manguruyu! Quiero hacer el siguiente pedido:%0A%0A";
    carrito.forEach(item => {
      texto += `▪ ${item.cantidad}x *${item.nombre}* ($${(item.precio * item.cantidad).toLocaleString('es-AR')})%0A`;
    });
    texto += `%0A*TOTAL DEL PEDIDO: $${calcularTotal().toLocaleString('es-AR')}*%0A%0A¿Tienen stock disponible para confirmar la compra?`;
    window.open(`https://wa.me/${numeroWhatsApp}?text=${texto}`, '_blank');
  };

  const obtenerIdCategoria = (subcatId) => {
    const sub = subcategorias.find(s => String(s.id) === String(subcatId));
    return sub ? sub.categoria_id : null;
  };

  const obtenerNombreSubcategoria = (subcatId) => {
    const sub = subcategorias.find(s => String(s.id) === String(subcatId));
    return sub ? sub.nombre : 'General';
  };

  const obtenerNombreCategoriaActiva = () => {
    const cat = categorias.find(c => String(c.id) === String(categoriaActiva));
    return cat ? cat.nombre : "";
  };

  const obtenerListaImagenes = (imagen_url) => {
    if (!imagen_url) return [];
    if (Array.isArray(imagen_url)) return imagen_url; 
    if (typeof imagen_url === 'string') {
        try {
            const parseado = JSON.parse(imagen_url);
            if (Array.isArray(parseado)) return parseado;
        } catch (e) {
            return [imagen_url];
        }
    }
    return [imagen_url]; 
  };

  const abrirModalProducto = (prod) => {
    setProductoModal(prod);
    setIndiceFotoActual(0); 
  };

  const avanzarFoto = (imagenes) => {
    setIndiceFotoActual((prev) => (prev === imagenes.length - 1 ? 0 : prev + 1));
  };

  const retrocederFoto = (imagenes) => {
    setIndiceFotoActual((prev) => (prev === 0 ? imagenes.length - 1 : prev - 1));
  };

  const irAColeccion = (categoriaId) => {
    if (categoriaId) {
      setCategoriaActiva(categoriaId);
      setSubcategoriaActiva("");
      setBusqueda("");
      setTimeout(() => {
        document.getElementById("seccion-productos")?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  };

  const productosFiltrados = productos.filter(p => {
    // 1. Juntamos la subcategoría principal y TODAS las extras en una sola bolsita
    const todasSusSubcats = [p.subcategoria_id, ...(p.subcategorias_extra || [])];
    
    // 2. Revisamos a qué categorías padre pertenecen (ej: si pertenece a Reeles, sacamos que su padre es Pesca)
    const todasSusCatsPadre = todasSusSubcats.map(subId => obtenerIdCategoria(subId));

    // 3. El producto pasa el filtro si coincide con la principal O con alguna de las extras
    const pasaCategoria = categoriaActiva === "" || todasSusCatsPadre.some(catId => String(catId) === String(categoriaActiva));
    const pasaSubcategoria = subcategoriaActiva === "" || todasSusSubcats.some(subId => String(subId) === String(subcategoriaActiva));
    
    const textoBusqueda = busqueda.toLowerCase();
    const nombreValidado = p.nombre ? String(p.nombre).toLowerCase() : "";
    const descValidada = p.descripcion ? String(p.descripcion).toLowerCase() : "";
    
    const pasaBusqueda = nombreValidado.includes(textoBusqueda) || descValidada.includes(textoBusqueda);
    return pasaCategoria && pasaSubcategoria && pasaBusqueda;
  });

  return (
    <div className="min-h-screen bg-[#F8FAFC] relative flex flex-col justify-between font-sans text-gray-800 overflow-x-hidden">
      
      <div>
        <header className="bg-blue-900 text-white shadow-lg sticky top-0 z-30 transition-all duration-300">
          <div className="max-w-7xl mx-auto p-4 flex flex-wrap md:flex-nowrap justify-between items-center gap-4">
            
            <div className="flex items-center gap-3 order-1 cursor-pointer group" onClick={() => {setCategoriaActiva(""); setSubcategoriaActiva(""); setBusqueda("");}}>
              <img src="/logo.png" alt="Logo Manguruyu" className="w-10 h-10 md:w-12 md:h-12 object-contain bg-white rounded-full p-1 shadow-sm group-hover:scale-105 transition-transform duration-300" />
              <h1 className="text-xl md:text-2xl font-black tracking-wider uppercase hidden sm:block">El Manguruyu</h1>
            </div>

            <div className="w-full md:w-auto md:flex-1 order-3 md:order-2 relative group">
              <input 
                type="text" 
                placeholder="Buscar productos (ej: Reel, Shimano...)"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full border border-transparent p-3 pl-12 rounded-full shadow-inner focus:outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-400/20 transition-all duration-300 bg-white text-gray-700"
              />
              <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-300" />
            </div>

            <div className="order-2 md:order-3">
              <button 
                onClick={() => setMostrarCarrito(true)} 
                className="relative bg-white/10 backdrop-blur-md px-5 py-2.5 rounded-full hover:bg-white/20 transition-all duration-300 flex items-center gap-2 font-semibold cursor-pointer border border-white/20 hover:shadow-lg hover:-translate-y-0.5"
              >
                <ShoppingCart className="w-5 h-5" />
                <span className="hidden sm:inline">Carrito</span>
                {cantidadItems > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full shadow-md border-2 border-blue-900 animate-pulse">
                    {cantidadItems}
                  </span>
                )}
              </button>
            </div>
            
          </div>
        </header>

        <main className="max-w-7xl mx-auto p-4 sm:p-6 mt-4">
          
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="relative bg-gradient-to-br from-blue-900 to-blue-700 rounded-[2rem] overflow-hidden shadow-2xl mb-10 border border-blue-800/50"
          >
            <div className="absolute inset-0 bg-blue-950/20"></div>
            <div className="relative px-6 py-12 sm:py-20 text-center flex flex-col items-center">
              <span className="bg-blue-800 text-blue-100 text-xs sm:text-sm font-bold px-4 py-1.5 rounded-full mb-6 tracking-widest uppercase shadow-sm">
                El Manguruyu
              </span>
              <h2 className="text-3xl sm:text-5xl font-black text-white mb-6 tracking-tight leading-tight">
                Lo que necesitás, <br className="hidden sm:block" /> lo encontras acá
              </h2>
              <p className="text-blue-100/90 text-sm sm:text-lg max-w-2xl font-medium leading-relaxed">
                Explorá nuestro catálogo y pedí directamente por WhatsApp.
              </p>
            </div>
          </motion.div>

          {/* ======================================================== */}
          {/* 1. SECCIÓN COLECCIONES (Banners) - AHORA VAN ARRIBA */}
          {/* ======================================================== */}
          {colecciones.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-16">
              {colecciones.map((col, index) => (
                <motion.div 
                  key={col.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  onClick={() => irAColeccion(col.categoria_id)} 
                  className="relative h-[250px] sm:h-[400px] group cursor-pointer overflow-hidden rounded-3xl shadow-md border border-gray-100"
                >
                  <img 
                    src={col.imagen_url} 
                    alt={col.titulo} 
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-80 group-hover:opacity-90 transition-opacity"></div>
                  
                  <div className="absolute bottom-6 left-6 right-6">
                    <h3 className="text-white text-3xl sm:text-4xl font-black italic tracking-wide mb-3 drop-shadow-md">
                      {col.titulo}
                    </h3>
                    <button className="bg-white text-gray-900 px-5 py-2 text-xs sm:text-sm font-bold uppercase tracking-wider rounded-md transition-colors group-hover:bg-blue-600 group-hover:text-white shadow-sm">
                      Ver colección
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* ======================================================== */}
          {/* 2. SECCIÓN DESTACADOS (Sin estrella y debajo de banners) */}
          {/* ======================================================== */}
          {destacados.length > 0 && (
            <div className="mb-12 sm:mb-16">
              <div className="flex items-center mb-6 px-2">
                <h3 className="text-xl sm:text-2xl font-black text-gray-800 tracking-tight">Destacados</h3>
              </div>
              
              <div 
                id="carrusel-destacados"
                className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-6 pt-2 px-2"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                <style>{`#carrusel-destacados::-webkit-scrollbar { display: none; }`}</style>
                
                {destacados.map((prod) => {
                  const listaFotos = obtenerListaImagenes(prod.imagen_url);
                  return (
                    <div 
                      key={`dest-${prod.id}`}
                      className="min-w-[260px] max-w-[260px] sm:min-w-[300px] sm:max-w-[300px] snap-center shrink-0 bg-white rounded-2xl sm:rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col border border-gray-100 group cursor-pointer"
                      onClick={() => abrirModalProducto(prod)}
                    >
                      <div className="h-40 sm:h-48 bg-gray-50 relative p-4 flex items-center justify-center overflow-hidden">
                        {listaFotos.length > 0 ? (
                          <img src={listaFotos[0]} alt={prod.nombre} className="max-w-full max-h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-700 ease-out" />
                        ) : (
                          <CameraOff className="w-8 h-8 opacity-20" />
                        )}
                        
                        <div className="absolute top-3 left-3 bg-blue-600 text-white text-[10px] sm:text-xs font-bold px-3 py-1 rounded-full shadow-sm z-10 tracking-widest uppercase">
                          Destacado
                        </div>
                        {prod.stock <= 0 && !prod.por_encargue && <span className="absolute top-3 right-3 bg-red-500/90 backdrop-blur-sm text-white text-[10px] sm:text-xs font-bold px-3 py-1 rounded-full shadow-sm z-10">Sin Stock</span>}
                      </div>

                      <div className="p-4 flex-grow flex flex-col border-t border-gray-50">
                        <span className="text-[10px] text-blue-500 font-bold uppercase tracking-widest mb-1 line-clamp-1">{obtenerNombreSubcategoria(prod.subcategoria_id)}</span>
                        <h3 className="font-bold text-gray-800 text-[14px] sm:text-[16px] leading-tight mb-2 group-hover:text-blue-600 transition-colors line-clamp-2" title={prod.nombre}>
                          {prod.nombre}
                        </h3>
                        
                        <div className="flex justify-between items-end mt-auto pt-3">
                          <span className="text-lg sm:text-xl font-black text-emerald-600">${prod.precio.toLocaleString('es-AR')}</span>
                          <button 
                            onClick={(e) => { e.stopPropagation(); agregarAlCarrito(prod); }}
                            disabled={prod.stock <= 0 && !prod.por_encargue}
                            className={`p-2.5 rounded-xl sm:rounded-2xl font-bold transition-all flex items-center justify-center ${prod.stock > 0 || prod.por_encargue ? 'bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                          >
                            <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div id="seccion-productos" className="relative flex justify-center mb-6 z-20 pt-4">
            <button 
              onClick={() => setMenuCategoriasAbierto(!menuCategoriasAbierto)}
              className="flex items-center gap-3 px-6 sm:px-8 py-2.5 sm:py-3 bg-white border border-gray-200 rounded-full shadow-sm hover:shadow-md hover:border-blue-300 text-gray-700 font-semibold transition-all duration-300 text-sm sm:text-base cursor-pointer group"
            >
              <Filter className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 group-hover:scale-110 transition-transform" />
              <span>{categoriaActiva === "" ? "Todas las Categorías" : obtenerNombreCategoriaActiva()}</span>
              <ChevronDown className={`w-4 h-4 sm:w-5 sm:h-5 text-gray-400 transition-transform duration-300 ${menuCategoriasAbierto ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {menuCategoriasAbierto && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setMenuCategoriasAbierto(false)}></div>
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full mt-3 w-64 bg-white border border-gray-100 rounded-2xl shadow-xl z-20 overflow-hidden divide-y divide-gray-50"
                  >
                    <button 
                      onClick={() => { setCategoriaActiva(""); setSubcategoriaActiva(""); setMenuCategoriasAbierto(false); }} 
                      className={`w-full text-left px-5 py-3.5 text-sm sm:text-base transition-colors cursor-pointer ${categoriaActiva === "" ? "font-bold text-blue-600 bg-blue-50/50" : "text-gray-600 hover:bg-gray-50 hover:text-blue-500"}`}
                    >
                      Todas las Categorías
                    </button>
                    {categorias.map(cat => (
                      <button 
                        key={cat.id} 
                        onClick={() => { setCategoriaActiva(cat.id); setSubcategoriaActiva(""); setMenuCategoriasAbierto(false); }} 
                        className={`w-full text-left px-5 py-3.5 text-sm sm:text-base transition-colors cursor-pointer ${String(categoriaActiva) === String(cat.id) ? "font-bold text-blue-600 bg-blue-50/50" : "text-gray-600 hover:bg-gray-50 hover:text-blue-500"}`}
                      >
                        {cat.nombre}
                      </button>
                    ))}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {categoriaActiva !== "" && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} 
              className="flex flex-wrap gap-2 mb-10 justify-center relative z-10"
            >
              <button 
                onClick={() => setSubcategoriaActiva("")} 
                className={`px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all duration-300 cursor-pointer ${subcategoriaActiva === "" ? 'bg-blue-100 text-blue-800 shadow-sm border border-blue-200 sm:scale-105' : 'bg-transparent text-gray-500 hover:bg-gray-100 border border-transparent'}`}
              >
                Todo en {obtenerNombreCategoriaActiva()}
              </button>
              
              {subcategorias.filter(sub => String(sub.categoria_id) === String(categoriaActiva)).map(sub => (
                <button 
                  key={sub.id} 
                  onClick={() => setSubcategoriaActiva(sub.id)} 
                  className={`px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all duration-300 cursor-pointer ${String(subcategoriaActiva) === String(sub.id) ? 'bg-blue-100 text-blue-800 shadow-sm border border-blue-200 sm:scale-105' : 'bg-transparent text-gray-500 hover:bg-gray-100 border border-transparent'}`}
                >
                  {sub.nombre}
                </button>
              ))}
            </motion.div>
          )}

          {categoriaActiva === "" && <div className="mb-10"></div>}

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-8 relative z-0">
            
            {cargando ? (
              [...Array(8)].map((_, i) => (
                <div key={`skeleton-${i}`} className="bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
                  <div className="h-36 sm:h-60 bg-gray-100 animate-pulse relative overflow-hidden">
                    <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent animate-[shimmer_1.5s_infinite]"></div>
                  </div>
                  <div className="p-3 sm:p-6 flex-grow flex flex-col relative overflow-hidden">
                    <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent animate-[shimmer_1.5s_infinite] z-10"></div>
                    <div className="h-2.5 sm:h-3 bg-gray-200 rounded-full w-1/4 mb-3"></div>
                    <div className="h-4 sm:h-5 bg-gray-200 rounded-full w-3/4 mb-4"></div>
                    <div className="space-y-2 mb-6 hidden sm:block">
                      <div className="h-3 bg-gray-100 rounded-full w-full"></div>
                      <div className="h-3 bg-gray-100 rounded-full w-5/6"></div>
                    </div>
                    <div className="mt-auto pt-3 sm:pt-4 border-t border-gray-50 flex justify-between items-center">
                      <div className="h-5 sm:h-7 bg-gray-200 rounded-full w-1/3"></div>
                      <div className="h-9 w-9 sm:h-11 sm:w-11 bg-gray-200 rounded-xl sm:rounded-2xl"></div>
                    </div>
                  </div>
                </div>
              ))
            ) : productosFiltrados.length === 0 ? (
              <div className="col-span-full flex flex-col items-center justify-center py-24 bg-white rounded-3xl shadow-sm border border-gray-100 text-gray-400">
                <PackageOpen className="w-16 h-16 mb-4 text-gray-300 opacity-80" />
                <span className="text-lg font-medium text-center px-4">{busqueda !== "" ? `No encontramos nada para "${busqueda}".` : "No hay productos disponibles por el momento."}</span>
              </div>
            ) : (
              productosFiltrados.map((prod, index) => {
                const listaFotos = obtenerListaImagenes(prod.imagen_url);
                const idxFoto = indicesCarrusel[prod.id] || 0; // NUEVO: Averigua qué foto le toca mostrar a este producto
                
                return (
                <motion.div 
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                  key={prod.id} 
                  className="bg-white rounded-2xl sm:rounded-3xl shadow-sm hover:shadow-xl sm:hover:-translate-y-2 transition-all duration-300 overflow-hidden flex flex-col border border-gray-100/50 group"
                >
                  <div 
                    className="h-36 sm:h-60 bg-gray-50 relative p-3 sm:p-6 flex items-center justify-center overflow-hidden cursor-pointer group/img"
                    onClick={() => abrirModalProducto(prod)}
                  >
                    {listaFotos.length > 0 ? (
                      <>
                        <img src={listaFotos[idxFoto]} alt={prod.nombre} className="max-w-full max-h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-700 ease-out" />
                        
                        {/* MAGIA: Flechitas y puntitos (Discretas en celu, tamaño normal en PC) */}
                        {listaFotos.length > 1 && (
                          <>
                            <div className="absolute inset-0 flex items-center justify-between px-0.5 sm:px-2 opacity-100 sm:opacity-0 sm:group-hover/img:opacity-100 transition-opacity duration-300">
                              <button onClick={(e) => retrocederFotoCarrusel(e, prod.id, listaFotos.length)} className="bg-white/40 sm:bg-white/90 hover:bg-white/80 sm:hover:bg-white text-gray-800 p-0.5 sm:p-2 rounded-full shadow-sm sm:shadow-md backdrop-blur-sm transition-all active:scale-95 sm:hover:scale-110">
                                <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                              </button>
                              <button onClick={(e) => avanzarFotoCarrusel(e, prod.id, listaFotos.length)} className="bg-white/40 sm:bg-white/90 hover:bg-white/80 sm:hover:bg-white text-gray-800 p-0.5 sm:p-2 rounded-full shadow-sm sm:shadow-md backdrop-blur-sm transition-all active:scale-95 sm:hover:scale-110">
                                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                              </button>
                            </div>
                            <div className="absolute bottom-1 sm:bottom-2 left-0 right-0 flex justify-center gap-1 opacity-100 sm:opacity-0 sm:group-hover/img:opacity-100 transition-opacity duration-300">
                              {listaFotos.map((_, i) => (
                                <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === idxFoto ? 'bg-blue-600 w-2.5 sm:w-4' : 'bg-gray-300/90 w-1.5 sm:w-2'}`}></div>
                              ))}
                            </div>
                          </>
                        )}
                      </>
                    ) : (
                      <div className="text-gray-400 text-xs sm:text-sm flex flex-col items-center gap-2">
                         <CameraOff className="w-6 h-6 sm:w-8 sm:h-8 opacity-50" />
                         Sin foto
                      </div>
                    )}
                    
                    {prod.stock <= 0 && !prod.por_encargue && <span className="absolute top-2 right-2 sm:top-4 sm:right-4 bg-red-500/90 backdrop-blur-sm text-white text-[10px] sm:text-xs font-bold px-2 py-1 sm:px-3 sm:py-1.5 rounded-full shadow-sm z-10">Sin Stock</span>}
                  </div>

                  <div className="p-3 sm:p-5 flex-grow flex flex-col border-t border-gray-50">
                    <span className="text-[9px] sm:text-[10px] text-blue-500 font-bold uppercase tracking-widest mb-1 opacity-80 line-clamp-1">{obtenerNombreSubcategoria(prod.subcategoria_id)}</span>
                    <h3 className="font-bold text-gray-800 text-[13px] sm:text-[15px] leading-tight mb-2 group-hover:text-blue-600 transition-colors duration-300 line-clamp-3" title={prod.nombre}>
                      {prod.nombre}
                    </h3>
                    <p className="text-[11px] sm:text-xs text-gray-500 flex-grow mb-3 line-clamp-2 leading-relaxed">{prod.descripcion}</p>
                    
                    <div className="flex justify-between items-end mt-auto pt-3 border-t border-gray-100">
                      <span className="text-base sm:text-xl font-bold text-emerald-600 tracking-tight">${prod.precio.toLocaleString('es-AR')}</span>
                      <button 
                        onClick={(e) => { e.stopPropagation(); agregarAlCarrito(prod); }}
                        // EXCEPCIÓN BOTÓN: Se desactiva solo si NO hay stock Y NO es por encargue
                        disabled={prod.stock <= 0 && !prod.por_encargue}
                        className={`p-2.5 sm:p-3 rounded-xl sm:rounded-2xl font-bold transition-all duration-300 flex items-center justify-center cursor-pointer ${prod.stock > 0 || prod.por_encargue ? 'bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white hover:shadow-md sm:hover:scale-105' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                        title="Agregar al carrito"
                      >
                        <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              )})
            )}
          </div>
        </main>
      </div>

      <footer className="bg-blue-950 text-white py-12 mt-20 border-t border-blue-900 relative z-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8 text-center md:text-left">
          <div>
            <h3 className="text-2xl font-black tracking-widest uppercase mb-2">El Manguruyu</h3>
            <p className="text-sm text-gray-400 font-medium">Equipamiento de Pesca y Tecnología.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-8 text-sm text-gray-300 items-center font-medium">
            <a href={`https://wa.me/${numeroWhatsApp}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 hover:text-emerald-400 transition-colors group">
              <MessageCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span>Contactanos por WhatsApp</span>
            </a>
            <a href="https://www.instagram.com/el_manguruyu_fishingshop/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 hover:text-blue-400 transition-colors group">
              <InstagramIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span>Síguenos en Instagram</span>
            </a>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 text-center text-xs text-gray-500 mt-12 pt-8 border-t border-blue-900/50">
          © 2026 El Manguruyu. Todos los derechos reservados.
        </div>
      </footer>

      <AnimatePresence>
        {productoModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-6">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setProductoModal(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-pointer"
            ></motion.div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90dvh] sm:max-h-[90vh] overflow-y-auto overflow-x-hidden z-10 flex flex-col md:flex-row"
            >
              <button 
                onClick={() => setProductoModal(null)} 
                className="absolute top-3 right-3 z-20 bg-white/80 backdrop-blur-md p-2 rounded-full text-gray-500 hover:text-gray-800 shadow-sm transition-all hover:bg-gray-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="w-full md:w-1/2 bg-gray-50 flex flex-col items-center justify-center p-4 sm:p-12 min-h-[200px] sm:min-h-[300px] relative group shrink-0">
                
                {(() => {
                  const listaModal = obtenerListaImagenes(productoModal.imagen_url);
                  return listaModal.length > 0 ? (
                    <>
                      {listaModal.length > 1 && (
                        <button 
                          onClick={(e) => { e.stopPropagation(); retrocederFoto(listaModal); }} 
                          className="absolute left-2 sm:left-4 bg-white/80 p-2 rounded-full shadow-md text-gray-600 hover:text-blue-600 hover:bg-white transition-all cursor-pointer z-10"
                        >
                          <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                        </button>
                      )}

                      <img src={listaModal[indiceFotoActual]} alt={productoModal.nombre} className="max-w-full h-[220px] sm:h-auto sm:max-h-[400px] object-contain mix-blend-multiply drop-shadow-xl transition-all duration-300" />
                      
                      {listaModal.length > 1 && (
                        <button 
                          onClick={(e) => { e.stopPropagation(); avanzarFoto(listaModal); }} 
                          className="absolute right-2 sm:right-4 bg-white/80 p-2 rounded-full shadow-md text-gray-600 hover:text-blue-600 hover:bg-white transition-all cursor-pointer z-10"
                        >
                          <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
                        </button>
                      )}
                      
                      {listaModal.length > 1 && (
                        <div className="absolute bottom-2 sm:bottom-4 flex gap-1.5 sm:gap-2">
                          {listaModal.map((_, i) => (
                            <div key={i} className={`h-1.5 sm:h-2 rounded-full transition-all duration-300 ${i === indiceFotoActual ? 'bg-blue-600 w-3 sm:w-4' : 'bg-gray-300 w-1.5 sm:w-2'}`}></div>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-gray-400 flex flex-col items-center gap-2">
                      <CameraOff className="w-10 h-10 sm:w-12 sm:h-12 opacity-50" />
                      <span className="text-sm">Sin imagen</span>
                    </div>
                  );
                })()}

              </div>
              
              <div className="w-full md:w-1/2 p-5 pb-8 sm:p-10 flex flex-col shrink-0">
                <span className="text-xs sm:text-sm text-blue-500 font-bold uppercase tracking-widest mb-2">{obtenerNombreSubcategoria(productoModal.subcategoria_id)}</span>
                <h2 className="text-2xl sm:text-3xl font-black text-gray-800 leading-tight mb-4">{productoModal.nombre}</h2>
                <p className="text-sm sm:text-base text-gray-500 leading-relaxed mb-8 flex-grow">{productoModal.descripcion}</p>
                
                <div className="border-t border-gray-100 pt-6 mt-auto">
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-3xl sm:text-4xl font-black text-emerald-600 tracking-tight">${productoModal.precio.toLocaleString('es-AR')}</span>
                    {/* EXCEPCIÓN MODAL CARTEL: Se oculta si es por encargue */}
                    {productoModal.stock <= 0 && !productoModal.por_encargue && (
                       <span className="bg-red-100 text-red-600 font-bold px-3 py-1.5 rounded-full text-sm">Sin stock</span>
                    )}
                  </div>
                  <button 
                    onClick={() => { agregarAlCarrito(productoModal); setProductoModal(null); }}
                    // EXCEPCIÓN MODAL BOTÓN: Solo se bloquea si NO hay stock Y NO es por encargue
                    disabled={productoModal.stock <= 0 && !productoModal.por_encargue}
                    className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all cursor-pointer ${productoModal.stock > 0 || productoModal.por_encargue ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-xl hover:-translate-y-1' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                  >
                    <ShoppingCart className="w-5 h-5" />
                    {productoModal.stock > 0 || productoModal.por_encargue ? 'Agregar al Carrito' : 'Agotado'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {mostrarCarrito && (
          <div className="fixed inset-0 z-40 flex justify-end">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setMostrarCarrito(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm cursor-pointer"
            ></motion.div>
            
            <motion.div 
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              className="relative bg-white w-full max-w-md h-[100dvh] sm:h-full shadow-2xl flex flex-col z-50"
            >
              <div className="p-6 bg-white border-b border-gray-100 flex justify-between items-center">
                <h2 className="text-xl font-bold flex items-center gap-3 text-gray-800">
                  <ShoppingCart className="w-6 h-6 text-blue-600" />
                  Tu Pedido ({cantidadItems})
                </h2>
                <button onClick={() => setMostrarCarrito(false)} className="text-gray-400 hover:text-gray-800 transition-colors cursor-pointer bg-gray-50 hover:bg-gray-100 p-2 rounded-full">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-grow overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6 bg-gray-50/50">
                {carrito.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400">
                    <ShoppingCart className="w-16 h-16 mb-4 opacity-30" />
                    <span className="text-lg font-medium">Tu carrito está vacío</span>
                  </div>
                ) : (
                  carrito.map(item => (
                    <div key={item.id} className="flex justify-between items-center bg-white p-3 sm:p-4 rounded-2xl shadow-sm border border-gray-100">
                      
                      {/* min-w-0 es CLAVE acá para que el texto largo no empuje el precio hacia afuera */}
                      <div className="flex-1 pr-2 sm:pr-4 min-w-0">
                        <h4 className="font-bold text-gray-800 text-sm sm:text-base leading-tight mb-2 sm:mb-3 line-clamp-2" title={item.nombre}>{item.nombre}</h4>
                        
                        <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                          <div className="flex items-center border border-gray-200 rounded-xl shadow-sm bg-white overflow-hidden shrink-0">
                            <button 
                              onClick={() => cambiarCantidad(item.id, 'restar')}
                              disabled={item.cantidad <= 1}
                              className="p-2 sm:p-2.5 text-gray-500 hover:bg-gray-50 disabled:opacity-30 cursor-pointer transition-colors"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="w-6 sm:w-8 text-center font-bold text-blue-700 text-sm">
                              {item.cantidad}
                            </span>
                            <button 
                              onClick={() => cambiarCantidad(item.id, 'sumar')}
                              disabled={!item.por_encargue && item.cantidad >= item.stock}
                              className="p-2 sm:p-2.5 text-gray-500 hover:bg-gray-50 disabled:opacity-30 cursor-pointer transition-colors border-l border-gray-200"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <span className="text-xs sm:text-sm text-gray-500 font-medium tracking-wide whitespace-nowrap shrink-0">x ${item.precio.toLocaleString('es-AR')}</span>
                        </div>
                      </div>

                      {/* shrink-0 protege esta columna para que nunca se achique ni se corte */}
                      <div className="flex flex-col items-end border-l border-gray-100 pl-2 sm:pl-4 shrink-0">
                        <span className="font-black text-emerald-600 mb-3 sm:mb-4 text-base sm:text-lg whitespace-nowrap">${(item.precio * item.cantidad).toLocaleString('es-AR')}</span>
                        <button onClick={() => quitarDelCarrito(item.id)} className="text-gray-400 hover:text-red-500 transition-colors p-1.5 sm:p-2 rounded-full hover:bg-red-50 cursor-pointer" title="Quitar">
                          <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>
                      </div>

                    </div>
                  ))
                )}
              </div>

              {carrito.length > 0 && (
                <div className="p-4 sm:p-6 bg-white border-t border-gray-100 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)]">
                  <div className="flex justify-between items-center mb-4 sm:mb-6 gap-2">
                    <span className="font-bold text-gray-500 uppercase tracking-widest text-xs sm:text-sm">Total a pagar</span>
                    <span className="text-2xl sm:text-3xl font-black text-emerald-600 tracking-tight whitespace-nowrap">${calcularTotal().toLocaleString('es-AR')}</span>
                  </div>
                  <button 
                    onClick={pedirCarritoPorWhatsApp}
                    className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3.5 sm:py-4 rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-base sm:text-lg flex justify-center items-center gap-3 cursor-pointer"
                  >
                    <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6" />
                    Confirmar por WhatsApp
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: 50, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: 20, x: "-50%" }}
            className="fixed bottom-8 left-1/2 z-[100]"
          >
            <div className="bg-gray-900/95 backdrop-blur-md text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 border border-gray-800">
              <AlertCircle className="w-5 h-5 text-yellow-400" />
              <span className="font-medium text-sm tracking-wide">{toast}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

export default Tienda;
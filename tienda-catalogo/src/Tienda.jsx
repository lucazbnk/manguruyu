import { useState, useEffect } from 'react';
import { supabase } from './supabase';
import { Search, ShoppingCart, MessageCircle, ChevronDown, Filter, Plus, Minus, Trash2, X, PackageOpen, AlertCircle, ChevronLeft, ChevronRight, ArrowDownUp, CameraOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ProductCard from './components/ProductCard'; 

const InstagramIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
);

function Tienda() {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [subcategorias, setSubcategorias] = useState([]);
  const [colecciones, setColecciones] = useState([]);
  
  const [variantes, setVariantes] = useState([]);
  const [varianteSeleccionadaModal, setVarianteSeleccionadaModal] = useState(null);

  const [categoriaActiva, setCategoriaActiva] = useState("");
  const [subcategoriaActiva, setSubcategoriaActiva] = useState("");
  const [busqueda, setBusqueda] = useState(""); 
  
  const [ordenActivo, setOrdenActivo] = useState("relevancia");

  const [carrito, setCarrito] = useState([]);
  const [mostrarCarrito, setMostrarCarrito] = useState(false);
  const [toast, setToast] = useState("");

  const [cargando, setCargando] = useState(true);
  const [productoModal, setProductoModal] = useState(null);
  
  const [destacados, setDestacados] = useState([]);
  const [indiceFotoModal, setIndiceFotoModal] = useState(0);

  const numeroWhatsApp = "5493435300833"; 

  useEffect(() => {
    if (productos.length > 0) {
      const elegidos = productos.filter(p => p.destacado);
      if (elegidos.length > 0) {
        const elegidosMezclados = [...elegidos].sort(() => 0.5 - Math.random());
        setDestacados(elegidosMezclados);
      } else {
        const mezclados = [...productos].sort(() => 0.5 - Math.random());
        setDestacados(mezclados.slice(0, 6));
      }
    }
  }, [productos]);

  useEffect(() => {
    if (destacados.length === 0) return;
    const timer = setInterval(() => {
      const carrusel = document.getElementById('carrusel-destacados');
      if (carrusel) {
        const anchoTarjeta = carrusel.firstChild ? carrusel.firstChild.offsetWidth + 16 : 300;
        if (carrusel.scrollLeft + carrusel.clientWidth >= carrusel.scrollWidth - 10) {
          carrusel.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          carrusel.scrollBy({ left: anchoTarjeta, behavior: 'smooth' });
        }
      }
    }, 3500); 
    return () => clearInterval(timer);
  }, [destacados]);

  useEffect(() => {
    const parametros = new URLSearchParams(window.location.search);
    const catUrl = parametros.get('cat');
    const subUrl = parametros.get('sub');
    if (catUrl) setCategoriaActiva(catUrl);
    if (subUrl) setSubcategoriaActiva(subUrl);
  }, []);

  useEffect(() => {
    const parametros = new URLSearchParams(window.location.search);
    if (categoriaActiva) parametros.set('cat', categoriaActiva);
    else parametros.delete('cat');
    if (subcategoriaActiva) parametros.set('sub', subcategoriaActiva);
    else parametros.delete('sub');
    const nuevoTexto = parametros.toString();
    const nuevaUrl = window.location.pathname + (nuevoTexto ? '?' + nuevoTexto : '');
    window.history.replaceState({}, '', nuevaUrl);
  }, [categoriaActiva, subcategoriaActiva]);

  useEffect(() => {
    const cargarTodo = async () => {
      setCargando(true);
      await Promise.all([
        obtenerCategorias(),
        obtenerSubcategorias(),
        obtenerProductos(),
        obtenerColecciones(),
        obtenerVariantes() 
      ]);
      setTimeout(() => setCargando(false), 600); 
    };
    cargarTodo();
  }, []);

  const obtenerCategorias = async () => { const { data } = await supabase.from('categorias').select('*').order('id'); if (data) setCategorias(data); };
  const obtenerSubcategorias = async () => { const { data } = await supabase.from('subcategorias').select('*').order('id'); if (data) setSubcategorias(data); };
  const obtenerProductos = async () => { const { data } = await supabase.from('productos').select('*').order('id'); if (data) setProductos(data); };
  const obtenerColecciones = async () => { const { data } = await supabase.from('colecciones').select('*').order('id', { ascending: true }); if (data) setColecciones(data); };
  
  const obtenerVariantes = async () => { 
    const { data } = await supabase.from('variantes').select('*'); 
    if (data) setVariantes(data); 
  };

  const mostrarToast = (mensaje) => { setToast(mensaje); setTimeout(() => setToast(""), 3000); };

  const agregarAlCarrito = (prod, varianteObj = null) => {
    const cartItemId = varianteObj ? `${prod.id}-var${varianteObj.id}` : prod.id.toString();
    const stockDisponible = varianteObj ? varianteObj.stock : prod.stock;

    // LÓGICA DE PRECIO: Si la variante tiene precio propio lo usamos, si no usamos el base del producto
    const precioAplicable = (varianteObj && varianteObj.precio) ? parseFloat(varianteObj.precio) : prod.precio;

    const itemExistente = carrito.find(item => item.cartItemId === cartItemId);

    if (itemExistente) {
      if (prod.por_encargue || itemExistente.cantidad < stockDisponible) {
        setCarrito(carrito.map(item => item.cartItemId === cartItemId ? { ...item, cantidad: item.cantidad + 1 } : item));
      } else {
        mostrarToast("¡Stock máximo alcanzado para esta opción!");
        return;
      }
    } else {
      setCarrito([...carrito, { 
        ...prod, 
        precio: precioAplicable, // Guardamos el precio correcto (base o de la variante) en el carrito
        cartItemId, 
        cantidad: 1, 
        varianteSelec: varianteObj,
        stockAplicable: stockDisponible 
      }]);
    }
    setMostrarCarrito(true);
  };

  const cambiarCantidad = (cartItemId, operacion) => {
    setCarrito(carrito.map(item => {
      if (item.cartItemId === cartItemId) {
        if (operacion === 'sumar' && (item.por_encargue || item.cantidad < item.stockAplicable)) {
          return { ...item, cantidad: item.cantidad + 1 };
        } else if (operacion === 'sumar' && (!item.por_encargue && item.cantidad >= item.stockAplicable)) {
          mostrarToast("¡Stock máximo alcanzado para esta opción!");
          return item;
        } else if (operacion === 'restar' && item.cantidad > 1) {
          return { ...item, cantidad: item.cantidad - 1 };
        }
      }
      return item;
    }));
  };

  const quitarDelCarrito = (cartItemId) => setCarrito(carrito.filter(item => item.cartItemId !== cartItemId));
  const calcularTotal = () => carrito.reduce((total, item) => total + (item.precio * item.cantidad), 0);
  const cantidadItems = carrito.reduce((total, item) => total + item.cantidad, 0);

  const pedirCarritoPorWhatsApp = () => {
    if (carrito.length === 0) return;
    let texto = "¡Hola El Manguruyu! Quiero hacer el siguiente pedido:%0A%0A";
    carrito.forEach(item => {
      const nombreFinal = item.varianteSelec ? `${item.nombre} (${item.varianteSelec.nombre})` : item.nombre;
      texto += `▪ ${item.cantidad}x *${nombreFinal}* ($${(item.precio * item.cantidad).toLocaleString('es-AR')})%0A`;
    });
    texto += `%0A*TOTAL DEL PEDIDO: $${calcularTotal().toLocaleString('es-AR')}*%0A%0A¿Tienen stock disponible para confirmar la compra?`;
    window.open(`https://wa.me/${numeroWhatsApp}?text=${texto}`, '_blank');
  };

  const abrirModalProducto = (prod) => {
    setProductoModal(prod);
    setIndiceFotoModal(0);
    setVarianteSeleccionadaModal(null);
  };

  const avanzarFotoModal = (imagenes) => setIndiceFotoModal((prev) => (prev === imagenes.length - 1 ? 0 : prev + 1));
  const retrocederFotoModal = (imagenes) => setIndiceFotoModal((prev) => (prev === 0 ? imagenes.length - 1 : prev - 1));

  const irAColeccion = (categoriaId) => {
    if (categoriaId) {
      setCategoriaActiva(categoriaId); setSubcategoriaActiva(""); setBusqueda("");
      setTimeout(() => document.getElementById("seccion-productos")?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    }
  };

  const obtenerIdCategoria = (subcatId) => { const sub = subcategorias.find(s => String(s.id) === String(subcatId)); return sub ? sub.categoria_id : null; };
  const obtenerNombreSubcategoria = (subcatId) => { const sub = subcategorias.find(s => String(s.id) === String(subcatId)); return sub ? sub.nombre : 'General'; };
  const obtenerNombreCategoriaActiva = () => { const cat = categorias.find(c => String(c.id) === String(categoriaActiva)); return cat ? cat.nombre : ""; };

  const obtenerListaImagenes = (imagen_url) => {
    if (!imagen_url) return [];
    if (Array.isArray(imagen_url)) return imagen_url; 
    if (typeof imagen_url === 'string') { try { const parseado = JSON.parse(imagen_url); if (Array.isArray(parseado)) return parseado; } catch (e) { return [imagen_url]; } }
    return [imagen_url]; 
  };

  const productosFiltrados = productos.filter(p => {
    const todasSusSubcats = [p.subcategoria_id, ...(p.subcategorias_extra || [])];
    const todasSusCatsPadre = todasSusSubcats.map(subId => obtenerIdCategoria(subId));
    const pasaCategoria = categoriaActiva === "" || todasSusCatsPadre.some(catId => String(catId) === String(categoriaActiva));
    const pasaSubcategoria = subcategoriaActiva === "" || todasSusSubcats.some(subId => String(subId) === String(subcategoriaActiva));
    const textoBusqueda = busqueda.toLowerCase();
    const pasaBusqueda = (p.nombre && p.nombre.toLowerCase().includes(textoBusqueda)) || (p.descripcion && p.descripcion.toLowerCase().includes(textoBusqueda));
    return pasaCategoria && pasaSubcategoria && pasaBusqueda;
  });

  const productosOrdenados = [...productosFiltrados].sort((a, b) => {
    if (ordenActivo === "menor_precio") return a.precio - b.precio;
    if (ordenActivo === "mayor_precio") return b.precio - a.precio;
    if (ordenActivo === "relevancia") {
      const aStockDisp = variantes.some(v => v.producto_id === a.id && v.stock > 0) || a.stock > 0 || a.por_encargue ? 1 : 0;
      const bStockDisp = variantes.some(v => v.producto_id === b.id && v.stock > 0) || b.stock > 0 || b.por_encargue ? 1 : 0;
      return bStockDisp - aStockDisp; 
    }
    return 0;
  });

  const variantesDelModalAbierto = productoModal ? variantes.filter(v => String(v.producto_id) === String(productoModal.id)) : [];

  // LÓGICA DE PRECIO DINÁMICO PARA EL MODAL: Si hay variante seleccionada y tiene precio, mostramos ese. Si no, mostramos el base del producto.
  const precioMostrarModal = varianteSeleccionadaModal && varianteSeleccionadaModal.precio 
    ? parseFloat(varianteSeleccionadaModal.precio) 
    : (productoModal ? productoModal.precio : 0);

  return (
    <div className="min-h-screen bg-[#F8FAFC] relative flex flex-col justify-between font-sans text-gray-800">
      
      <div>
        <header className="bg-slate-900 text-white shadow-lg sticky top-0 z-30 transition-all duration-300">
          <div className="max-w-7xl mx-auto p-2 sm:p-4 flex items-center justify-between gap-2 sm:gap-4">
            
            <div className="flex items-center shrink-0 cursor-pointer group" onClick={() => {setCategoriaActiva(""); setSubcategoriaActiva(""); setBusqueda("");}}>
              <img src="/logo.png" alt="Logo Manguruyu" className="w-10 h-10 md:w-12 md:h-12 object-contain bg-white rounded-full p-1 shadow-sm group-hover:scale-105 transition-transform duration-300" />
              <h1 className="text-xl md:text-2xl font-black tracking-wider uppercase hidden lg:block ml-3">El Manguruyu</h1>
            </div>

            <div className="flex-1 relative group max-w-2xl">
              <input 
                type="text" placeholder="Buscar..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)}
                className="w-full border border-transparent p-2 sm:p-3 pl-9 sm:pl-12 rounded-full shadow-inner focus:outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-400/20 transition-all duration-300 bg-slate-800 text-white text-sm sm:text-base placeholder-slate-400"
              />
              <Search className="absolute left-3 sm:left-4 top-2.5 sm:top-3.5 w-4 h-4 sm:w-5 sm:h-5 text-slate-400 group-focus-within:text-emerald-400 transition-colors duration-300" />
            </div>

            <div className="shrink-0">
              <button 
                onClick={() => setMostrarCarrito(true)} 
                className="relative bg-white/10 backdrop-blur-md p-2.5 sm:px-5 sm:py-2.5 rounded-full hover:bg-white/20 transition-all duration-300 flex items-center gap-2 font-semibold cursor-pointer border border-white/20 hover:shadow-lg hover:-translate-y-0.5"
              >
                <ShoppingCart className="w-5 h-5 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">Carrito</span>
                {cantidadItems > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 sm:-top-2 sm:-right-2 bg-emerald-500 text-white text-[10px] sm:text-xs font-bold w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center rounded-full shadow-md border-2 border-slate-900 animate-pulse">
                    {cantidadItems}
                  </span>
                )}
              </button>
            </div>
            
          </div>
        </header>

        <main className="max-w-7xl mx-auto p-4 sm:p-6 mt-4">
          
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="relative bg-gradient-to-br from-slate-900 to-slate-800 rounded-[2rem] overflow-hidden shadow-2xl mb-10 border border-slate-700/50">
            <div className="absolute inset-0 bg-slate-950/20"></div>
            <div className="relative px-6 py-12 sm:py-20 text-center flex flex-col items-center">
              <span className="bg-slate-700 text-slate-100 text-xs sm:text-sm font-bold px-4 py-1.5 rounded-full mb-6 tracking-widest uppercase shadow-sm">
                El Manguruyu
              </span>
              <h2 className="text-3xl sm:text-5xl font-black text-white mb-6 tracking-tight leading-tight">Lo que necesitás, <br className="hidden sm:block" /> lo encontras acá</h2>
              <p className="text-slate-300 text-sm sm:text-lg max-w-2xl font-medium leading-relaxed">Explorá nuestro catálogo y pedí directamente por WhatsApp.</p>
            </div>
          </motion.div>

          {colecciones.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-16">
              {colecciones.map((col, index) => (
                <motion.div key={col.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: index * 0.1 }} onClick={() => irAColeccion(col.categoria_id)} className="relative h-[250px] sm:h-[400px] group cursor-pointer overflow-hidden rounded-3xl shadow-md border border-slate-100">
                  <img src={col.imagen_url} alt={col.titulo} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/30 to-transparent opacity-80 group-hover:opacity-90 transition-opacity"></div>
                  <div className="absolute bottom-6 left-6 right-6">
                    <h3 className="text-white text-3xl sm:text-4xl font-black italic tracking-wide mb-3 drop-shadow-md">{col.titulo}</h3>
                    <button className="bg-white text-slate-900 px-5 py-2 text-xs sm:text-sm font-bold uppercase tracking-wider rounded-md transition-colors group-hover:bg-emerald-500 group-hover:text-white shadow-sm">Ver colección</button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {destacados.length > 0 && (
            <div className="mb-12 sm:mb-16">
              <div className="flex items-center mb-6 px-2">
                <h3 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">Destacados</h3>
              </div>
              <div id="carrusel-destacados" className="flex gap-4 overflow-x-auto pb-6 pt-2 px-2" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                <style>{`#carrusel-destacados::-webkit-scrollbar { display: none; }`}</style>
                {destacados.map((prod, index) => (
                   <div key={`dest-${prod.id}`} className="min-w-[260px] max-w-[260px] sm:min-w-[300px] sm:max-w-[300px] shrink-0">
                      <ProductCard prod={prod} index={index} onAddToCart={agregarAlCarrito} onOpenModal={abrirModalProducto} obtenerNombreSubcategoria={obtenerNombreSubcategoria} variantes={variantes} />
                   </div>
                ))}
              </div>
            </div>
          )}

          <div id="seccion-productos" className="relative flex flex-col md:flex-row gap-4 mb-10 z-20 pt-4 px-2 sm:px-4 max-w-5xl mx-auto w-full">
            <div className="flex-1 relative">
              <span className="block text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1 text-left">Categorías</span>
              <div className="flex items-center bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-300 px-4 py-3 w-full group cursor-pointer">
                <Filter className="w-5 h-5 text-slate-500 mr-2 group-hover:scale-110 transition-transform shrink-0" />
                <select value={categoriaActiva} onChange={(e) => { setCategoriaActiva(e.target.value); setSubcategoriaActiva(""); }} className="bg-transparent text-slate-700 font-semibold text-sm sm:text-base focus:outline-none cursor-pointer appearance-none w-full pr-6">
                  <option value="">Todas las Categorías</option>
                  {categorias.map(cat => <option key={cat.id} value={cat.id}>{cat.nombre}</option>)}
                </select>
                <ChevronDown className="absolute right-4 w-5 h-5 text-slate-400 pointer-events-none" />
              </div>
            </div>

            <AnimatePresence>
              {categoriaActiva !== "" && (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="flex-1 relative">
                  <span className="block text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1 text-left line-clamp-1">Subcategorías de {obtenerNombreCategoriaActiva()}</span>
                  <div className="flex items-center bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-300 px-4 py-3 w-full group cursor-pointer">
                    <Filter className="w-5 h-5 text-slate-400 mr-2 group-hover:scale-110 transition-transform shrink-0" />
                    <select value={subcategoriaActiva} onChange={(e) => setSubcategoriaActiva(e.target.value)} className="bg-transparent text-slate-700 font-semibold text-sm sm:text-base focus:outline-none cursor-pointer appearance-none w-full pr-6">
                      <option value="">Todo en {obtenerNombreCategoriaActiva()}</option>
                      {subcategorias.filter(sub => String(sub.categoria_id) === String(categoriaActiva)).map(sub => <option key={sub.id} value={sub.id}>{sub.nombre}</option>)}
                    </select>
                    <ChevronDown className="absolute right-4 w-5 h-5 text-slate-400 pointer-events-none" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex-1 relative">
              <span className="block text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1 text-left">Ordenar por</span>
              <div className="flex items-center bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-300 px-4 py-3 w-full group cursor-pointer">
                <ArrowDownUp className="w-5 h-5 text-slate-500 mr-2 group-hover:scale-110 transition-transform shrink-0" />
                <select value={ordenActivo} onChange={(e) => setOrdenActivo(e.target.value)} className="bg-transparent text-slate-700 font-semibold text-sm sm:text-base focus:outline-none cursor-pointer appearance-none w-full pr-6">
                  <option value="relevancia">Relevancia</option>
                  <option value="menor_precio">Menor Precio</option>
                  <option value="mayor_precio">Mayor Precio</option>
                </select>
                <ChevronDown className="absolute right-4 w-5 h-5 text-slate-400 pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6 relative z-0 items-stretch">
            {cargando ? (
              [...Array(8)].map((_, i) => (
                <div key={`skeleton-${i}`} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col h-[350px]">
                  <div className="h-48 sm:h-56 bg-slate-100 animate-pulse"></div>
                  <div className="p-4 flex-grow flex flex-col">
                    <div className="h-3 bg-slate-200 rounded-full w-1/4 mb-3 animate-pulse"></div>
                    <div className="h-4 bg-slate-200 rounded-full w-3/4 mb-4 animate-pulse"></div>
                    <div className="space-y-2 mt-auto">
                      <div className="flex justify-between items-center pt-4 border-t border-slate-50"><div className="h-6 bg-slate-200 rounded-full w-1/3 animate-pulse"></div><div className="h-10 w-10 bg-slate-200 rounded-xl animate-pulse"></div></div>
                    </div>
                  </div>
                </div>
              ))
            ) : productosOrdenados.length === 0 ? (
              <div className="col-span-full flex flex-col items-center justify-center py-24 bg-white rounded-3xl shadow-sm border border-slate-100 text-slate-400">
                <PackageOpen className="w-16 h-16 mb-4 text-slate-300 opacity-80" />
                <span className="text-lg font-medium text-center px-4">{busqueda !== "" ? `No encontramos nada para "${busqueda}".` : "No hay productos disponibles por el momento."}</span>
              </div>
            ) : (
              productosOrdenados.map((prod, index) => (
                <ProductCard key={prod.id} prod={prod} index={index} onAddToCart={agregarAlCarrito} onOpenModal={abrirModalProducto} obtenerNombreSubcategoria={obtenerNombreSubcategoria} variantes={variantes} />
              ))
            )}
          </div>
        </main>
      </div>

      <button onClick={() => setMostrarCarrito(true)} className="sm:hidden fixed bottom-6 right-6 bg-slate-900 text-white p-4 rounded-full shadow-2xl z-40 active:scale-95 transition-transform border border-white/20">
        <ShoppingCart className="w-6 h-6" />
        {cantidadItems > 0 && <span className="absolute -top-2 -right-2 bg-emerald-500 text-white text-[11px] font-black w-6 h-6 flex items-center justify-center rounded-full shadow-md border-2 border-white animate-pulse">{cantidadItems}</span>}
      </button>

      <footer className="bg-slate-950 text-white py-12 mt-20 border-t border-slate-900 relative z-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8 text-center md:text-left">
          <div><h3 className="text-2xl font-black tracking-widest uppercase mb-2">El Manguruyu</h3><p className="text-sm text-slate-400 font-medium">Equipamiento de Pesca y Tecnología.</p></div>
          <div className="flex flex-col sm:flex-row gap-8 text-sm text-slate-300 items-center font-medium">
            <a href={`https://wa.me/${numeroWhatsApp}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 hover:text-emerald-400 transition-colors group"><MessageCircle className="w-5 h-5 group-hover:scale-110 transition-transform" /><span>Contactanos por WhatsApp</span></a>
            <a href="https://www.instagram.com/el_manguruyu_fishingshop/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 hover:text-slate-100 transition-colors group"><InstagramIcon className="w-5 h-5 group-hover:scale-110 transition-transform" /><span>Síguenos en Instagram</span></a>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 text-center text-xs text-slate-500 mt-12 pt-8 border-t border-slate-900/50">© 2026 El Manguruyu. Todos los derechos reservados.</div>
      </footer>

      {/* MODAL DE PRODUCTO (CON SELECTOR DE VARIANTES Y PRECIO DINÁMICO) */}
      <AnimatePresence>
        {productoModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setProductoModal(null)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm cursor-pointer"></motion.div>
            
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90dvh] sm:max-h-[90vh] overflow-y-auto overflow-x-hidden z-10 flex flex-col md:flex-row">
              <button onClick={() => setProductoModal(null)} className="absolute top-3 right-3 z-20 bg-white/80 backdrop-blur-md p-2 rounded-full text-slate-500 hover:text-slate-800 shadow-sm transition-all hover:bg-slate-100 cursor-pointer"><X className="w-5 h-5" /></button>
              
              <div className="w-full md:w-1/2 bg-slate-50 flex flex-col items-center justify-center p-4 sm:p-12 min-h-[200px] sm:min-h-[300px] relative group shrink-0">
                {(() => {
                  const listaModal = obtenerListaImagenes(productoModal.imagen_url);
                  return listaModal.length > 0 ? (
                    <>
                      {listaModal.length > 1 && <button onClick={(e) => { e.stopPropagation(); retrocederFotoModal(listaModal); }} className="absolute left-2 sm:left-4 bg-white/80 p-2 rounded-full shadow-md text-slate-600 hover:text-slate-900 hover:bg-white transition-all cursor-pointer z-10"><ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" /></button>}
                      <img src={listaModal[indiceFotoModal]} alt={productoModal.nombre} className="max-w-full h-[220px] sm:h-auto sm:max-h-[400px] object-contain mix-blend-multiply drop-shadow-xl transition-all duration-300" />
                      {listaModal.length > 1 && <button onClick={(e) => { e.stopPropagation(); avanzarFotoModal(listaModal); }} className="absolute right-2 sm:right-4 bg-white/80 p-2 rounded-full shadow-md text-slate-600 hover:text-slate-900 hover:bg-white transition-all cursor-pointer z-10"><ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" /></button>}
                      {listaModal.length > 1 && <div className="absolute bottom-2 sm:bottom-4 flex gap-1.5 sm:gap-2">{listaModal.map((_, i) => <div key={i} className={`h-1.5 sm:h-2 rounded-full transition-all duration-300 ${i === indiceFotoModal ? 'bg-slate-800 w-3 sm:w-4' : 'bg-slate-300 w-1.5 sm:w-2'}`}></div>)}</div>}
                    </>
                  ) : (<div className="text-slate-400 flex flex-col items-center gap-2"><CameraOff className="w-10 h-10 sm:w-12 sm:h-12 opacity-50" /><span className="text-sm">Sin imagen</span></div>);
                })()}
              </div>
              
              <div className="w-full md:w-1/2 p-5 pb-8 sm:p-10 flex flex-col shrink-0">
                <span className="text-xs sm:text-sm text-blue-600 font-bold uppercase tracking-widest mb-2">{obtenerNombreSubcategoria(productoModal.subcategoria_id)}</span>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-800 leading-tight mb-4">{productoModal.nombre}</h2>
                <p className="text-sm sm:text-base text-slate-500 leading-relaxed mb-8 flex-grow">{productoModal.descripcion}</p>
                
                <div className="border-t border-slate-100 pt-6 mt-auto">
                  
                  {/* ZONA DE VARIANTES */}
                  {variantesDelModalAbierto.length > 0 && (
                    <div className="mb-6">
                       <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Elegí una opción *</label>
                       <select 
                         value={varianteSeleccionadaModal ? varianteSeleccionadaModal.id : ""}
                         onChange={(e) => {
                           const vElegida = variantesDelModalAbierto.find(x => String(x.id) === e.target.value);
                           setVarianteSeleccionadaModal(vElegida || null);
                         }}
                         className="w-full border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-blue-500/50 outline-none text-sm font-semibold text-slate-700 bg-white"
                       >
                         <option value="" disabled>Seleccioná tu variante...</option>
                         {variantesDelModalAbierto.map(v => {
                            // Revisamos si la variante tiene un precio particular para mostrarlo en el texto
                            const tienePrecioPropio = v.precio && parseFloat(v.precio) > 0 && parseFloat(v.precio) !== parseFloat(productoModal.precio);
                            const textoExtraPrecio = tienePrecioPropio ? ` ($${parseFloat(v.precio).toLocaleString('es-AR')})` : '';

                            return (
                             <option key={v.id} value={v.id} disabled={v.stock <= 0 && !productoModal.por_encargue}>
                               {v.nombre}{textoExtraPrecio} {v.stock <= 0 && !productoModal.por_encargue ? '(Agotado)' : ''}
                             </option>
                           );
                         })}
                       </select>
                    </div>
                  )}

                  <div className="flex items-center justify-between mb-6">
                    {/* PRECIO GIGANTE DINÁMICO */}
                    <span className="text-3xl sm:text-4xl font-black text-emerald-600 tracking-tight">
                      ${precioMostrarModal.toLocaleString('es-AR')}
                    </span>
                    
                    {(() => {
                      const stockAEvaluar = varianteSeleccionadaModal ? varianteSeleccionadaModal.stock : productoModal.stock;
                      return (stockAEvaluar <= 0 && !productoModal.por_encargue) ? (
                        <span className="bg-red-100 text-red-600 font-bold px-3 py-1.5 rounded-full text-sm">Agotado</span>
                      ) : null;
                    })()}
                  </div>

                  {(() => {
                    const faltaElegirVariante = variantesDelModalAbierto.length > 0 && !varianteSeleccionadaModal;
                    const stockAEvaluar = varianteSeleccionadaModal ? varianteSeleccionadaModal.stock : productoModal.stock;
                    const sinStockReal = stockAEvaluar <= 0 && !productoModal.por_encargue;
                    const botonBloqueado = faltaElegirVariante || sinStockReal;

                    return (
                      <button 
                        onClick={() => { agregarAlCarrito(productoModal, varianteSeleccionadaModal); setProductoModal(null); }}
                        disabled={botonBloqueado}
                        className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all cursor-pointer ${!botonBloqueado ? 'bg-slate-900 text-white hover:bg-slate-800 shadow-md hover:shadow-xl hover:-translate-y-1' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
                      >
                        <ShoppingCart className="w-5 h-5" />
                        {faltaElegirVariante ? 'Elegí una opción arriba' : (sinStockReal ? 'Agotado' : 'Agregar al Carrito')}
                      </button>
                    );
                  })()}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* PANEL LATERAL DEL CARRITO */}
      <AnimatePresence>
        {mostrarCarrito && (
          <div className="fixed inset-0 z-40 flex justify-end">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMostrarCarrito(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm cursor-pointer"></motion.div>
            <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", bounce: 0, duration: 0.4 }} className="relative bg-white w-full max-w-md h-[100dvh] sm:h-full shadow-2xl flex flex-col z-50">
              <div className="p-6 bg-white border-b border-slate-100 flex justify-between items-center">
                <h2 className="text-xl font-bold flex items-center gap-3 text-slate-800"><ShoppingCart className="w-6 h-6 text-slate-900" />Tu Pedido ({cantidadItems})</h2>
                <button onClick={() => setMostrarCarrito(false)} className="text-slate-400 hover:text-slate-800 transition-colors cursor-pointer bg-slate-50 hover:bg-slate-100 p-2 rounded-full"><X className="w-5 h-5" /></button>
              </div>

              <div className="flex-grow overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6 bg-slate-50/50">
                {carrito.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-slate-400"><ShoppingCart className="w-16 h-16 mb-4 opacity-30" /><span className="text-lg font-medium">Tu carrito está vacío</span></div>
                ) : (
                  carrito.map(item => (
                    <div key={item.cartItemId} className="flex justify-between items-center bg-white p-3 sm:p-4 rounded-2xl shadow-sm border border-slate-100">
                      <div className="flex-1 pr-2 sm:pr-4 min-w-0">
                        <h4 className="font-bold text-slate-800 text-sm sm:text-base leading-tight mb-2 sm:mb-3 line-clamp-2" title={item.nombre}>
                          {item.nombre} {item.varianteSelec && <span className="text-blue-600">({item.varianteSelec.nombre})</span>}
                        </h4>
                        
                        <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                          <div className="flex items-center border border-slate-200 rounded-xl shadow-sm bg-white overflow-hidden shrink-0">
                            <button onClick={() => cambiarCantidad(item.cartItemId, 'restar')} disabled={item.cantidad <= 1} className="p-2 sm:p-2.5 text-slate-500 hover:bg-slate-50 disabled:opacity-30 cursor-pointer transition-colors"><Minus className="w-3.5 h-3.5" /></button>
                            <span className="w-6 sm:w-8 text-center font-bold text-slate-700 text-sm">{item.cantidad}</span>
                            <button onClick={() => cambiarCantidad(item.cartItemId, 'sumar')} disabled={!item.por_encargue && item.cantidad >= item.stockAplicable} className="p-2 sm:p-2.5 text-slate-500 hover:bg-slate-50 disabled:opacity-30 cursor-pointer transition-colors border-l border-slate-200"><Plus className="w-3.5 h-3.5" /></button>
                          </div>
                          <span className="text-xs sm:text-sm text-slate-500 font-medium tracking-wide whitespace-nowrap shrink-0">x ${item.precio.toLocaleString('es-AR')}</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end border-l border-slate-100 pl-2 sm:pl-4 shrink-0">
                        <span className="font-black text-emerald-600 mb-3 sm:mb-4 text-base sm:text-lg whitespace-nowrap">${(item.precio * item.cantidad).toLocaleString('es-AR')}</span>
                        <button onClick={() => quitarDelCarrito(item.cartItemId)} className="text-slate-400 hover:text-red-500 transition-colors p-1.5 sm:p-2 rounded-full hover:bg-red-50 cursor-pointer" title="Quitar"><Trash2 className="w-4 h-4 sm:w-5 sm:h-5" /></button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {carrito.length > 0 && (
                <div className="p-4 sm:p-6 bg-white border-t border-slate-100 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)]">
                  <div className="flex justify-between items-center mb-4 sm:mb-6 gap-2"><span className="font-bold text-slate-500 uppercase tracking-widest text-xs sm:text-sm">Total a pagar</span><span className="text-2xl sm:text-3xl font-black text-emerald-600 tracking-tight whitespace-nowrap">${calcularTotal().toLocaleString('es-AR')}</span></div>
                  <button onClick={pedirCarritoPorWhatsApp} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3.5 sm:py-4 rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-base sm:text-lg flex justify-center items-center gap-3 cursor-pointer"><MessageCircle className="w-5 h-5 sm:w-6 sm:h-6" />Confirmar por WhatsApp</button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: 50, x: "-50%" }} animate={{ opacity: 1, y: 0, x: "-50%" }} exit={{ opacity: 0, y: 20, x: "-50%" }} className="fixed bottom-8 left-1/2 z-[100]">
            <div className="bg-slate-900/95 backdrop-blur-md text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-800"><AlertCircle className="w-5 h-5 text-yellow-400" /><span className="font-medium text-sm tracking-wide">{toast}</span></div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Tienda;
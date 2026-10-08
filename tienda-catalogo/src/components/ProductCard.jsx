import { useState } from 'react';
import { ShoppingCart, CameraOff, ChevronLeft, ChevronRight, Check, ListPlus } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ProductCard({ prod, onAddToCart, onOpenModal, obtenerNombreSubcategoria, index, variantes = [] }) {
  const [idxFoto, setIdxFoto] = useState(0);
  const [agregado, setAgregado] = useState(false);

  // Filtramos las variantes que le pertenecen a este producto
  const misVariantes = variantes.filter(v => String(v.producto_id) === String(prod.id));
  const tieneVariantes = misVariantes.length > 0;

  const listaFotos = Array.isArray(prod.imagen_url) 
    ? prod.imagen_url 
    : (typeof prod.imagen_url === 'string' ? [prod.imagen_url] : []);

  const avanzarFoto = (e) => {
    e.stopPropagation();
    setIdxFoto((prev) => (prev === listaFotos.length - 1 ? 0 : prev + 1));
  };

  const retrocederFoto = (e) => {
    e.stopPropagation();
    setIdxFoto((prev) => (prev === 0 ? listaFotos.length - 1 : prev - 1));
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();
    if (tieneVariantes) {
      // Si tiene variantes, obligamos a abrir el modal para que elija
      onOpenModal(prod);
    } else {
      // Si es un producto normal sin variantes, va directo al carrito
      onAddToCart(prod);
      setAgregado(true);
      setTimeout(() => setAgregado(false), 1500);
    }
  };

  // Si tiene variantes, sumamos el stock de todas para saber si está agotado
  const stockTotal = tieneVariantes 
    ? misVariantes.reduce((acc, v) => acc + (parseInt(v.stock) || 0), 0) 
    : prod.stock;

  const sinStock = stockTotal <= 0 && !prod.por_encargue;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="bg-white rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col border border-slate-100 group h-full cursor-pointer"
      onClick={() => onOpenModal(prod)}
    >
      <div className="h-48 sm:h-56 bg-slate-50 relative p-4 flex items-center justify-center overflow-hidden rounded-t-2xl">
        {listaFotos.length > 0 ? (
          <>
            <img 
              src={listaFotos[idxFoto]} 
              alt={prod.nombre} 
              className="max-w-full max-h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-500 ease-out" 
            />
            {listaFotos.length > 1 && (
              <div className="absolute inset-0 flex items-center justify-between px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <button onClick={retrocederFoto} className="bg-white/90 hover:bg-white text-slate-800 p-1.5 rounded-full shadow-md backdrop-blur-sm transition-transform active:scale-90" aria-label="Foto anterior">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button onClick={avanzarFoto} className="bg-white/90 hover:bg-white text-slate-800 p-1.5 rounded-full shadow-md backdrop-blur-sm transition-transform active:scale-90" aria-label="Siguiente foto">
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
            {listaFotos.length > 1 && (
               <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  {listaFotos.map((_, i) => (
                    <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === idxFoto ? 'bg-slate-800 w-3' : 'bg-slate-300 w-1.5'}`}></div>
                  ))}
               </div>
            )}
          </>
        ) : (
          <div className="text-slate-400 flex flex-col items-center gap-2">
             <CameraOff className="w-8 h-8 opacity-40" />
             <span className="text-xs font-medium">Sin foto</span>
          </div>
        )}
        
        {sinStock && (
          <span className="absolute top-3 right-3 bg-red-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm">
            AGOTADO
          </span>
        )}
      </div>

      <div className="p-4 sm:p-5 flex flex-col flex-grow">
        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1 line-clamp-1">
          {obtenerNombreSubcategoria(prod.subcategoria_id)}
        </span>
        
        <h3 className="font-bold text-slate-900 text-[15px] leading-tight mb-2 min-h-[2.5rem] line-clamp-2">
          {prod.nombre}
        </h3>
        
        <p className="text-xs text-slate-500 mb-4 line-clamp-2 leading-relaxed flex-grow">
          {prod.descripcion}
        </p>
        
        <div className="flex justify-between items-center mt-auto pt-4 border-t border-slate-100">
          <span className="text-lg font-black text-emerald-600">
            ${prod.precio.toLocaleString('es-AR')}
          </span>
          <button 
            onClick={handleAddToCart}
            disabled={sinStock}
            title={tieneVariantes ? "Elegir opciones" : "Agregar al carrito"}
            className={`p-2.5 rounded-xl font-bold transition-all duration-300 flex items-center justify-center
              ${sinStock 
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                : agregado 
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 scale-105'
                  : 'bg-slate-900 text-white hover:bg-slate-800 hover:shadow-md'
              }`}
          >
            {agregado ? <Check className="w-5 h-5" /> : (tieneVariantes ? <ListPlus className="w-5 h-5" /> : <ShoppingCart className="w-5 h-5" />)}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
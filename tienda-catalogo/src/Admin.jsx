import { useState, useEffect } from 'react';
import { supabase } from './supabase';
import { Search, Filter, Image as ImageIcon, Lock, LayoutTemplate, UploadCloud, Loader2, X, ChevronLeft, ChevronRight, Package, DollarSign, FileText, Plus, Layers, Calculator, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import imageCompression from 'browser-image-compression';

function Admin() {
  const [categorias, setCategorias] = useState([]);
  const [nuevaCategoria, setNuevaCategoria] = useState("");
  const [editandoCategoriaId, setEditandoCategoriaId] = useState(null);

  const [subcategorias, setSubcategorias] = useState([]);
  const [nuevaSubcategoria, setNuevaSubcategoria] = useState("");
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("");
  const [editandoSubcategoriaId, setEditandoSubcategoriaId] = useState(null);

  const [productos, setProductos] = useState([]);
  const [nombreProd, setNombreProd] = useState("");
  const [descripcionProd, setDescripcionProd] = useState("");
  const [precioProd, setPrecioProd] = useState("");
  const [stockProd, setStockProd] = useState("");
  
  const [imagenesActuales, setImagenesActuales] = useState([]); 
  
  const [subcatSeleccionada, setSubcatSeleccionada] = useState("");
  const [editandoProductoId, setEditandoProductoId] = useState(null);

  const [archivosImagenes, setArchivosImagenes] = useState([]);
  const [subiendo, setSubiendo] = useState(false);

  const [isDragging, setIsDragging] = useState(false);

  const [costoProd, setCostoProd] = useState("");
  const [proveedorProd, setProveedorProd] = useState("");
  const [notasProd, setNotasProd] = useState("");
  const [porEncargue, setPorEncargue] = useState(false);
  const [subcategoriasExtra, setSubcategoriasExtra] = useState([]);

  // VARIANTES
  const [variantesProd, setVariantesProd] = useState([]);
  
  const agregarVariante = () => setVariantesProd([...variantesProd, { nombre: "", stock: "", precio: "" }]);
  const quitarVariante = (index) => setVariantesProd(variantesProd.filter((_, i) => i !== index));
  const actualizarVariante = (index, campo, valor) => {
    const nuevas = [...variantesProd];
    nuevas[index][campo] = valor;
    setVariantesProd(nuevas);
  };

  // CALCULADORA USD
  const [mostrarCalculadora, setMostrarCalculadora] = useState(false);
  const [calcPrecioUsd, setCalcPrecioUsd] = useState("");
  const [calcEnvioPorcentaje, setCalcEnvioPorcentaje] = useState(10);
  const [calcCotizacionUsdt, setCalcCotizacionUsdt] = useState(1630);
  
  const agregarSubcatExtra = () => setSubcategoriasExtra([...subcategoriasExtra, ""]);
  const quitarSubcatExtra = (index) => setSubcategoriasExtra(subcategoriasExtra.filter((_, i) => i !== index));
  const actualizarSubcatExtra = (index, valor) => {
    const nuevas = [...subcategoriasExtra]; nuevas[index] = valor; setSubcategoriasExtra(nuevas);
  };

  const [busquedaProducto, setBusquedaProducto] = useState("");
  const [filtroSubcategoria, setFiltroSubcategoria] = useState("");

  const [colecciones, setColecciones] = useState([]);
  const [tituloCol, setTituloCol] = useState("");
  const [imagenCol, setImagenCol] = useState("");
  const [catColSeleccionada, setCatColSeleccionada] = useState("");
  const [editandoColId, setEditandoColId] = useState(null);

  useEffect(() => {
    obtenerCategorias();
    obtenerSubcategorias();
    obtenerProductos();
    obtenerColecciones();
  }, []);

  const obtenerColecciones = async () => {
    const { data, error } = await supabase.from('colecciones').select('*').order('id', { ascending: true });
    if (!error) setColecciones(data || []);
  };

  const limpiarColeccion = () => {
    setTituloCol(""); setImagenCol(""); setCatColSeleccionada(""); setEditandoColId(null);
  };

  const guardarColeccion = async (e) => {
    e.preventDefault();
    if (!tituloCol.trim() || !imagenCol.trim() || !catColSeleccionada) { alert("Completá todos los campos del banner"); return; }
    const datosCol = { titulo: tituloCol, imagen_url: imagenCol, categoria_id: catColSeleccionada };
    if (editandoColId) await supabase.from('colecciones').update(datosCol).eq('id', editandoColId);
    else await supabase.from('colecciones').insert([datosCol]);
    limpiarColeccion(); obtenerColecciones();
  };

  const eliminarColeccion = async (id) => {
    if (window.confirm("¿Borrar banner?")) { await supabase.from('colecciones').delete().eq('id', id); obtenerColecciones(); }
  };

  const cargarColeccionParaEditar = (col) => {
    setEditandoColId(col.id); setTituloCol(col.titulo); setImagenCol(col.imagen_url); setCatColSeleccionada(col.categoria_id);
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  };

  const obtenerCategorias = async () => {
    const { data } = await supabase.from('categorias').select('*').order('id');
    if (data) { setCategorias(data); if (data.length > 0 && !categoriaSeleccionada) setCategoriaSeleccionada(data[0].id); }
  };

  const limpiarCategoria = () => { setNuevaCategoria(""); setEditandoCategoriaId(null); };

  const guardarCategoria = async (e) => {
    e.preventDefault(); 
    if (!nuevaCategoria.trim()) return;
    if (editandoCategoriaId) await supabase.from('categorias').update({ nombre: nuevaCategoria }).eq('id', editandoCategoriaId);
    else await supabase.from('categorias').insert([{ nombre: nuevaCategoria }]);
    limpiarCategoria(); obtenerCategorias();
  };

  const eliminarCategoria = async (id) => {
    if (window.confirm("¿Seguro?")) {
      const { error } = await supabase.from('categorias').delete().eq('id', id);
      if (error) alert("En uso."); else obtenerCategorias();
    }
  };

  const obtenerSubcategorias = async () => {
    const { data } = await supabase.from('subcategorias').select('*').order('id');
    if (data) { setSubcategorias(data); if (data.length > 0 && !subcatSeleccionada) setSubcatSeleccionada(data[0].id); }
  };

  const limpiarSubcategoria = () => { setNuevaSubcategoria(""); setEditandoSubcategoriaId(null); };

  const guardarSubcategoria = async (e) => {
    e.preventDefault();
    if (!nuevaSubcategoria.trim() || !categoriaSeleccionada) return;
    if (editandoSubcategoriaId) await supabase.from('subcategorias').update({ nombre: nuevaSubcategoria, categoria_id: categoriaSeleccionada }).eq('id', editandoSubcategoriaId);
    else await supabase.from('subcategorias').insert([{ nombre: nuevaSubcategoria, categoria_id: categoriaSeleccionada }]);
    limpiarSubcategoria(); obtenerSubcategorias();
  };

  const eliminarSubcategoria = async (id) => {
    if (window.confirm("¿Borrar?")) { await supabase.from('subcategorias').delete().eq('id', id); obtenerSubcategorias(); }
  };

  const obtenerProductos = async () => {
    const { data } = await supabase.from('productos').select('*').order('id');
    if (data) setProductos(data);
  };

  const limpiarFormularioProd = () => {
    setNombreProd(""); setDescripcionProd(""); setPrecioProd(""); setStockProd("");
    setCostoProd(""); setProveedorProd(""); setNotasProd("");
    setPorEncargue(false); 
    setArchivosImagenes([]); 
    setImagenesActuales([]);
    setEditandoProductoId(null);
    setSubcategoriasExtra([]);
    setVariantesProd([]);
    setCalcPrecioUsd(""); 
  };

  const cargarProductoParaEditar = async (prod) => {
    setEditandoProductoId(prod.id); setNombreProd(prod.nombre); setDescripcionProd(prod.descripcion || "");
    setPrecioProd(prod.precio); setStockProd(prod.stock); setCostoProd(prod.costo || "");
    setProveedorProd(prod.proveedor || ""); setNotasProd(prod.notas_internas || "");
    setPorEncargue(prod.por_encargue || false);

    let imgsParsed = [];
    if (prod.imagen_url) {
      if (Array.isArray(prod.imagen_url)) {
        imgsParsed = [...prod.imagen_url];
      } else if (typeof prod.imagen_url === 'string') {
        try {
          const parsed = JSON.parse(prod.imagen_url);
          imgsParsed = Array.isArray(parsed) ? parsed : [prod.imagen_url];
        } catch (e) {
          imgsParsed = [prod.imagen_url];
        }
      }
    }
    setImagenesActuales(imgsParsed);
    setSubcatSeleccionada(prod.subcategoria_id);
    setArchivosImagenes([]); 
    setSubcategoriasExtra(prod.subcategorias_extra || []);

    const { data: varsData } = await supabase.from('variantes').select('*').eq('producto_id', prod.id);
    if (varsData) {
      setVariantesProd(varsData.map(v => ({ id: v.id, nombre: v.nombre, stock: v.stock, precio: v.precio || "" })));
    } else {
      setVariantesProd([]);
    }
    
    setTimeout(() => {
      document.getElementById('formulario-producto')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const moverImagen = (index, direccion) => {
    const nuevas = [...imagenesActuales];
    if (direccion === -1 && index > 0) {
      [nuevas[index], nuevas[index - 1]] = [nuevas[index - 1], nuevas[index]];
    } else if (direccion === 1 && index < nuevas.length - 1) {
      [nuevas[index], nuevas[index + 1]] = [nuevas[index + 1], nuevas[index]];
    }
    setImagenesActuales(nuevas);
  };

  const eliminarImagenActual = (index) => {
    if (window.confirm("¿Quitar esta foto del producto?")) {
      setImagenesActuales(imagenesActuales.filter((_, i) => i !== index));
    }
  };

  const moverImagenNueva = (index, direccion) => {
    const nuevas = [...archivosImagenes];
    if (direccion === -1 && index > 0) {
      [nuevas[index], nuevas[index - 1]] = [nuevas[index - 1], nuevas[index]];
    } else if (direccion === 1 && index < nuevas.length - 1) {
      [nuevas[index], nuevas[index + 1]] = [nuevas[index + 1], nuevas[index]];
    }
    setArchivosImagenes(nuevas);
  };

  const handleDragOver = (e) => { e.preventDefault(); if (!subiendo) setIsDragging(true); };
  const handleDragLeave = (e) => { e.preventDefault(); setIsDragging(false); };
  const handleDrop = (e) => {
    e.preventDefault(); setIsDragging(false); if (subiendo) return;
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const archivosValidos = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('image/'));
      if (archivosValidos.length > 0) {
        setArchivosImagenes(prev => [...prev, ...archivosValidos]);
      }
    }
  };

  const guardarProducto = async (e) => {
    e.preventDefault();
    
    if (!nombreProd || String(nombreProd).trim() === "") { alert("Error: Te falta escribir el Nombre del Producto."); return; }
    if (!precioProd || String(precioProd).trim() === "") { alert("Error: Te falta ponerle el Precio de venta."); return; }
    if (!subcatSeleccionada || String(subcatSeleccionada).trim() === "") { alert("Error: Te falta seleccionar la Subcategoría."); return; }

    setSubiendo(true); 
    
    try {
      let urlsNuevas = [];

      if (archivosImagenes.length > 0) {
        for (const archivo of archivosImagenes) {
          
          // ======== LÓGICA DE COMPRESIÓN DE IMÁGENES ========
          let archivoASubir = archivo;
          try {
            const opcionesDeCompresion = {
              maxSizeMB: 0.3,          // Tamaño máximo de 300 KB
              maxWidthOrHeight: 1200,  // Redimensionar si es más grande que 1200px
              useWebWorker: true       // Acelera el proceso usando el navegador
            };
            // Comprimimos la imagen
            archivoASubir = await imageCompression(archivo, opcionesDeCompresion);
            console.log(`Imagen comprimida de ${archivo.size / 1024 / 1024} MB a ${archivoASubir.size / 1024 / 1024} MB`);
          } catch (errorCompresion) {
            console.warn("Hubo un error al comprimir, se subirá la imagen original", errorCompresion);
          }
          // ===================================================

          const extension = archivoASubir.name.split('.').pop() || 'jpg';
          const nombreUnico = `${Date.now()}-${Math.random().toString(36).substring(7)}.${extension}`;
          
          const { error: errorSubida } = await supabase.storage.from('productos').upload(nombreUnico, archivoASubir);
          
          if (errorSubida) {
            alert("Error de Supabase al subir la foto: " + errorSubida.message);
            setSubiendo(false);
            return;
          }

          const { data } = supabase.storage.from('productos').getPublicUrl(nombreUnico);
          urlsNuevas.push(data.publicUrl);
        }
      }

      const todasLasFotos = [...imagenesActuales, ...urlsNuevas];
      const imagenFinal = todasLasFotos.length === 0 ? null : todasLasFotos;

      const datosProducto = {
        nombre: nombreProd, descripcion: descripcionProd, precio: parseFloat(precioProd), stock: parseInt(stockProd) || 0,
        imagen_url: imagenFinal, subcategoria_id: subcatSeleccionada, costo: parseFloat(costoProd) || null,
        proveedor: proveedorProd.trim() || null, notas_internas: notasProd.trim() || null,
        por_encargue: porEncargue,
        subcategorias_extra: subcategoriasExtra.filter(s => s !== "") 
      };

      let productoIdFinal = editandoProductoId;

      if (editandoProductoId) {
        const { error } = await supabase.from('productos').update(datosProducto).eq('id', editandoProductoId);
        if (error) { alert("Error al actualizar: " + error.message); setSubiendo(false); return; }
      } else {
        const { data, error } = await supabase.from('productos').insert([datosProducto]).select();
        if (error) { alert("Error al insertar: " + error.message); setSubiendo(false); return; }
        if (data && data.length > 0) productoIdFinal = data[0].id;
      }

      if (productoIdFinal) {
        if (editandoProductoId) {
          await supabase.from('variantes').delete().eq('producto_id', productoIdFinal);
        }
        const variantesValidas = variantesProd.filter(v => v.nombre.trim() !== "");
        if (variantesValidas.length > 0) {
          const payloadVariantes = variantesValidas.map(v => ({
            producto_id: productoIdFinal,
            nombre: v.nombre.trim(),
            stock: parseInt(v.stock) || 0,
            precio: v.precio ? parseFloat(v.precio) : null 
          }));
          const { error: errVars } = await supabase.from('variantes').insert(payloadVariantes);
          if (errVars) alert("El producto se guardó, pero hubo un error al guardar las variantes: " + errVars.message);
        }
      }

      limpiarFormularioProd(); 
      obtenerProductos();
      
    } catch (err) {
      alert("Ocurrió un error inesperado: " + err.message);
    } finally {
      setSubiendo(false); 
    }
  };

  const eliminarProducto = async (id) => {
    if (window.confirm("¿Estás seguro de que querés borrar este producto y sus variantes?")) {
      await supabase.from('variantes').delete().eq('producto_id', id);
      await supabase.from('productos').delete().eq('id', id); 
      obtenerProductos();
    }
  };

  const toggleDestacado = async (id, estadoActual) => {
    const { error } = await supabase
      .from('productos')
      .update({ destacado: !estadoActual })
      .eq('id', id);

    if (error) {
      alert("Hubo un error al actualizar el estado del producto.");
    } else {
      setProductos(productos.map(p => 
        p.id === id ? { ...p, destacado: !estadoActual } : p
      ));
    }
  };

  const obtenerNombreSubcat = (subId) => {
    const sub = subcategorias.find(s => s.id === subId); return sub ? sub.nombre : 'Sin subcategoría';
  };
  const obtenerNombreCategoria = (catId) => {
    const cat = categorias.find(c => String(c.id) === String(catId)); return cat ? cat.nombre : 'N/A';
  };
  const obtenerMiniatura = (imagen_url) => {
    if (!imagen_url) return null;
    if (Array.isArray(imagen_url) && imagen_url.length > 0) return imagen_url[0];
    if (typeof imagen_url === 'string') {
      try { const arr = JSON.parse(imagen_url); if (Array.isArray(arr) && arr.length > 0) return arr[0]; } catch (e) { return imagen_url; }
    } return null;
  };

  const productosFiltrados = productos.filter(prod => {
    const textoBusqueda = busquedaProducto.toLowerCase();
    const nombreValidado = prod.nombre ? String(prod.nombre).toLowerCase() : "";
    const descValidada = prod.descripcion ? String(prod.descripcion).toLowerCase() : "";
    const coincideBusqueda = nombreValidado.includes(textoBusqueda) || descValidada.includes(textoBusqueda);
    const coincideSubcat = filtroSubcategoria === "" || String(prod.subcategoria_id) === String(filtroSubcategoria);
    return coincideBusqueda && coincideSubcat;
  });

  const gananciaCalculada = (parseFloat(precioProd) || 0) - (parseFloat(costoProd) || 0);

  const valorFinalCalculadora = calcPrecioUsd 
    ? (parseFloat(calcPrecioUsd) * (1 + parseFloat(calcEnvioPorcentaje) / 100)) * parseFloat(calcCotizacionUsdt)
    : 0;

  return (
    <div className="p-4 sm:p-8 bg-slate-50 min-h-screen font-sans">
      <h1 className="text-3xl font-black mb-8 text-slate-800 tracking-tight">Panel de Control <span className="text-blue-600">El Manguruyu</span></h1>
      
      {/* 1. SECCIÓN CATEGORÍAS */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-10">
        <div className={`bg-white p-6 rounded-2xl shadow-sm border ${editandoCategoriaId ? 'border-yellow-400' : 'border-slate-200'}`}>
          <h2 className="text-xl font-bold mb-4 text-slate-800 flex items-center gap-2"><LayoutTemplate className="w-5 h-5 text-blue-500"/> Categorías</h2>
          <form onSubmit={guardarCategoria} className="flex gap-2 mb-4">
            <input type="text" placeholder="Ej: Pesca..." value={nuevaCategoria} onChange={(e) => setNuevaCategoria(e.target.value)} className="border border-slate-200 p-2.5 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
            <button type="submit" className={`${editandoCategoriaId ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-slate-800 hover:bg-slate-900'} text-white px-5 py-2.5 rounded-xl font-semibold transition cursor-pointer shrink-0`}>
              {editandoCategoriaId ? "Actualizar" : "Agregar"}
            </button>
            {editandoCategoriaId && <button type="button" onClick={limpiarCategoria} className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-4 py-2.5 rounded-xl font-bold cursor-pointer transition">X</button>}
          </form>
          <ul className="space-y-2 max-h-64 overflow-y-auto pr-2">
            {categorias.map((cat) => (
              <li key={cat.id} className="bg-slate-50 p-3 rounded-xl flex justify-between items-center border border-slate-100">
                <span className="font-semibold text-slate-700 ml-2">{cat.nombre}</span>
                <div className="flex gap-2">
                  <button onClick={() => { setEditandoCategoriaId(cat.id); setNuevaCategoria(cat.nombre); }} className="text-yellow-600 hover:bg-yellow-50 px-3 py-1 text-sm rounded-lg transition font-bold cursor-pointer">Editar</button>
                  <button onClick={() => eliminarCategoria(cat.id)} className="text-red-500 hover:bg-red-50 px-3 py-1 text-sm rounded-lg transition font-bold cursor-pointer">Borrar</button>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className={`bg-white p-6 rounded-2xl shadow-sm border ${editandoSubcategoriaId ? 'border-yellow-400' : 'border-slate-200'}`}>
          <h2 className="text-xl font-bold mb-4 text-slate-800 flex items-center gap-2"><Filter className="w-5 h-5 text-blue-500"/> Subcategorías</h2>
          <form onSubmit={guardarSubcategoria} className="flex flex-col gap-3 mb-4">
            <select value={categoriaSeleccionada} onChange={(e) => setCategoriaSeleccionada(e.target.value)} className="border border-slate-200 p-2.5 rounded-xl w-full bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 cursor-pointer text-slate-700">
              <option value="">Seleccioná categoría madre...</option>
              {categorias.map((cat) => <option key={cat.id} value={cat.id}>{cat.nombre}</option> )}
            </select>
            <div className="flex gap-2">
              <input type="text" placeholder="Ej: Reeles..." value={nuevaSubcategoria} onChange={(e) => setNuevaSubcategoria(e.target.value)} className="border border-slate-200 p-2.5 rounded-xl w-full focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
              <button type="submit" className={`${editandoSubcategoriaId ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-slate-800 hover:bg-slate-900'} text-white px-5 py-2.5 rounded-xl font-semibold transition cursor-pointer shrink-0`}>
                {editandoSubcategoriaId ? "Actualizar" : "Agregar"}
              </button>
              {editandoSubcategoriaId && <button type="button" onClick={limpiarSubcategoria} className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-4 py-2.5 rounded-xl font-bold cursor-pointer transition">X</button>}
            </div>
          </form>
          <div className="space-y-4 max-h-64 overflow-y-auto pr-2">
            {categorias.map(cat => {
              const subsDeEstaCategoria = subcategorias.filter(sub => String(sub.categoria_id) === String(cat.id));
              return (
                <div key={cat.id} className="border border-slate-100 rounded-xl overflow-hidden bg-white shadow-sm">
                  <div className="bg-slate-50 px-4 py-2 border-b border-slate-100 font-bold text-slate-800 text-xs uppercase tracking-wider">{cat.nombre}</div>
                  {subsDeEstaCategoria.length === 0 ? (
                    <div className="p-3 text-sm text-slate-400 italic bg-white pl-4">Sin subcategorías.</div>
                  ) : (
                    <ul className="divide-y divide-slate-50">
                      {subsDeEstaCategoria.map(sub => (
                        <li key={sub.id} className="px-4 py-2 flex justify-between items-center hover:bg-slate-50 transition">
                          <span className="font-semibold text-slate-600 text-sm">{sub.nombre}</span>
                          <div className="flex gap-1">
                            <button onClick={() => { setEditandoSubcategoriaId(sub.id); setNuevaSubcategoria(sub.nombre); setCategoriaSeleccionada(sub.categoria_id); }} className="text-yellow-600 hover:bg-yellow-50 px-2 py-1 text-xs rounded-lg transition font-bold cursor-pointer">Editar</button>
                            <button onClick={() => eliminarSubcategoria(sub.id)} className="text-red-500 hover:bg-red-50 px-2 py-1 text-xs rounded-lg transition font-bold cursor-pointer">Borrar</button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. FORMULARIO DE PRODUCTO */}
      <div id="formulario-producto" className={`p-6 rounded-3xl shadow-sm mb-10 scroll-mt-6 border ${editandoProductoId ? 'bg-yellow-50/50 border-yellow-300' : 'bg-white border-slate-200'}`}>
        <div className="flex justify-between items-center mb-6">
           <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2">
             <Package className="w-6 h-6 text-blue-500"/> 
             {editandoProductoId ? "Editando Producto" : "Nuevo Producto"}
           </h2>
           {editandoProductoId && (
             <span className="bg-yellow-100 text-yellow-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">Modo Edición</span>
           )}
        </div>

        <form onSubmit={guardarProducto} className="relative flex flex-col gap-6">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            <div className="lg:col-span-8 flex flex-col gap-6">
              
              <div className="bg-slate-50/50 p-5 rounded-2xl border border-slate-200">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide mb-4 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-slate-400"/> Información General
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Nombre del Producto *</label>
                    <input type="text" value={nombreProd} onChange={(e) => setNombreProd(e.target.value)} disabled={subiendo} className="border border-slate-200 p-3 rounded-xl w-full text-sm focus:ring-2 focus:ring-blue-500/50 outline-none disabled:opacity-50 bg-white" placeholder="Ej: Reel Shimano FX 4000" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Subcategoría Principal *</label>
                      <select value={subcatSeleccionada} onChange={(e) => setSubcatSeleccionada(e.target.value)} disabled={subiendo} className="border border-slate-200 p-3 rounded-xl w-full bg-white text-sm cursor-pointer focus:ring-2 focus:ring-blue-500/50 outline-none disabled:opacity-50">
                        <option value="">Elegí subcategoría...</option>
                        {categorias.map(cat => {
                          const subsDeEstaCat = subcategorias.filter(sub => String(sub.categoria_id) === String(cat.id));
                          if (subsDeEstaCat.length === 0) return null;
                          return (
                            <optgroup key={cat.id} label={cat.nombre}>
                              {subsDeEstaCat.map(sub => <option key={sub.id} value={sub.id}>{sub.nombre}</option>)}
                            </optgroup>
                          );
                        })}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Categorías Extra (Opcional)</label>
                      <div className="space-y-2">
                        {subcategoriasExtra.map((subExt, index) => (
                          <div key={index} className="flex gap-2">
                            <select value={subExt} onChange={(e) => actualizarSubcatExtra(index, e.target.value)} disabled={subiendo} className="border border-indigo-200 bg-indigo-50 p-2.5 rounded-xl w-full text-sm cursor-pointer focus:ring-2 focus:ring-indigo-500/50 outline-none disabled:opacity-50">
                              <option value="">Elegí extra...</option>
                              {categorias.map(cat => {
                                const subs = subcategorias.filter(sub => String(sub.categoria_id) === String(cat.id));
                                if (subs.length === 0) return null;
                                return (
                                  <optgroup key={cat.id} label={cat.nombre}>
                                    {subs.map(sub => <option key={sub.id} value={sub.id}>{sub.nombre}</option>)}
                                  </optgroup>
                                );
                              })}
                            </select>
                            <button type="button" onClick={() => quitarSubcatExtra(index)} className="bg-slate-100 text-slate-400 px-3 rounded-xl font-bold hover:bg-red-500 hover:text-white transition-colors cursor-pointer" title="Quitar">X</button>
                          </div>
                        ))}
                        <button type="button" onClick={agregarSubcatExtra} disabled={subiendo} className="text-[11px] font-bold text-blue-600 hover:text-blue-800 uppercase tracking-wide cursor-pointer flex items-center gap-1 mt-1">
                          <Plus className="w-3 h-3"/> Agregar a otra categoría
                        </button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Descripción pública (Opcional)</label>
                    <textarea value={descripcionProd} onChange={(e) => setDescripcionProd(e.target.value)} disabled={subiendo} rows="3" className="border border-slate-200 p-3 rounded-xl w-full text-sm focus:ring-2 focus:ring-blue-500/50 outline-none disabled:opacity-50 bg-white resize-none" placeholder="Detalles técnicos, material, usos recomendados..."></textarea>
                  </div>
                </div>
              </div>

              {/* Tarjeta: Variantes de Producto */}
              <div className="bg-slate-50/50 p-5 rounded-2xl border border-slate-200">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2">
                    <Layers className="w-4 h-4 text-blue-500"/> Variantes (Con precios individuales)
                  </h3>
                  <button type="button" onClick={agregarVariante} disabled={subiendo} className="bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 shadow-sm">
                    <Plus className="w-3.5 h-3.5"/> Agregar Variante
                  </button>
                </div>
                
                {variantesProd.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">Este producto no tiene variantes configuradas (se venderá con el stock general).</p>
                ) : (
                  <div className="space-y-3">
                    {variantesProd.map((v, index) => (
                      <div key={index} className="flex flex-wrap md:flex-nowrap gap-3 items-center bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                        <div className="flex-1 min-w-[150px]">
                          <input type="text" placeholder="Ej: Anzuelo N°10" value={v.nombre} onChange={(e) => actualizarVariante(index, 'nombre', e.target.value)} disabled={subiendo} className="border border-slate-200 p-2 rounded-lg w-full text-xs outline-none focus:ring-2 focus:ring-blue-500/50" />
                        </div>
                        <div className="w-24">
                          <input type="number" placeholder="Stock" value={v.stock} onChange={(e) => actualizarVariante(index, 'stock', e.target.value)} disabled={subiendo} className="border border-slate-200 p-2 rounded-lg w-full text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/50" />
                        </div>
                        <div className="w-32">
                          <input type="number" placeholder="Precio ($)" value={v.precio} onChange={(e) => actualizarVariante(index, 'precio', e.target.value)} disabled={subiendo} className="border border-slate-200 p-2 rounded-lg w-full text-xs font-bold text-emerald-600 outline-none focus:ring-2 focus:ring-blue-500/50" title="Dejar vacío si vale igual que el producto base" />
                        </div>
                        <button type="button" onClick={() => quitarVariante(index)} className="bg-red-50 text-red-500 hover:bg-red-500 hover:text-white p-2 rounded-lg transition-colors cursor-pointer" title="Eliminar variante">
                          <X className="w-4 h-4"/>
                        </button>
                      </div>
                    ))}
                    <p className="text-[10px] text-slate-400 mt-2">Si dejas el <b>Precio</b> de la variante vacío, cobrará el precio general de venta.</p>
                  </div>
                )}
              </div>

              {/* Tarjeta: Fotos / Drag & Drop */}
              <div className="bg-slate-50/50 p-5 rounded-2xl border border-slate-200">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide mb-4 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-slate-400"/> Galería de Imágenes
                </h3>
                
                {imagenesActuales.length > 0 && (
                  <div className="mb-4">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Fotos guardadas:</label>
                    <div className="flex gap-3 overflow-x-auto pb-2">
                      {imagenesActuales.map((url, i) => (
                        <div key={i} className="relative w-24 h-24 shrink-0 rounded-xl overflow-hidden border border-slate-200 group bg-white shadow-sm">
                          <img src={url} alt={`foto-${i}`} className="w-full h-full object-cover mix-blend-multiply" />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-1.5">
                            <button type="button" onClick={() => eliminarImagenActual(i)} className="self-end bg-red-500 hover:bg-red-600 text-white rounded-full p-1 shadow-sm transition-colors cursor-pointer" title="Borrar foto"><X className="w-3 h-3"/></button>
                            <div className="flex justify-between mt-auto">
                              <button type="button" onClick={() => moverImagen(i, -1)} disabled={i === 0} className="bg-white/90 hover:bg-white p-1 rounded-md disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer shadow-sm transition-colors"><ChevronLeft className="w-4 h-4 text-slate-800"/></button>
                              {i === 0 && <span className="text-[8px] font-black text-white bg-blue-600 px-1 rounded self-center">PORTADA</span>}
                              <button type="button" onClick={() => moverImagen(i, 1)} disabled={i === imagenesActuales.length - 1} className="bg-white/90 hover:bg-white p-1 rounded-md disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer shadow-sm transition-colors"><ChevronRight className="w-4 h-4 text-slate-800"/></button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <label
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`flex flex-col items-center justify-center w-full h-32 px-4 transition-all duration-300 border-2 border-dashed rounded-xl cursor-pointer ${
                    isDragging ? 'border-blue-500 bg-blue-50 shadow-inner' : 'border-slate-300 bg-white hover:bg-slate-50 hover:border-slate-400'
                  } ${subiendo ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className="flex flex-col items-center justify-center pointer-events-none">
                    <UploadCloud className={`w-8 h-8 mb-2 transition-colors ${isDragging ? 'text-blue-600' : 'text-slate-400'}`} />
                    <p className="mb-1 text-sm font-bold text-slate-600 text-center">
                      {isDragging ? '¡Soltá las fotos acá!' : 'Arrastrá fotos o hacé clic para subir'}
                    </p>
                    <p className="text-xs text-slate-400">JPG, PNG o WEBP</p>
                  </div>
                  <input type="file" multiple accept="image/*" disabled={subiendo} onChange={(e) => { if (e.target.files && e.target.files.length > 0) { setArchivosImagenes(prev => [...prev, ...Array.from(e.target.files)]); } }} className="hidden" />
                </label>

                {archivosImagenes.length > 0 && (
                  <div className="mt-4 p-4 bg-emerald-50/50 rounded-xl border border-emerald-100">
                    <label className="block text-xs font-bold text-emerald-700 uppercase tracking-wide mb-2">Fotos nuevas listas para subir:</label>
                    <div className="flex gap-3 overflow-x-auto pb-1">
                      {archivosImagenes.map((file, i) => (
                        <div key={`new-${i}`} className="relative w-24 h-24 shrink-0 rounded-xl overflow-hidden border border-emerald-200 group bg-white shadow-sm">
                          <img src={URL.createObjectURL(file)} alt={`nueva-${i}`} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-1.5">
                            <button type="button" onClick={(e) => { e.preventDefault(); setArchivosImagenes(archivosImagenes.filter((_, index) => index !== i)); }} className="self-end bg-red-500 hover:bg-red-600 text-white rounded-full p-1 shadow-sm transition-colors cursor-pointer"><X className="w-3 h-3"/></button>
                            <div className="flex justify-between mt-auto">
                              <button type="button" onClick={(e) => { e.preventDefault(); moverImagenNueva(i, -1); }} disabled={i === 0} className="bg-white/90 hover:bg-white p-1 rounded-md disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer shadow-sm transition-colors"><ChevronLeft className="w-4 h-4 text-slate-800"/></button>
                              {(i === 0 && imagenesActuales.length === 0) && <span className="text-[8px] font-black text-white bg-blue-600 px-1 rounded self-center">PORTADA</span>}
                              <button type="button" onClick={(e) => { e.preventDefault(); moverImagenNueva(i, 1); }} disabled={i === archivosImagenes.length - 1} className="bg-white/90 hover:bg-white p-1 rounded-md disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer shadow-sm transition-colors"><ChevronRight className="w-4 h-4 text-slate-800"/></button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* --- COLUMNA DERECHA: FINANZAS Y LOGÍSTICA (4 columnas) --- */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              
              {/* Tarjeta: Precios */}
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide mb-4 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-emerald-500"/> Precios y Rentabilidad
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Precio de Venta *</label>
                    <div className="relative">
                      <span className="absolute left-3 top-3 font-bold text-slate-400">$</span>
                      <input type="number" value={precioProd} onChange={(e) => setPrecioProd(e.target.value)} disabled={subiendo} className="border border-slate-200 p-3 pl-8 rounded-xl w-full text-base font-bold text-emerald-600 focus:ring-2 focus:ring-emerald-500/50 outline-none disabled:opacity-50" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-indigo-500 uppercase tracking-wide mb-1.5 flex items-center gap-1"><Lock className="w-3 h-3"/> Costo de Compra</label>
                    <div className="relative">
                      <span className="absolute left-3 top-3 font-bold text-indigo-300">$</span>
                      <input type="number" value={costoProd} onChange={(e) => setCostoProd(e.target.value)} disabled={subiendo} className="border border-indigo-100 bg-indigo-50/30 p-3 pl-8 rounded-xl w-full text-sm font-semibold text-indigo-700 focus:ring-2 focus:ring-indigo-500/50 outline-none disabled:opacity-50" placeholder="Ej: 5000" />
                    </div>
                  </div>
                  <div className="pt-3 pb-2 border-t border-slate-100 flex justify-between items-center">
                     <span className="text-xs font-bold text-slate-400 uppercase">Ganancia x Unidad:</span>
                     <span className={`px-3 py-1 rounded-lg text-sm font-black ${gananciaCalculada > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                       ${gananciaCalculada.toLocaleString('es-AR')}
                     </span>
                  </div>

                  {/* CALCULADORA USD ACORDEÓN */}
                  <div className="pt-2 border-t border-slate-100">
                    <button 
                      type="button" 
                      onClick={() => setMostrarCalculadora(!mostrarCalculadora)}
                      className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer transition-colors w-full justify-between"
                    >
                      <span className="flex items-center gap-1"><Calculator className="w-3.5 h-3.5"/> Calculadora Importación (USD)</span>
                      <ChevronDown className={`w-3.5 h-3.5 transition-transform ${mostrarCalculadora ? 'rotate-180' : ''}`} />
                    </button>
                    
                    <AnimatePresence>
                      {mostrarCalculadora && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }} 
                          animate={{ height: "auto", opacity: 1 }} 
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden mt-3"
                        >
                          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-3">
                             <div className="grid grid-cols-2 gap-3">
                               <div className="col-span-2">
                                 <label className="block text-[10px] font-bold text-slate-500 uppercase">Costo Original (USD)</label>
                                 <input type="number" value={calcPrecioUsd} onChange={e=>setCalcPrecioUsd(e.target.value)} className="w-full p-2 mt-1 text-xs border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" placeholder="Ej: 50" />
                               </div>
                               <div>
                                 <label className="block text-[10px] font-bold text-slate-500 uppercase">Envío (%)</label>
                                 <input type="number" value={calcEnvioPorcentaje} onChange={e=>setCalcEnvioPorcentaje(e.target.value)} className="w-full p-2 mt-1 text-xs border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
                               </div>
                               <div>
                                 <label className="block text-[10px] font-bold text-slate-500 uppercase">Cotización (USDT)</label>
                                 <input type="number" value={calcCotizacionUsdt} onChange={e=>setCalcCotizacionUsdt(e.target.value)} className="w-full p-2 mt-1 text-xs border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" />
                               </div>
                             </div>
                             
                             <div className="pt-2 border-t border-slate-200/60 flex flex-col items-center">
                                <span className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Precio Final Sugerido (ARS)</span>
                                <span className="text-xl font-black text-emerald-600">${valorFinalCalculadora.toLocaleString('es-AR', {maximumFractionDigits: 0})}</span>
                             </div>

                             <div className="flex gap-2 pt-2">
                               <button 
                                 type="button" 
                                 onClick={() => setPrecioProd(Math.round(valorFinalCalculadora))}
                                 disabled={!calcPrecioUsd}
                                 className="w-full bg-blue-600 text-white text-xs font-bold py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
                               >
                                 Usar en Venta
                               </button>
                               <button 
                                 type="button" 
                                 onClick={() => setCostoProd(Math.round(valorFinalCalculadora))}
                                 disabled={!calcPrecioUsd}
                                 className="w-full bg-indigo-500 text-white text-xs font-bold py-2 rounded-lg hover:bg-indigo-600 disabled:opacity-50 cursor-pointer"
                               >
                                 Usar en Costo
                               </button>
                             </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>

              {/* Tarjeta: Inventario */}
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide mb-4 flex items-center gap-2">
                  <Package className="w-4 h-4 text-orange-400"/> Inventario
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Stock Físico (General)</label>
                    <input type="number" value={stockProd} onChange={(e) => setStockProd(e.target.value)} disabled={subiendo} className="border border-slate-200 p-3 rounded-xl w-full text-base font-bold focus:ring-2 focus:ring-blue-500/50 outline-none disabled:opacity-50" />
                    <p className="text-[10px] text-slate-400 mt-1">Si usas variantes, este número es opcional.</p>
                  </div>
                  <div className="pt-2">
                     <label className="relative inline-flex items-center cursor-pointer disabled:opacity-50">
                      <input type="checkbox" checked={porEncargue} onChange={(e) => setPorEncargue(e.target.checked)} disabled={subiendo} className="sr-only peer" />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                      <span className="ml-3 text-sm font-bold text-slate-700">Permitir venta "Por encargo" (Sin stock)</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Tarjeta: Privado */}
              <div className="bg-indigo-50/50 p-5 rounded-2xl border border-indigo-100">
                <h3 className="text-sm font-bold text-indigo-800 uppercase tracking-wide mb-4 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-indigo-500"/> Datos Internos
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-indigo-600/70 uppercase tracking-wide mb-1.5">Proveedor / Marca</label>
                    <input type="text" value={proveedorProd} onChange={(e) => setProveedorProd(e.target.value)} disabled={subiendo} className="border border-indigo-100 p-2.5 rounded-xl w-full text-sm bg-white focus:ring-2 focus:ring-indigo-500/50 outline-none disabled:opacity-50" placeholder="Ej: Mayorista Juan" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-indigo-600/70 uppercase tracking-wide mb-1.5">Notas Privadas</label>
                    <textarea value={notasProd} onChange={(e) => setNotasProd(e.target.value)} disabled={subiendo} rows="2" className="border border-indigo-100 p-2.5 rounded-xl w-full text-sm bg-white focus:ring-2 focus:ring-indigo-500/50 outline-none disabled:opacity-50 resize-none" placeholder="Ej: Tarda 5 días en reponer..."></textarea>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* BOTONERA INFERIOR */}
          <div className="mt-2 flex flex-col md:flex-row gap-4 justify-end pt-6 border-t border-slate-200">
              {editandoProductoId && (
                <button type="button" onClick={limpiarFormularioProd} disabled={subiendo} className="bg-slate-100 text-slate-600 px-6 py-3 rounded-xl font-bold hover:bg-slate-200 cursor-pointer transition w-full md:w-auto disabled:opacity-50">
                  Cancelar Edición
                </button>
              )}
              <button 
                type="submit" 
                disabled={subiendo}
                className={`${editandoProductoId ? 'bg-yellow-500 hover:bg-yellow-600 text-slate-900' : 'bg-blue-600 hover:bg-blue-700 text-white'} px-8 py-3 rounded-xl font-black cursor-pointer transition shadow-md w-full md:w-auto disabled:opacity-70 disabled:cursor-wait flex items-center justify-center gap-2`}
              >
                {subiendo ? <><Loader2 className="w-5 h-5 animate-spin" /> Procesando...</> : (editandoProductoId ? "Guardar Cambios" : "Cargar Producto a la Tienda")}
              </button>
          </div>
        </form>
      </div>

      {/* 3. SECCIÓN STOCK */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 mb-10">
        <div className="flex flex-col md:flex-row justify-between items-end gap-4 mb-6">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2"><Package className="w-5 h-5 text-blue-500"/> Inventario ({productosFiltrados.length})</h2>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div className="relative group">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400 group-focus-within:text-blue-500" />
              <input 
                type="text" placeholder="Buscar producto..." value={busquedaProducto} onChange={(e) => setBusquedaProducto(e.target.value)}
                className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 w-full sm:w-64"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <select 
                value={filtroSubcategoria} onChange={(e) => setFiltroSubcategoria(e.target.value)}
                className="pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 cursor-pointer appearance-none w-full sm:w-auto"
              >
                <option value="">Todas las subcategorías</option>
                {categorias.map(cat => {
                  const subsDeEstaCat = subcategorias.filter(sub => String(sub.categoria_id) === String(cat.id));
                  if (subsDeEstaCat.length === 0) return null;
                  return (
                    <optgroup key={cat.id} label={cat.nombre}>
                      {subsDeEstaCat.map(sub => (
                        <option key={sub.id} value={sub.id}>{sub.nombre}</option>
                      ))}
                    </optgroup>
                  );
                })}
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left border-collapse bg-white">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs text-slate-500 uppercase tracking-wider">
                <th className="p-4 w-16">Foto</th>
                <th className="p-4">Producto</th>
                <th className="p-4 hidden sm:table-cell">Subcategoría</th>
                <th className="p-4 hidden md:table-cell text-indigo-500" title="Información Interna"><Lock className="w-3 h-3 inline mr-1"/>Costo</th>
                <th className="p-4">Precio (Público)</th>
                <th className="p-4">Stock</th>
                <th className="p-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {productosFiltrados.length === 0 ? (
                <tr><td colSpan="7" className="p-8 text-center text-slate-400">No se encontraron productos.</td></tr>
              ) : (
                productosFiltrados.map((prod) => {
                  const miniatura = obtenerMiniatura(prod.imagen_url);
                  return (
                    <tr key={prod.id} className="hover:bg-slate-50/50 transition group">
                      <td className="p-3">
                        <div className="w-12 h-12 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center flex-shrink-0">
                          {miniatura ? <img src={miniatura} alt={prod.nombre} className="w-full h-full object-cover mix-blend-multiply" /> : <ImageIcon className="w-5 h-5 text-slate-300" />}
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="font-bold text-slate-800 line-clamp-2 leading-tight">{prod.nombre}</div>
                        <div className="flex items-center gap-2 mt-1">
                          {prod.proveedor && <span className="text-[10px] text-indigo-500 font-bold uppercase flex items-center gap-1"><Lock className="w-3 h-3"/> {prod.proveedor}</span>}
                          {prod.por_encargue && <span className="text-[10px] text-orange-500 bg-orange-50 px-1.5 rounded font-bold uppercase">Por Encargue</span>}
                        </div>
                      </td>
                      <td className="p-3 hidden sm:table-cell text-sm text-blue-600 font-medium">{obtenerNombreSubcat(prod.subcategoria_id)}</td>
                      <td className="p-3 hidden md:table-cell font-bold text-indigo-400">${prod.costo ? prod.costo.toLocaleString('es-AR') : '-'}</td>
                      <td className="p-3 font-black text-emerald-600">${prod.precio.toLocaleString('es-AR')}</td>
                      <td className="p-3">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-black ${prod.stock > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                          {prod.stock}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="flex gap-2 justify-end opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                          <button onClick={() => cargarProductoParaEditar(prod)} className="bg-yellow-50 text-yellow-600 hover:bg-yellow-500 hover:text-white px-3 py-1.5 rounded-lg text-sm font-bold cursor-pointer transition">Editar</button>
                          <button onClick={() => eliminarProducto(prod.id)} className="bg-red-50 text-red-500 hover:bg-red-500 hover:text-white px-3 py-1.5 rounded-lg text-sm font-bold cursor-pointer transition">Borrar</button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. BANNERS */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 mb-10">
        <h2 className="text-xl font-bold mb-6 text-slate-800 flex items-center gap-2">
          <LayoutTemplate className="w-5 h-5 text-indigo-500" />
          Banners de Colecciones
        </h2>
        <form onSubmit={guardarColeccion} className={`mb-8 p-5 rounded-2xl border ${editandoColId ? 'bg-yellow-50 border-yellow-300' : 'bg-slate-50 border-slate-200'} grid grid-cols-1 md:grid-cols-3 gap-4`}>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Título del Banner:</label>
            <input type="text" value={tituloCol} onChange={(e) => setTituloCol(e.target.value)} placeholder="Ej: REMERAS DE VERANO" className="border border-slate-200 p-2.5 rounded-xl w-full text-sm focus:ring-2 focus:ring-indigo-500/50 outline-none" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Categoría destino:</label>
            <select value={catColSeleccionada} onChange={(e) => setCatColSeleccionada(e.target.value)} className="border border-slate-200 p-2.5 rounded-xl w-full bg-white text-sm cursor-pointer focus:ring-2 focus:ring-indigo-500/50 outline-none">
              <option value="">Elegí categoría padre...</option>
              {categorias.map((cat) => <option key={cat.id} value={cat.id}>{cat.nombre}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Link de Imagen:</label>
            <input type="text" value={imagenCol} onChange={(e) => setImagenCol(e.target.value)} placeholder="Link web de imagen" className="border border-slate-200 p-2.5 rounded-xl w-full text-sm focus:ring-2 focus:ring-indigo-500/50 outline-none" />
          </div>
          <div className="md:col-span-3 flex justify-end gap-3 mt-2">
            {editandoColId && <button type="button" onClick={limpiarColeccion} className="bg-slate-200 text-slate-700 px-6 py-2.5 rounded-xl font-bold hover:bg-slate-300 cursor-pointer transition">Cancelar</button>}
            <button type="submit" className={`${editandoColId ? 'bg-yellow-500 hover:bg-yellow-600 text-slate-900' : 'bg-indigo-600 hover:bg-indigo-700 text-white'} px-8 py-2.5 rounded-xl font-black cursor-pointer transition shadow-md`}>
              {editandoColId ? "Actualizar Banner" : "Agregar Banner"}
            </button>
          </div>
        </form>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {colecciones.length === 0 ? (
            <div className="col-span-full p-8 text-center text-slate-400 border border-dashed border-slate-200 rounded-2xl">
              No hay banners cargados.
            </div>
          ) : (
            colecciones.map(col => (
              <div key={col.id} className="relative rounded-2xl overflow-hidden shadow-sm border border-slate-100 group h-40">
                <img src={col.imagen_url} alt={col.titulo} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute inset-0 bg-slate-900/50"></div>
                <div className="absolute inset-0 p-4 flex flex-col justify-between">
                  <span className="text-white font-black text-lg drop-shadow-md">{col.titulo}</span>
                  <span className="text-white/90 text-[10px] font-bold bg-slate-900/60 backdrop-blur-sm px-2 py-1 rounded-md w-fit uppercase tracking-wider">Apunta a: {obtenerNombreCategoria(col.categoria_id)}</span>
                  <div className="flex gap-2 justify-end mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => cargarColeccionParaEditar(col)} className="bg-yellow-500 text-slate-900 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-yellow-400 cursor-pointer shadow-sm">Editar</button>
                    <button onClick={() => eliminarColeccion(col.id)} className="bg-red-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-red-400 cursor-pointer shadow-sm">Borrar</button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 5. GESTIÓN DE PRODUCTOS DESTACADOS */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200">
        <h2 className="text-xl sm:text-2xl font-black text-slate-800 mb-6 flex items-center gap-3">
          <span className="bg-blue-100 text-blue-600 p-2 rounded-xl">★</span>
          Gestionar Carrusel de Destacados
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {productos.map(prod => (
            <div key={`admin-dest-${prod.id}`} className="flex items-center justify-between p-3 border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors">
              <span className="text-sm font-medium text-slate-700 truncate pr-3" title={prod.nombre}>
                {prod.nombre}
              </span>
              <button
                onClick={() => toggleDestacado(prod.id, prod.destacado)}
                className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  prod.destacado 
                    ? 'bg-blue-100 text-blue-700 border border-blue-200 hover:bg-blue-200 shadow-sm' 
                    : 'bg-slate-100 text-slate-500 border border-transparent hover:bg-slate-200'
                }`}
              >
                {prod.destacado ? '★ Activo' : 'Normal'}
              </button>
            </div>
          ))}
        </div>
      </div>
      
    </div>
  );
}

export default Admin;
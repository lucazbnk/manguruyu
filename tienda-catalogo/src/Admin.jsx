import { useState, useEffect } from 'react';
import { supabase } from './supabase';
import { Search, Filter, Image as ImageIcon, Lock, LayoutTemplate, UploadCloud, Loader2 } from 'lucide-react';

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
  const [imagenProd, setImagenProd] = useState(""); 
  const [subcatSeleccionada, setSubcatSeleccionada] = useState("");
  const [editandoProductoId, setEditandoProductoId] = useState(null);

  const [archivosImagenes, setArchivosImagenes] = useState([]);
  const [subiendo, setSubiendo] = useState(false);

  const [costoProd, setCostoProd] = useState("");
  const [proveedorProd, setProveedorProd] = useState("");
  const [notasProd, setNotasProd] = useState("");
  const [porEncargue, setPorEncargue] = useState(false);
  const [subcategoriasExtra, setSubcategoriasExtra] = useState([]);
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
    // ACÁ ESTABA EL ERROR: Agregamos order('id')
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
    // ACÁ ESTABA EL ERROR: Agregamos order('id')
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
    // ACÁ ESTABA EL ERROR: Agregamos order('id')
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
    // ACÁ ESTABA EL ERROR: Agregamos order('id')
    const { data } = await supabase.from('productos').select('*').order('id');
    if (data) setProductos(data);
  };

  const limpiarFormularioProd = () => {
    setNombreProd(""); setDescripcionProd(""); setPrecioProd(""); setStockProd("");
    setImagenProd(""); setCostoProd(""); setProveedorProd(""); setNotasProd("");
    setPorEncargue(false); 
    setArchivosImagenes([]); 
    setEditandoProductoId(null);
    setSubcategoriasExtra([]);
  };

  const cargarProductoParaEditar = (prod) => {
    setEditandoProductoId(prod.id); setNombreProd(prod.nombre); setDescripcionProd(prod.descripcion || "");
    setPrecioProd(prod.precio); setStockProd(prod.stock); setCostoProd(prod.costo || "");
    setProveedorProd(prod.proveedor || ""); setNotasProd(prod.notas_internas || "");
    setPorEncargue(prod.por_encargue || false);

    let imgParaMostrar = prod.imagen_url || "";
    if (Array.isArray(prod.imagen_url)) {
      imgParaMostrar = prod.imagen_url.length === 1 ? prod.imagen_url[0] : JSON.stringify(prod.imagen_url);
    }
    setImagenProd(imgParaMostrar);
    setSubcatSeleccionada(prod.subcategoria_id);
    setArchivosImagenes([]); 
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setSubcategoriasExtra(prod.subcategorias_extra || []);
  };

  const guardarProducto = async (e) => {
    e.preventDefault();
    
    // MEJORÉ LA ALERTA PARA QUE TE DIGA EXACTAMENTE QUÉ CAMPO FALLÓ
    if (!nombreProd || String(nombreProd).trim() === "") { alert("Error: Te falta escribir el Nombre del Producto."); return; }
    if (!precioProd || String(precioProd).trim() === "") { alert("Error: Te falta ponerle el Precio de venta."); return; }
    if (!subcatSeleccionada || String(subcatSeleccionada).trim() === "") { alert("Error: Te falta seleccionar la Subcategoría. (Asegurate de que las categorías hayan cargado)."); return; }

    setSubiendo(true); 
    
    try {
      let urlsNuevas = [];

      if (archivosImagenes.length > 0) {
        for (const archivo of archivosImagenes) {
          const extension = archivo.name.split('.').pop();
          const nombreUnico = `${Date.now()}-${Math.random().toString(36).substring(7)}.${extension}`;
          
          const { error: errorSubida } = await supabase.storage.from('productos').upload(nombreUnico, archivo);
          
          if (errorSubida) {
            alert("Error de Supabase al subir la foto: " + errorSubida.message);
            setSubiendo(false);
            return;
          }

          const { data } = supabase.storage.from('productos').getPublicUrl(nombreUnico);
          urlsNuevas.push(data.publicUrl);
        }
      }

      let urlsViejasManuales = [];
      let manual = imagenProd.trim();
      if (manual !== "") {
        if (manual.startsWith('[') && manual.endsWith(']')) {
          try { urlsViejasManuales = JSON.parse(manual); } 
          catch (error) { alert("El formato del texto de la imagen vieja es inválido."); setSubiendo(false); return; }
        } else {
          urlsViejasManuales = [manual];
        }
      }

      const todasLasFotos = [...urlsNuevas, ...urlsViejasManuales];
      const imagenFinal = todasLasFotos.length === 0 ? null : todasLasFotos;

      const datosProducto = {
        nombre: nombreProd, descripcion: descripcionProd, precio: parseFloat(precioProd), stock: parseInt(stockProd) || 0,
        imagen_url: imagenFinal, subcategoria_id: subcatSeleccionada, costo: parseFloat(costoProd) || null,
        proveedor: proveedorProd.trim() || null, notas_internas: notasProd.trim() || null,
        por_encargue: porEncargue,
        subcategorias_extra: subcategoriasExtra.filter(s => s !== "") // Se guarda la lista limpia sin vacíos
      };

      let dbError;
      if (editandoProductoId) {
        const { error } = await supabase.from('productos').update(datosProducto).eq('id', editandoProductoId);
        dbError = error;
      } else {
        const { error } = await supabase.from('productos').insert([datosProducto]);
        dbError = error;
      }
      
      if (dbError) {
        alert("Error al guardar la información del producto: " + dbError.message);
        setSubiendo(false);
        return;
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
    if (window.confirm("¿Estás seguro de que querés borrar este producto?")) {
      await supabase.from('productos').delete().eq('id', id); obtenerProductos();
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

  return (
    <div className="p-4 sm:p-8 bg-gray-50 min-h-screen font-sans">
      <h1 className="text-3xl font-black mb-6 text-gray-800 tracking-tight">Panel de Control <span className="text-blue-600">El Manguruyu</span></h1>
      
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
        <div className={`bg-white p-6 rounded-2xl shadow-sm border ${editandoCategoriaId ? 'border-yellow-400' : 'border-gray-100'}`}>
          <h2 className="text-xl font-bold mb-4 text-gray-700">Gestión de Categorías</h2>
          <form onSubmit={guardarCategoria} className="flex gap-2 mb-4">
            <input type="text" placeholder="Ej: Pesca..." value={nuevaCategoria} onChange={(e) => setNuevaCategoria(e.target.value)} className="border border-gray-200 p-2.5 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
            <button type="submit" className={`${editandoCategoriaId ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-blue-600 hover:bg-blue-700'} text-white px-5 py-2.5 rounded-lg font-semibold transition cursor-pointer`}>
              {editandoCategoriaId ? "Actualizar" : "Agregar"}
            </button>
            {editandoCategoriaId && <button type="button" onClick={limpiarCategoria} className="bg-gray-200 hover:bg-gray-300 text-gray-600 px-4 py-2.5 rounded-lg font-bold cursor-pointer">X</button>}
          </form>
          <ul className="space-y-2 max-h-64 overflow-y-auto pr-2">
            {categorias.map((cat) => (
              <li key={cat.id} className="bg-gray-50 p-3 rounded-xl flex justify-between items-center border border-gray-100">
                <span className="font-semibold text-gray-700 ml-2">{cat.nombre}</span>
                <div className="flex gap-2">
                  <button onClick={() => { setEditandoCategoriaId(cat.id); setNuevaCategoria(cat.nombre); }} className="text-yellow-600 hover:bg-yellow-50 px-3 py-1 text-sm rounded-lg transition font-bold cursor-pointer">Editar</button>
                  <button onClick={() => eliminarCategoria(cat.id)} className="text-red-500 hover:bg-red-50 px-3 py-1 text-sm rounded-lg transition font-bold cursor-pointer">Borrar</button>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className={`bg-white p-6 rounded-2xl shadow-sm border ${editandoSubcategoriaId ? 'border-yellow-400' : 'border-gray-100'}`}>
          <h2 className="text-xl font-bold mb-4 text-gray-700">Gestión de Subcategorías</h2>
          <form onSubmit={guardarSubcategoria} className="flex flex-col gap-3 mb-4">
            <select value={categoriaSeleccionada} onChange={(e) => setCategoriaSeleccionada(e.target.value)} className="border border-gray-200 p-2.5 rounded-lg w-full bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 cursor-pointer">
              <option value="">Seleccioná categoría madre...</option>
              {categorias.map((cat) => <option key={cat.id} value={cat.id}>{cat.nombre}</option> )}
            </select>
            <div className="flex gap-2">
              <input type="text" placeholder="Ej: Reeles..." value={nuevaSubcategoria} onChange={(e) => setNuevaSubcategoria(e.target.value)} className="border border-gray-200 p-2.5 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
              <button type="submit" className={`${editandoSubcategoriaId ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-blue-600 hover:bg-blue-700'} text-white px-5 py-2.5 rounded-lg font-semibold transition cursor-pointer`}>
                {editandoSubcategoriaId ? "Actualizar" : "Agregar"}
              </button>
              {editandoSubcategoriaId && <button type="button" onClick={limpiarSubcategoria} className="bg-gray-200 hover:bg-gray-300 text-gray-600 px-4 py-2.5 rounded-lg font-bold cursor-pointer">X</button>}
            </div>
          </form>
          <div className="space-y-4 max-h-64 overflow-y-auto pr-2">
            {categorias.map(cat => {
              const subsDeEstaCategoria = subcategorias.filter(sub => String(sub.categoria_id) === String(cat.id));
              return (
                <div key={cat.id} className="border border-gray-100 rounded-xl overflow-hidden bg-white shadow-sm">
                  <div className="bg-blue-50/50 px-4 py-2 border-b border-gray-100 font-bold text-blue-800 text-xs uppercase tracking-wider">{cat.nombre}</div>
                  {subsDeEstaCategoria.length === 0 ? (
                    <div className="p-3 text-sm text-gray-400 italic bg-white pl-4">Sin subcategorías.</div>
                  ) : (
                    <ul className="divide-y divide-gray-50">
                      {subsDeEstaCategoria.map(sub => (
                        <li key={sub.id} className="px-4 py-2 flex justify-between items-center hover:bg-gray-50 transition">
                          <span className="font-semibold text-gray-600 text-sm">{sub.nombre}</span>
                          <div className="flex gap-1">
                            <button onClick={() => { setEditandoSubcategoriaId(sub.id); setNuevaSubcategoria(sub.nombre); setCategoriaSeleccionada(sub.categoria_id); }} className="text-yellow-600 hover:bg-yellow-50 px-2 py-1 text-xs rounded transition font-bold cursor-pointer">Editar</button>
                            <button onClick={() => eliminarSubcategoria(sub.id)} className="text-red-500 hover:bg-red-50 px-2 py-1 text-xs rounded transition font-bold cursor-pointer">Borrar</button>
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

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8">
        <h2 className="text-xl font-bold mb-4 text-gray-700 flex items-center gap-2">Agregar o Editar Producto</h2>
        <form onSubmit={guardarProducto} className={`mb-10 p-5 rounded-2xl border ${editandoProductoId ? 'bg-yellow-50/30 border-yellow-300' : 'bg-gray-50 border-gray-200'}`}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Subcategoría Principal:</label>
              <select value={subcatSeleccionada} onChange={(e) => setSubcatSeleccionada(e.target.value)} disabled={subiendo} className="border border-gray-200 p-2.5 rounded-xl w-full bg-white text-sm cursor-pointer focus:ring-2 focus:ring-blue-500/50 outline-none disabled:opacity-50">
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

              {/* MAGIA: Acá aparecen los selectores extra si el usuario los pide */}
              {subcategoriasExtra.map((subExt, index) => (
                <div key={index} className="flex gap-2 mt-2">
                  <select value={subExt} onChange={(e) => actualizarSubcatExtra(index, e.target.value)} disabled={subiendo} className="border border-indigo-200 bg-indigo-50/30 p-2 rounded-xl w-full text-sm cursor-pointer focus:ring-2 focus:ring-indigo-500/50 outline-none disabled:opacity-50">
                    <option value="">Elegí categoría extra...</option>
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
                  <button type="button" onClick={() => quitarSubcatExtra(index)} className="bg-red-50 text-red-500 px-3 rounded-xl font-bold hover:bg-red-500 hover:text-white transition-colors cursor-pointer" title="Quitar categoría extra">X</button>
                </div>
              ))}
              
              <button type="button" onClick={agregarSubcatExtra} disabled={subiendo} className="mt-2 text-[11px] font-bold text-blue-600 hover:text-blue-800 uppercase tracking-wide cursor-pointer text-left">
                + Agregar a otra categoría (Opcional)
              </button>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Nombre del Producto:</label>
              <input type="text" value={nombreProd} onChange={(e) => setNombreProd(e.target.value)} disabled={subiendo} className="border border-gray-200 p-2.5 rounded-xl w-full text-sm focus:ring-2 focus:ring-blue-500/50 outline-none disabled:opacity-50" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Stock disponible:</label>
              <input type="number" value={stockProd} onChange={(e) => setStockProd(e.target.value)} disabled={subiendo} className="border border-gray-200 p-2.5 rounded-xl w-full text-sm focus:ring-2 focus:ring-blue-500/50 outline-none disabled:opacity-50" />
            </div>
            
            <div className="md:col-span-2 bg-blue-50/50 p-4 rounded-xl border border-blue-100">
              <label className="block text-xs font-bold text-blue-700 uppercase tracking-wide mb-2 flex items-center gap-2">
                <UploadCloud className="w-4 h-4"/> 
                Subir Fotos (Podés elegir varias a la vez)
              </label>
              <input 
                type="file" 
                multiple 
                accept="image/*"
                disabled={subiendo}
                onChange={(e) => setArchivosImagenes(Array.from(e.target.files))} 
                className="block w-full text-sm text-gray-600 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-bold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer focus:outline-none disabled:opacity-50"
              />
              {archivosImagenes.length > 0 && (
                <span className="text-sm text-emerald-600 font-bold mt-2 block flex items-center gap-1">
                  ¡{archivosImagenes.length} foto(s) lista(s) para subir! 🚀
                </span>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Precio de Venta (Público):</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 font-bold text-gray-400">$</span>
                <input type="number" value={precioProd} onChange={(e) => setPrecioProd(e.target.value)} disabled={subiendo} className="border border-gray-200 p-2.5 pl-7 rounded-xl w-full text-sm focus:ring-2 focus:ring-blue-500/50 outline-none disabled:opacity-50" />
              </div>
            </div>
            
            <div className="md:col-span-3">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Descripción pública:</label>
              <input type="text" value={descripcionProd} onChange={(e) => setDescripcionProd(e.target.value)} disabled={subiendo} className="border border-gray-200 p-2.5 rounded-xl w-full text-sm focus:ring-2 focus:ring-blue-500/50 outline-none disabled:opacity-50" />
            </div>

            {editandoProductoId && (
               <div className="md:col-span-3 opacity-60 hover:opacity-100 transition-opacity">
                 <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Links guardados previamente (podés editarlos a mano):</label>
                 <input type="text" value={imagenProd} onChange={(e) => setImagenProd(e.target.value)} disabled={subiendo} className="border border-gray-200 p-2 rounded-lg w-full text-xs outline-none font-mono disabled:opacity-50" />
               </div>
            )}
          </div>

          <div className="mt-6 pt-5 border-t border-gray-200/60 bg-indigo-50/30 p-4 rounded-xl">
            <h3 className="text-sm font-black text-indigo-800 mb-4 flex items-center gap-2 uppercase tracking-wide">
               <Lock className="w-4 h-4 text-indigo-500"/> Información Interna (Oculta al público)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-indigo-600/70 uppercase tracking-wide mb-1.5">Costo de Compra:</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 font-bold text-gray-400">$</span>
                  <input type="number" value={costoProd} onChange={(e) => setCostoProd(e.target.value)} disabled={subiendo} className="border border-indigo-100 p-2.5 pl-7 rounded-xl w-full text-sm focus:ring-2 focus:ring-indigo-500/50 outline-none bg-white disabled:opacity-50" placeholder="Ej: 5000" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-indigo-600/70 uppercase tracking-wide mb-1.5">Proveedor / Marca:</label>
                <input type="text" value={proveedorProd} onChange={(e) => setProveedorProd(e.target.value)} disabled={subiendo} className="border border-indigo-100 p-2.5 rounded-xl w-full text-sm focus:ring-2 focus:ring-indigo-500/50 outline-none bg-white disabled:opacity-50" placeholder="Ej: Mayorista Juan" />
              </div>
              <div>
                <label className="block text-xs font-bold text-indigo-600/70 uppercase tracking-wide mb-1.5">Notas Privadas:</label>
                <input type="text" value={notasProd} onChange={(e) => setNotasProd(e.target.value)} disabled={subiendo} className="border border-indigo-100 p-2.5 rounded-xl w-full text-sm focus:ring-2 focus:ring-indigo-500/50 outline-none bg-white disabled:opacity-50" placeholder="Ej: Tarda 5 días en reponer..." />
              </div>
              <div className="flex items-center mt-6">
                 <label className="relative inline-flex items-center cursor-pointer disabled:opacity-50">
                  <input type="checkbox" checked={porEncargue} onChange={(e) => setPorEncargue(e.target.checked)} disabled={subiendo} className="sr-only peer" />
                  <div className="w-11 h-6 bg-indigo-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                  <span className="ml-3 text-sm font-bold text-indigo-800">Es producto por encargue</span>
                </label>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-end">
               <span className="text-xs font-bold text-gray-500 mr-3 uppercase">Ganancia Estimada x Unidad:</span>
               <span className={`px-4 py-1.5 rounded-full text-sm font-black shadow-sm ${gananciaCalculada > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-200 text-gray-500'}`}>
                 ${gananciaCalculada.toLocaleString('es-AR')}
               </span>
            </div>
          </div>

          <div className="mt-6 flex flex-col md:flex-row gap-4 justify-end">
              {editandoProductoId && <button type="button" onClick={limpiarFormularioProd} disabled={subiendo} className="bg-gray-200 text-gray-700 px-6 py-2.5 rounded-xl font-bold hover:bg-gray-300 cursor-pointer transition w-full md:w-auto disabled:opacity-50">Cancelar Edición</button>}
              <button 
                type="submit" 
                disabled={subiendo}
                className={`${editandoProductoId ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-indigo-600 hover:bg-indigo-700'} text-white px-8 py-2.5 rounded-xl font-black cursor-pointer transition shadow-md w-full md:w-auto disabled:opacity-70 disabled:cursor-wait flex items-center justify-center gap-2`}
              >
                {subiendo ? <><Loader2 className="w-5 h-5 animate-spin" /> Subiendo...</> : (editandoProductoId ? "Guardar Cambios" : "Cargar Producto")}
              </button>
          </div>
        </form>

        <div className="border-t border-gray-100 pt-8 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-end gap-4 mb-4">
            <h2 className="text-xl font-bold text-gray-700">Mi Stock ({productosFiltrados.length})</h2>
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <div className="relative group">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400 group-focus-within:text-blue-500" />
                <input 
                  type="text" placeholder="Buscar producto..." value={busquedaProducto} onChange={(e) => setBusquedaProducto(e.target.value)}
                  className="pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 w-full sm:w-64"
                />
              </div>
              <div className="relative">
                <Filter className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <select 
                  value={filtroSubcategoria} onChange={(e) => setFiltroSubcategoria(e.target.value)}
                  className="pl-9 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 cursor-pointer appearance-none w-full sm:w-auto"
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
        </div>

        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="w-full text-left border-collapse bg-white">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs text-gray-500 uppercase tracking-wider">
                <th className="p-4 w-16">Foto</th>
                <th className="p-4">Producto</th>
                <th className="p-4 hidden sm:table-cell">Subcategoría</th>
                <th className="p-4 hidden md:table-cell text-indigo-400" title="Información Interna">Costo</th>
                <th className="p-4">Precio (Público)</th>
                <th className="p-4">Stock</th>
                <th className="p-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {productosFiltrados.length === 0 ? (
                <tr><td colSpan="7" className="p-8 text-center text-gray-400">No se encontraron productos.</td></tr>
              ) : (
                productosFiltrados.map((prod) => {
                  const miniatura = obtenerMiniatura(prod.imagen_url);
                  return (
                    <tr key={prod.id} className="hover:bg-blue-50/30 transition group">
                      <td className="p-3">
                        <div className="w-12 h-12 rounded-lg bg-gray-50 border border-gray-100 overflow-hidden flex items-center justify-center flex-shrink-0">
                          {miniatura ? <img src={miniatura} alt={prod.nombre} className="w-full h-full object-cover mix-blend-multiply" /> : <ImageIcon className="w-5 h-5 text-gray-300" />}
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="font-bold text-gray-800 line-clamp-2 leading-tight">{prod.nombre}</div>
                        <div className="flex items-center gap-2 mt-1">
                          {prod.proveedor && <span className="text-[10px] text-indigo-400 font-bold uppercase flex items-center gap-1"><Lock className="w-3 h-3"/> {prod.proveedor}</span>}
                          {prod.por_encargue && <span className="text-[10px] text-orange-500 bg-orange-50 px-1.5 rounded font-bold uppercase">Por Encargue</span>}
                        </div>
                      </td>
                      <td className="p-3 hidden sm:table-cell text-sm text-blue-600 font-medium">{obtenerNombreSubcat(prod.subcategoria_id)}</td>
                      <td className="p-3 hidden md:table-cell font-bold text-indigo-300">${prod.costo ? prod.costo.toLocaleString('es-AR') : '-'}</td>
                      <td className="p-3 font-black text-emerald-600">${prod.precio.toLocaleString('es-AR')}</td>
                      <td className="p-3">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-black ${prod.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {prod.stock}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="flex gap-2 justify-end opacity-100 sm:opacity-50 sm:group-hover:opacity-100 transition-opacity">
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

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold mb-4 text-gray-700 flex items-center gap-2">
          <LayoutTemplate className="w-6 h-6 text-indigo-500" />
          Banners de la Tienda (Colecciones Destacadas)
        </h2>
        <form onSubmit={guardarColeccion} className={`mb-8 p-5 rounded-2xl border ${editandoColId ? 'bg-yellow-50 border-yellow-300' : 'bg-gray-50 border-gray-200'} grid grid-cols-1 md:grid-cols-3 gap-4`}>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Título del Banner:</label>
            <input type="text" value={tituloCol} onChange={(e) => setTituloCol(e.target.value)} placeholder="Ej: REMERAS DE VERANO" className="border border-gray-200 p-2.5 rounded-xl w-full text-sm focus:ring-2 focus:ring-indigo-500/50 outline-none" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">A qué Categoría apunta:</label>
            <select value={catColSeleccionada} onChange={(e) => setCatColSeleccionada(e.target.value)} className="border border-gray-200 p-2.5 rounded-xl w-full bg-white text-sm cursor-pointer focus:ring-2 focus:ring-indigo-500/50 outline-none">
              <option value="">Elegí categoría padre...</option>
              {categorias.map((cat) => <option key={cat.id} value={cat.id}>{cat.nombre}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Link de la Imagen de Fondo:</label>
            <input type="text" value={imagenCol} onChange={(e) => setImagenCol(e.target.value)} placeholder="Link terminado en .jpg" className="border border-gray-200 p-2.5 rounded-xl w-full text-sm focus:ring-2 focus:ring-indigo-500/50 outline-none" />
          </div>
          <div className="md:col-span-3 flex justify-end gap-3 mt-2">
            {editandoColId && <button type="button" onClick={limpiarColeccion} className="bg-gray-200 text-gray-700 px-6 py-2.5 rounded-xl font-bold hover:bg-gray-300 cursor-pointer transition">Cancelar</button>}
            <button type="submit" className={`${editandoColId ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-indigo-600 hover:bg-indigo-700'} text-white px-8 py-2.5 rounded-xl font-black cursor-pointer transition shadow-md`}>
              {editandoColId ? "Actualizar Banner" : "Agregar Banner"}
            </button>
          </div>
        </form>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {colecciones.length === 0 ? (
            <div className="col-span-full p-8 text-center text-gray-400 border border-dashed border-gray-200 rounded-2xl">
              No hay banners cargados.
            </div>
          ) : (
            colecciones.map(col => (
              <div key={col.id} className="relative rounded-2xl overflow-hidden shadow-sm border border-gray-100 group h-40">
                <img src={col.imagen_url} alt={col.titulo} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute inset-0 bg-black/50"></div>
                <div className="absolute inset-0 p-4 flex flex-col justify-between">
                  <span className="text-white font-black text-lg drop-shadow-md">{col.titulo}</span>
                  <span className="text-white/80 text-xs font-bold bg-black/40 px-2 py-1 rounded-md w-fit">Apunta a: {obtenerNombreCategoria(col.categoria_id)}</span>
                  <div className="flex gap-2 justify-end mt-2">
                    <button onClick={() => cargarColeccionParaEditar(col)} className="bg-yellow-500/90 text-white px-2 py-1 rounded-md text-xs font-bold hover:bg-yellow-500">Editar</button>
                    <button onClick={() => eliminarColeccion(col.id)} className="bg-red-500/90 text-white px-2 py-1 rounded-md text-xs font-bold hover:bg-red-500">Borrar</button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
}

export default Admin;
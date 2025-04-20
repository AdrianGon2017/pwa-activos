import React, { useState, useEffect } from "react";
import { db } from "./firebase";
import { collection, addDoc, getDocs, query, where, deleteDoc, doc, updateDoc } from "firebase/firestore";
import './index.css';

export default function App() {
  const [tipo, setTipo] = useState("");
  const [numero, setNumero] = useState("");
  const [ubicacion, setUbicacion] = useState("");
  const [estado, setEstado] = useState("");
  const [fechaIngreso, setFechaIngreso] = useState("");
  const [comentario, setComentario] = useState("");
  const [comentarioFalla, setComentarioFalla] = useState([]);
  const [mostrarSoloConFalla, setMostrarSoloConFalla] = useState(false);
  const [mostrarSoloEnObservacion, setMostrarSoloEnObservacion] = useState(false);
  const [busquedaNumero, setBusquedaNumero] = useState("");
  const [activos, setActivos] = useState([]);
  const [mostrarFallas, setMostrarFallas] = useState(false); // Estado para mostrar/ocultar la sección de fallas
  const [editarActivo, setEditarActivo] = useState(null); // Estado para almacenar el activo a editar

  const tipos = ["Cámara", "Lector", "CPU", "Estación de llamadas", "Amplificador"];
  const fallas = ["Pendiente de repuesto", "Pendiente de revisión de Logicalis", "Pendiente de infraestructura"];

  const campoNumeroLabel =
    tipo === "Lector" ? "N° Lector" :
    tipo === "Cámara" ? "N° Cámara" :
    tipo === "CPU" ? "N° CPU" :
    tipo === "Estación de llamadas" ? "N° Estación" :
    tipo === "Amplificador" ? "N° Amplificador" : "N° Equipo";

  const guardarActivo = async (e) => {
    e.preventDefault();
    if (!tipo || !numero || !ubicacion || !estado || !fechaIngreso) return;

    const data = { 
      tipo, 
      numero, 
      campoNumero: campoNumeroLabel, 
      ubicacion, 
      estado, 
      fechaIngreso, 
      comentario,
      comentarioFalla 
    };

    try {
      if (editarActivo) {
        const activoRef = doc(db, "activos", editarActivo.id);
        await updateDoc(activoRef, data);
        setEditarActivo(null);
      } else {
        await addDoc(collection(db, "activos"), data);
      }
      setTipo(""); setNumero(""); setUbicacion(""); setEstado(""); setFechaIngreso(""); setComentario(""); setComentarioFalla([]);
      obtenerActivos();
    } catch (error) {
      console.error("Error al guardar el activo:", error);
    }
  };

  const obtenerActivos = async () => {
    let consulta = collection(db, "activos");

    if (mostrarSoloConFalla) {
      consulta = query(consulta, where("estado", "==", "En falla"));
    } else if (mostrarSoloEnObservacion) {
      consulta = query(consulta, where("estado", "==", "En observación"));
    }

    const datos = await getDocs(consulta);
    const activosFiltrados = datos.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    if (busquedaNumero.trim() !== "") {
      const filtrados = activosFiltrados.filter(activo =>
        activo.numero.toLowerCase().includes(busquedaNumero.toLowerCase())
      );
      setActivos(filtrados);
    } else {
      setActivos(activosFiltrados);
    }
  };

  const eliminarActivo = async (id) => {
    try {
      const activoRef = doc(db, "activos", id);
      await deleteDoc(activoRef);
      obtenerActivos();
    } catch (error) {
      console.error("Error al eliminar el activo:", error);
    }
  };

  const editar = (activo) => {
    setTipo(activo.tipo);
    setNumero(activo.numero);
    setUbicacion(activo.ubicacion);
    setEstado(activo.estado);
    setFechaIngreso(activo.fechaIngreso);
    setComentario(activo.comentario);
    setComentarioFalla(activo.comentarioFalla);
    setEditarActivo(activo); // Establecer el activo a editar
  };

  useEffect(() => {
    obtenerActivos();
  }, [mostrarSoloConFalla, mostrarSoloEnObservacion, busquedaNumero]);

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-start py-10 px-4">
      <div className="w-full max-w-4xl bg-white p-6 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-center mb-6">Registro de Fallas</h1>
        <form onSubmit={guardarActivo} className="space-y-4 w-full md:w-3/4 lg:w-2/3 mx-auto">
          {/* Selección tipo de activo */}
          <div className="w-full">
            <label className="block text-gray-700 font-medium mb-2">Selecciona tipo de activo</label>
            <select
              value={tipo}
              onChange={e => setTipo(e.target.value)}
              required
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Seleccione tipo de activo</option>
              {tipos.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          {/* Campo de número */}
          <input
            type="text"
            placeholder={campoNumeroLabel}
            value={numero}
            onChange={e => setNumero(e.target.value)}
            required
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          {/* Ubicación */}
          <input
            type="text"
            placeholder="Ubicación"
            value={ubicacion}
            onChange={e => setUbicacion(e.target.value)}
            required
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          {/* Estado */}
          <select
            value={estado}
            onChange={e => setEstado(e.target.value)}
            required
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Seleccione estado</option>
            <option value="En observación">En observación</option>
            <option value="En falla">En falla</option>
          </select>

          {/* Fecha de ingreso */}
          <input
            type="date"
            value={fechaIngreso}
            onChange={e => setFechaIngreso(e.target.value)}
            required
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          {/* Mostrar solo si el estado es "En falla" */}
          {estado === "En falla" && (
            <div className="w-full mt-4">
              <label className="block text-gray-700 font-medium mb-2">Selecciona tipo de falla</label>
              <button 
                type="button" 
                onClick={() => setMostrarFallas(!mostrarFallas)} 
                className="w-full text-left p-3 bg-blue-500 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {mostrarFallas ? "Ocultar opciones de falla" : "Selecciona tipo de falla"}
              </button>

              {/* Si se selecciona mostrar, se despliega la sección de fallas */}
              {mostrarFallas && (
                <div className="mt-4">
                  <select
                    multiple
                    value={comentarioFalla}
                    onChange={e => setComentarioFalla(Array.from(e.target.selectedOptions, option => option.value))}
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {fallas.map(falla => (
                      <option key={falla} value={falla}>{falla}</option>
                    ))}
                  </select>

                  <textarea
                    placeholder="Comentario de falla (opcional)"
                    value={comentario}
                    onChange={e => setComentario(e.target.value)}
                    className="w-full p-3 border rounded-lg mt-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}
            </div>
          )}

          {/* Botón de guardar */}
          <button
            type="submit"
            className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {editarActivo ? "Actualizar activo" : "Guardar activo"}
          </button>
        </form>

        {/* Filtros de búsqueda */}
        <div className="mt-6 flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-6 justify-center">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={mostrarSoloConFalla}
              onChange={e => {
                setMostrarSoloConFalla(e.target.checked);
                if (e.target.checked) setMostrarSoloEnObservacion(false);
              }}
              className="form-checkbox"
            />
            <span>Mostrar solo en falla</span>
          </label>

          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={mostrarSoloEnObservacion}
              onChange={e => {
                setMostrarSoloEnObservacion(e.target.checked);
                if (e.target.checked) setMostrarSoloConFalla(false);
              }}
              className="form-checkbox"
            />
            <span>Mostrar en observación</span>
          </label>
        </div>

        {/* Buscador por número */}
        <div className="mt-4 flex justify-center">
          <input
            type="text"
            placeholder="Buscar por número"
            value={busquedaNumero}
            onChange={e => setBusquedaNumero(e.target.value)}
            className="w-full p-3 border rounded-lg max-w-md"
          />
        </div>

        {/* Tabla de activos */}
        <div className="mt-6 overflow-x-auto">
          <table className="w-full border-collapse shadow-md mx-auto">
            <thead className="bg-blue-100">
              <tr>
                <th className="border-2 px-4 py-2 text-left">Tipo</th>
                <th className="border-2 px-4 py-2 text-left">N° Equipo</th>
                <th className="border-2 px-4 py-2 text-left">Ubicación</th>
                <th className="border-2 px-4 py-2 text-left">Estado</th>
                <th className="border-2 px-4 py-2 text-left">Fecha de Ingreso</th>
                <th className="border-2 px-4 py-2 text-left">Comentario</th>
                <th className="border-2 px-4 py-2 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {activos.map(activo => (
                <tr key={activo.id} className="odd:bg-white even:bg-gray-50">
                  <td className="border-2 px-4 py-2">{activo.tipo}</td>
                  <td className="border-2 px-4 py-2">{activo.numero || "-"}</td>
                  <td className="border-2 px-4 py-2">{activo.ubicacion}</td>
                  <td className={`border-2 px-4 py-2 ${activo.estado === "En falla" ? "text-red-600 font-semibold" : "text-yellow-600 font-semibold"}`}>
                    {activo.estado}
                  </td>
                  <td className="border-2 px-4 py-2">{activo.fechaIngreso}</td>
                  <td className="border-2 px-4 py-2">{activo.comentario || "Ninguno"}</td>
                  <td className="border-2 px-4 py-2">
                    <button
                      onClick={() => editar(activo)}
                      className="bg-yellow-500 text-white py-1 px-4 rounded-md hover:bg-yellow-600"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => eliminarActivo(activo.id)}
                      className="bg-red-600 text-white py-1 px-4 rounded-md hover:bg-red-700 ml-2"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from "react";
import { db } from "./firebase";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  deleteDoc,
  doc,
  updateDoc
} from "firebase/firestore";
import "./index.css";

export default function App() {
  const [tipo, setTipo] = useState("");
  const [numero, setNumero] = useState("");
  const [ubicacion, setUbicacion] = useState("");
  const [estado, setEstado] = useState("");
  const [fechaIngreso, setFechaIngreso] = useState("");
  const [comentario, setComentario] = useState("");
  const [comentarioFalla, setComentarioFalla] = useState("");
  const [mostrarSoloConFalla, setMostrarSoloConFalla] = useState(false);
  const [mostrarSoloEnObservacion, setMostrarSoloEnObservacion] = useState(false);
  const [busquedaNumero, setBusquedaNumero] = useState("");
  const [activos, setActivos] = useState([]);
  const [editarActivo, setEditarActivo] = useState(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false); // El formulario está oculto por defecto

  const tipos = ["Cámara", "Lector", "CPU", "Estación de llamadas", "Amplificador"];
  const fallas = [
    "Pendiente de repuesto",
    "Pendiente de revisión de Logicalis",
    "Pendiente de infraestructura"
  ];

  const campoNumeroLabel =
    tipo === "Lector"
      ? "N° Lector"
      : tipo === "Cámara"
      ? "N° Cámara"
      : tipo === "CPU"
      ? "N° CPU"
      : tipo === "Estación de llamadas"
      ? "N° Estación"
      : tipo === "Amplificador"
      ? "N° Amplificador"
      : "N° Equipo";

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
      setTipo("");
      setNumero("");
      setUbicacion("");
      setEstado("");
      setFechaIngreso("");
      setComentario("");
      setComentarioFalla("");
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
    const activosFiltrados = datos.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    if (busquedaNumero.trim() !== "") {
      const filtrados = activosFiltrados.filter((activo) =>
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
    setComentarioFalla(activo.comentarioFalla || "");
    setEditarActivo(activo);
  };

  useEffect(() => {
    obtenerActivos();
  }, [mostrarSoloConFalla, mostrarSoloEnObservacion, busquedaNumero]);

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-start py-10 px-4">
      <div className="w-full max-w-4xl bg-white p-6 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-center mb-6">Registro de Fallas</h1>

        {/* Botón para alternar visibilidad del formulario */}
        <button
          onClick={() => setMostrarFormulario(!mostrarFormulario)}
            style={{ width: '24px', height: '24px' }}  // Forzando el tamaño con estilos en línea
            className="fixed top-1/7 left-0 transform -translate-y-1/2 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-blue-700 transition-colors"
        >
          {mostrarFormulario ? "-" : "+"}
        </button>

        {/* Condicional para mostrar el formulario */}
        {mostrarFormulario && (
          <form
            onSubmit={guardarActivo}
            className="space-y-4 w-full md:w-3/4 lg:w-2/3 mx-auto mt-10"
          >
            <div className="w-full">
              <label className="block text-gray-700 font-medium mb-2">
                Selecciona tipo de activo
              </label>
              <select
                value={tipo}
                onChange={(e) => setTipo(e.target.value)}
                required
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Seleccione tipo de activo</option>
                {tipos.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <input
              type="text"
              placeholder={campoNumeroLabel}
              value={numero}
              onChange={(e) => setNumero(e.target.value)}
              required
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <input
              type="text"
              placeholder="Ubicación"
              value={ubicacion}
              onChange={(e) => setUbicacion(e.target.value)}
              required
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <select
              value={estado}
              onChange={(e) => setEstado(e.target.value)}
              required
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Seleccione estado</option>
              <option value="En observación">En observación</option>
              <option value="En falla">En falla</option>
            </select>

            <input
              type="date"
              value={fechaIngreso}
              onChange={(e) => setFechaIngreso(e.target.value)}
              required
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            {estado === "En falla" && (
              <div className="w-full mt-4">
                <label className="block text-gray-700 font-medium mb-2">
                  Selecciona tipo de falla
                </label>
                <select
                  value={comentarioFalla}
                  onChange={(e) => setComentarioFalla(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Seleccione tipo de falla</option>
                  {fallas.map((falla) => (
                    <option key={falla} value={falla}>
                      {falla}
                    </option>
                  ))}
                </select>
                <textarea
                  placeholder="Comentario de falla (opcional)"
                  value={comentario}
                  onChange={(e) => setComentario(e.target.value)}
                  className="w-full p-3 border rounded-lg mt-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            {estado === "En observación" && (
              <div className="w-full mt-4">
                <label className="block text-gray-700 font-medium mb-2">
                  Comentario de observación (opcional)
                </label>
                <textarea
                  placeholder="Comentario sobre la observación"
                  value={comentario}
                  onChange={(e) => setComentario(e.target.value)}
                  className="w-full p-3 border rounded-lg mt-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {editarActivo ? "Actualizar activo" : "Guardar activo"}
            </button>
          </form>
        )}

        {/* Tabla de activos */}
        <div className="mt-10">
          <div className="flex justify-between mb-4">
            <input
              type="text"
              value={busquedaNumero}
              onChange={(e) => setBusquedaNumero(e.target.value)}
              placeholder="Buscar por número de activo"
              className="p-2 border rounded-lg"
            />
            <div>
              <label className="mr-2">Mostrar fallas:</label>
              <input
                type="checkbox"
                checked={mostrarSoloConFalla}
                onChange={() => setMostrarSoloConFalla(!mostrarSoloConFalla)}
              />
            </div>
            <div>
              <label className="mr-2">Mostrar observación:</label>
              <input
                type="checkbox"
                checked={mostrarSoloEnObservacion}
                onChange={() => setMostrarSoloEnObservacion(!mostrarSoloEnObservacion)}
              />
            </div>
          </div>

          <table className="min-w-full table-auto">
            <thead>
              <tr>
                <th className="px-4 py-2 border-b">Tipo</th>
                <th className="px-4 py-2 border-b">Número</th>
                <th className="px-4 py-2 border-b">Ubicación</th>
                <th className="px-4 py-2 border-b">Estado</th>
                <th className="px-4 py-2 border-b">Fecha de Ingreso</th>
                <th className="px-4 py-2 border-b">Comentario</th>
                <th className="px-4 py-2 border-b">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {activos.map((activo) => (
                <tr key={activo.id}>
                  <td className="px-4 py-2 border-b">{activo.tipo}</td>
                  <td className="px-4 py-2 border-b">{activo.numero}</td>
                  <td className="px-4 py-2 border-b">{activo.ubicacion}</td>
                  <td className="px-4 py-2 border-b">{activo.estado}</td>
                  <td className="px-4 py-2 border-b">{activo.fechaIngreso}</td>
                  <td className="px-4 py-2 border-b">{activo.comentario}</td>
                  <td className="px-4 py-2 border-b">
                    <button
                      onClick={() => editar(activo)}
                      className="bg-blue-500 text-white px-3 py-1 rounded mr-2"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => eliminarActivo(activo.id)}
                      className="bg-red-500 text-white px-3 py-1 rounded"
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

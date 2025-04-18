// src/App.jsx
import React, { useState, useEffect } from "react";
import { db } from "./firebase";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where
} from "firebase/firestore";

export default function App() {
  const [tipo, setTipo] = useState("");
  const [ubicacion, setUbicacion] = useState("");
  const [estado, setEstado] = useState("");
  const [fechaIngreso, setFechaIngreso] = useState("");
  const [comentario, setComentario] = useState("");
  const [mostrarSoloConFalla, setMostrarSoloConFalla] = useState(false);
  const [activos, setActivos] = useState([]);

  const tipos = ["Cámara", "Lector", "CPU", "Estación de llamadas", "Amplificador"];

  const guardarActivo = async (e) => {
    e.preventDefault();
    if (!tipo || !ubicacion || !estado || !fechaIngreso) return;

    await addDoc(collection(db, "activos"), {
      tipo,
      ubicacion,
      estado,
      fechaIngreso,
      comentario
    });

    setTipo("");
    setUbicacion("");
    setEstado("");
    setFechaIngreso("");
    setComentario("");
    obtenerActivos();
  };

  const obtenerActivos = async () => {
    let consulta = collection(db, "activos");
    if (mostrarSoloConFalla) {
      consulta = query(consulta, where("comentario", "!=", ""));
    }
    const datos = await getDocs(consulta);
    const lista = datos.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setActivos(lista);
  };

  useEffect(() => {
    obtenerActivos();
  }, [mostrarSoloConFalla]);

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Registro de Activos</h1>
      <form onSubmit={guardarActivo} className="space-y-3">
        <select value={tipo} onChange={(e) => setTipo(e.target.value)} className="w-full p-2 border rounded">
          <option value="">Selecciona un tipo</option>
          {tipos.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>

        <input value={ubicacion} onChange={(e) => setUbicacion(e.target.value)} placeholder="Ubicación" className="w-full p-2 border rounded" />

        <input value={estado} onChange={(e) => setEstado(e.target.value)} placeholder="Estado" className="w-full p-2 border rounded" />

        <input type="date" value={fechaIngreso} onChange={(e) => setFechaIngreso(e.target.value)} className="w-full p-2 border rounded" />

        <textarea value={comentario} onChange={(e) => setComentario(e.target.value)} placeholder="Comentario de falla (opcional)" className="w-full p-2 border rounded" />

        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded">Guardar activo</button>
      </form>

      <div className="mt-6">
        <label className="flex items-center space-x-2">
          <input type="checkbox" checked={mostrarSoloConFalla} onChange={() => setMostrarSoloConFalla(!mostrarSoloConFalla)} />
          <span>Mostrar solo activos con fallas</span>
        </label>
      </div>

      <ul className="mt-4 space-y-2">
        {activos.map((activo) => (
          <li key={activo.id} className="p-3 border rounded shadow">
            <p><strong>Tipo:</strong> {activo.tipo}</p>
            <p><strong>Ubicación:</strong> {activo.ubicacion}</p>
            <p><strong>Estado:</strong> {activo.estado}</p>
            <p><strong>Fecha:</strong> {activo.fechaIngreso}</p>
            {activo.comentario && <p><strong>Falla:</strong> {activo.comentario}</p>}
          </li>
        ))}
      </ul>
    </div>
  );
}

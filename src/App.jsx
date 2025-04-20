
import React, { useState, useEffect } from "react";
import { db } from "./firebase";
import { collection, addDoc, getDocs, query, where } from "firebase/firestore";
import './index.css';

export default function App() {
  const [tipo, setTipo] = useState("");
  const [numero, setNumero] = useState("");
  const [ubicacion, setUbicacion] = useState("");
  const [estado, setEstado] = useState("");
  const [fechaIngreso, setFechaIngreso] = useState("");
  const [comentario, setComentario] = useState("");
  const [mostrarSoloConFalla, setMostrarSoloConFalla] = useState(false);
  const [activos, setActivos] = useState([]);

  const tipos = ["Cámara", "Lector", "CPU", "Estación de llamadas", "Amplificador"];

  const campoNumeroLabel =
    tipo === "Lector" ? "N° Lector" :
    tipo === "Cámara" ? "N° Cámara" :
    tipo === "CPU" ? "N° CPU" :
    tipo === "Estación de llamadas" ? "N° Estación" :
    tipo === "Amplificador" ? "N° Amplificador" : "N° Activo";

  const guardarActivo = async (e) => {
    e.preventDefault();
    if (!tipo || !numero || !ubicacion || !estado || !fechaIngreso) return;

    const data = { tipo, numero, campoNumero: campoNumeroLabel, ubicacion, estado, fechaIngreso, comentario };
    try {
      await addDoc(collection(db, "activos"), data);
      setTipo(""); setNumero(""); setUbicacion(""); setEstado(""); setFechaIngreso(""); setComentario("");
      obtenerActivos();
    } catch (error) {
      console.error("Error al guardar el activo:", error);
    }
  };

  const obtenerActivos = async () => {
    let consulta = collection(db, "activos");
    if (mostrarSoloConFalla) {
      consulta = query(consulta, where("comentario", "!=", ""));
    }
    const datos = await getDocs(consulta);
    setActivos(datos.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  useEffect(() => {
    obtenerActivos();
  }, [mostrarSoloConFalla]);

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Registro de Falla</h1>
      <form onSubmit={guardarActivo} className="space-y-4">
        <select value={tipo} onChange={e => setTipo(e.target.value)} required className="w-full p-2 border rounded">
          <option value="">Seleccione tipo de activo</option>
          {tipos.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <input type="text" placeholder={campoNumeroLabel} value={numero} onChange={e => setNumero(e.target.value)} required className="w-full p-2 border rounded" />
        <input type="text" placeholder="Ubicación" value={ubicacion} onChange={e => setUbicacion(e.target.value)} required className="w-full p-2 border rounded" />
        <select value={estado} onChange={e => setEstado(e.target.value)} required className="w-full p-2 border rounded">
          <option value="">Seleccione estado</option>
          <option value="Operativo">Operativo</option>
          <option value="En falla">En falla</option>
        </select>
        <input type="date" value={fechaIngreso} onChange={e => setFechaIngreso(e.target.value)} required className="w-full p-2 border rounded" />
        <textarea placeholder="Comentario de falla (opcional)" value={comentario} onChange={e => setComentario(e.target.value)} className="w-full p-2 border rounded" />
        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">Guardar activo</button>
      </form>

      <div className="mt-6 flex items-center space-x-2">
        <input type="checkbox" checked={mostrarSoloConFalla} onChange={e => setMostrarSoloConFalla(e.target.checked)} className="form-checkbox" />
        <span>Mostrar solo activos con fallas</span>
      </div>

      <div className="mt-6 overflow-x-auto">
        <table className="min-w-full border-collapse shadow-md">
          <thead className="bg-blue-100">
            <tr>
              <th className="border-2 px-4 py-2 text-left">Tipo</th>
              <th className="border-2 px-4 py-2 text-left">N° Activo</th>
              <th className="border-2 px-4 py-2 text-left">Ubicación</th>
              <th className="border-2 px-4 py-2 text-left">Estado</th>
              <th className="border-2 px-4 py-2 text-left">Fecha de Ingreso</th>
              <th className="border-2 px-4 py-2 text-left">Comentario</th>
            </tr>
          </thead>
          <tbody>
            {activos.map(activo => (
              <tr key={activo.id} className="odd:bg-white even:bg-gray-50">
                <td className="border-2 px-4 py-2">{activo.tipo}</td>
                <td className="border-2 px-4 py-2">{activo.numero || "-"}</td>
                <td className="border-2 px-4 py-2">{activo.ubicacion}</td>
                <td className={`border-2 px-4 py-2 ${activo.estado === "En falla" ? "text-red-600 font-semibold" : "text-green-700"}`}>{activo.estado}</td>
                <td className="border-2 px-4 py-2">{activo.fechaIngreso}</td>
                <td className="border-2 px-4 py-2">{activo.comentario || "Ninguno"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
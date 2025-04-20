import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs, query, where } from "firebase/firestore";

const ListaActivos = ({ mostrarSoloConFalla }) => {
  const [activos, setActivos] = useState([]);

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
    <div className="overflow-x-auto">
      <table className="table-auto w-full border-collapse">
        <thead>
          <tr className="bg-gray-200">
            <th className="border p-2">Tipo</th>
            <th className="border p-2">Ubicación</th>
            <th className="border p-2">Estado</th>
            <th className="border p-2">Fecha de Ingreso</th>
            <th className="border p-2">Comentario de Falla</th>
          </tr>
        </thead>
        <tbody>
          {activos.map((activo) => (
            <tr key={activo.id} className="border-t odd:bg-gray-100 even:bg-white">
              <td className="border p-2">{activo.tipo}</td>
              <td className="border p-2">{activo.ubicacion}</td>
              <td className="border p-2">{activo.estado}</td>
              <td className="border p-2">{activo.fechaIngreso}</td>
              <td className="border p-2">{activo.comentario || "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ListaActivos;

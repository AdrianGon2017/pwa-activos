// subirCSV.js
import fs from 'fs';
import csv from 'csv-parser';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyD8kB6nuUAHIXbtsxpRseuW_XuMvI5L7I0",
  authDomain: "appactivos-ccf1a.firebaseapp.com",
  projectId: "appactivos-ccf1a",
  storageBucket: "appactivos-ccf1a.firebasestorage.app",
  messagingSenderId: "956934970631",
  appId: "1:956934970631:web:ea19576592874eca9a39a2"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const subirDatos = async () => {
  const resultados = [];

  fs.createReadStream('activos.csv')
    .pipe(csv())
    .on('data', (data) => resultados.push(data))
    .on('end', async () => {
      console.log(`Subiendo ${resultados.length} activos...`);
      for (const activo of resultados) {
        try {
          await addDoc(collection(db, 'activos'), activo);
        } catch (e) {
          console.error('Error al subir activo:', activo, e);
        }
      }
      console.log('✅ Carga completa');
    });
};

subirDatos();

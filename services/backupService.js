const {MONGO_URI} = require ('../db.js');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');


async function realizarBackup() {
    const fecha = new Date().toISOString().split('T')[0];
    const dirRespaldo = path.join(__dirname, '../resguardos_tpi', fecha);

    // Crear carpeta si no existe
    if (!fs.existsSync(dirRespaldo)) {
        fs.mkdirSync(dirRespaldo, { recursive: true });
    }

    return new Promise((resolve, reject) => {
        // Ejecuta el comando mongodump del sistema
        exec(`mongodump --uri="${MONGO_URI}" --out="${dirRespaldo}"`, (error) => {
            if (error) reject(error);
            else resolve(dirRespaldo);
        });
    });
}

module.exports = { realizarBackup };
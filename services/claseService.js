const { obtenerDB } = require('../db');
const { ObjectId } = require('mongodb'); // Necesario para buscar por ID en el driver nativo

function getColeccion() {
    const db = obtenerDB();
    return db.collection('clases');
}

// CREATE
async function crearClase(clase) {
    const col = getColeccion();
    // Forzamos que por defecto esté activo (Baja lógica)
    const nuevaClase = { ...clase, activo: true, createdAt: new Date() };
    return await col.insertOne(nuevaClase);
}

// READ (Solo activos)
async function listarClasesActivas() {
    const col = getColeccion();
    // REQUISITO: Filtramos nativamente para traer solo los que NO están eliminados lógicamente
    return await col.find({ activo: true }).toArray();
}

// UPDATE
async function actualizarClase(id, camposAActualizar) {
    const col = getColeccion();
    return await col.updateOne(
        { _id: new ObjectId(id) },
        { $set: { ...camposAActualizar, updatedAt: new Date() } }
    );
}

// DELETE (Baja Lógica)
async function bajaLogicaClase(id) {
    const col = getColeccion();
    //Seteamos activo = false
    return await col.updateOne(
        { _id: new ObjectId(id) },
        { $set: { activo: false, updatedAt: new Date() } }
    );
}

module.exports = {
    crearClase,
    listarClasesActivas,
    actualizarClase,
    bajaLogicaClase
};
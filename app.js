// app.js
const readline = require('readline');
const { conectarDB, cerrarDB } = require('./db');
const backupService = require('./services/backupService');

// Importamos los servicios de cada colección (debes crear estos archivos de forma similar a productosService.js)
const claseService = require('./services/claseService');
const profesorService = require('./services/profesorService');
const socioService = require('./services/socioService');
const turnoService = require('./services/turnoService');

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const cuestionario = (pregunta) => new Promise((resolve) => rl.question(pregunta, resolve));

// ==========================================
// SUBMENÚS DE CADA ENTIDAD
// ==========================================

async function menuClases() {
    console.log('\n--- 🏋️ CRUD DE CLASES ---');
    console.log('1. Crear Clase | 2. Listar Clases | 3. Modificar | 4. Baja Lógica | 0. Volver');
    const op = await cuestionario('Opción: ');

    if (op === '0') return;

    switch (op) {
        case '1':
            try {
                const dias = await cuestionario('Días (ej: Lunes,Miércoles): ');
                const horario_inicio = await cuestionario('Horario inicio (ej: 19:00): ');
                const cupo_maximo = await cuestionario('Cupo máximo: ');
                const nombreDisc = await cuestionario('Nombre disciplina: ');
                const intensidad = await cuestionario('Intensidad (Alta/Media/Baja): ');
                const profesor_id = await cuestionario('ID del Profesor: ');

                await claseService.crearClase({
                    dias: dias.split(','),
                    horario_inicio,
                    cupo_maximo: parseInt(cupo_maximo),
                    disciplina: { nombre: nombreDisc, intensidad },
                    profesor_id
                });
                console.log('✅ Clase creada correctamente.');
            } catch (error) {
                console.error('❌ Error al crear la clase:', error.message);
            }
            break;

        case '2':
            const clases = await claseService.listarClasesActivas();
            console.table(clases);
            break;

        case '3':
            try {
                const id = await cuestionario('ID de la clase a modificar: ');
                const nuevoCupo = await cuestionario('Nuevo cupo máximo (Enter para omitir): ');

                if (nuevoCupo) {
                    await claseService.actualizarClase(id, { cupo_maximo: parseInt(nuevoCupo) });
                    console.log('✅ Clase actualizada.');
                } else {
                    console.log('ℹ️ Sin cambios.');
                }
            } catch (error) {
                console.error('❌ Error al actualizar:', error.message);
            }
            break;

        case '4':
            try {
                const id = await cuestionario('ID de la clase a dar de baja: ');
                await claseService.bajaLogicaClase(id);
                console.log('⚠️ Clase dada de baja (lógica).');
            } catch (error) {
                console.error('❌ Error al dar de baja:', error.message);
            }
            break;

        default:
            console.log('❌ Opción inválida.');
    }
}

async function menuProfesores() {
    console.log('\n--- 🧑‍🏫 CRUD DE PROFESORES ---');
    console.log('1. Alta | 2. Listar Activos | 3. Actualizar | 4. Baja Lógica | 0. Volver');
    const op = await cuestionario('Opción: ');

    if (op === '0') return;

    switch (op) {
        case '1':
            try {
                const nombre = await cuestionario('Nombre: ');
                const apellido = await cuestionario('Apellido: ');
                const dni = await cuestionario('DNI: ');
                const espStr = await cuestionario('Especialidades (separadas por coma): ');

                const especialidades = espStr.split(',').map(e => e.trim());

                await profesorService.crearProfesor({ nombre, apellido, dni, especialidades });
                console.log(`✅ Profesor ${nombre} ${apellido} registrado correctamente.`);
            } catch (error) {
                console.error('❌ Error al registrar profesor:', error.message);
            }
            break;

        case '2':
            const profesores = await profesorService.listarProfesoresActivos();
            console.table(profesores);
            break;

        case '3':
            try {
                const id = await cuestionario('ID del profesor a actualizar: ');
                console.log('Ingresa los nuevos datos (presiona Enter para dejar igual):');

                const nombre = await cuestionario('Nuevo Nombre: ');
                const apellido = await cuestionario('Nuevo Apellido: ');

                const campos = {};
                if (nombre) campos.nombre = nombre;
                if (apellido) campos.apellido = apellido;

                if (Object.keys(campos).length > 0) {
                    await profesorService.actualizarProfesor(id, campos);
                    console.log('✅ Profesor actualizado.');
                } else {
                    console.log('ℹ️ Sin cambios.');
                }
            } catch (error) {
                console.error('❌ Error al actualizar profesor:', error.message);
            }
            break;

        case '4':
            try {
                const id = await cuestionario('ID del profesor a dar de baja: ');
                await profesorService.bajaLogicaProfesor(id);
                console.log('⚠️ Profesor dado de baja (lógica).');
            } catch (error) {
                console.error('❌ Error al dar de baja:', error.message);
            }
            break;

        default:
            console.log('❌ Opción inválida.');
    }
}

async function menuSocios() {
    console.log('\n--- 🏃 CRUD DE SOCIOS ---');
    console.log('1. Nuevo Socio | 2. Listar | 3. Actualizar | 4. Baja Lógica | 0. Volver');
    const op = await cuestionario('Opción: ');

    switch (op) {
        case '1':
            try {
                const nombre = await cuestionario('Nombre: ');
                const apellido = await cuestionario('Apellido: ');
                const dni = await cuestionario('DNI: ');

                await socioService.crearSocio({ nombre, apellido, dni });
                console.log('✅ Socio creado correctamente.');
            } catch (error) {
                console.error('❌ Error al crear el socio:', error.message);
            }
            break;
        case '2':
            const socios = await socioService.listarSociosActivos();
            console.table(socios); // console.table se ve genial para listar
            break;
        case '3':
            try {
                const id = await cuestionario('ID del socio a actualizar: ');
                console.log('Ingresa los nuevos datos (presiona Enter para dejar igual):');

                const nuevoNombre = await cuestionario('Nuevo Nombre: ');
                const nuevoApellido = await cuestionario('Nuevo Apellido: ');

                // Creamos un objeto solo con los campos que no están vacíos
                const campos = {};
                if (nuevoNombre) campos.nombre = nuevoNombre;
                if (nuevoApellido) campos.apellido = nuevoApellido;

                // Solo llamamos al servicio si hay algo para actualizar
                if (Object.keys(campos).length > 0) {
                    await socioService.actualizarSocio(id, campos);
                    console.log('✅ Socio actualizado correctamente.');
                } else {
                    console.log('ℹ️ No se realizaron cambios.');
                }
            } catch (error) {
                console.error('❌ Error al actualizar el socio:', error.message);
            }
            break;
        case '4':
            const id = await cuestionario('ID del socio a dar de baja: ');
            await socioService.bajaLogicaSocio(id);
            console.log('⚠️ Socio dado de baja (lógica).');
            break;
    }
}

async function menuTurnos() {
    console.log('\n--- 📅 CRUD DE TURNOS ---');
    console.log('1. Asignar Turno | 2. Listar | 3. Modificar/Asistencia | 4. Cancelar (Baja) | 0. Volver');
    const op = await cuestionario('Opción: ');

    if (op === '0') return;

    switch (op) {
        case '1':
            try {
                const clase_id = await cuestionario('ID de la Clase: ');
                const socio_id = await cuestionario('ID del Socio: ');
                const fecha = await cuestionario('Fecha del turno (YYYY-MM-DD): ');

                await turnoService.crearTurno({
                    clase_id,
                    socio_id,
                    fecha_turno: new Date(fecha),
                    asistio: false // Por defecto no asistió al crear
                });
                console.log('✅ Turno asignado con éxito.');
            } catch (error) {
                console.error('❌ Error al asignar turno:', error.message);
            }
            break;

        case '2':
            const turnos = await turnoService.listarTurnosActivos();
            console.table(turnos);
            break;

        case '3':
            try {
                const id = await cuestionario('ID del turno a actualizar: ');
                const asistioStr = await cuestionario('¿Asistió? (true/false): ');

                const asistio = asistioStr === 'true';
                await turnoService.actualizarTurno(id, { asistio });
                console.log('✅ Asistencia actualizada.');
            } catch (error) {
                console.error('❌ Error al actualizar asistencia:', error.message);
            }
            break;

        case '4':
            try {
                const id = await cuestionario('ID del turno a cancelar: ');
                await turnoService.bajaLogicaTurno(id);
                console.log('⚠️ Turno cancelado (baja lógica).');
            } catch (error) {
                console.error('❌ Error al cancelar turno:', error.message);
            }
            break;

        default:
            console.log('❌ Opción inválida.');
    }
}


// ==========================================
// BUCLE PRINCIPAL (MAIN LOOP)
// ==========================================

async function iniciar() {
    await conectarDB(); // Inicializa el driver nativo una sola vez

    // Bucle infinito solicitado
    while (true) {
        console.log('\n====================================');
        console.log('      SISTEMA DE GESTIÓN DE CLUB    ');
        console.log('====================================');
        console.log('1 - CRUD de Clases');
        console.log('2 - CRUD de Profesores');
        console.log('3 - CRUD de Socios');
        console.log('4 - CRUD de Turnos');
        console.log('5 - Realizar Backup de la Base de Datos');
        console.log('0 - Salir');

        const opcion = await cuestionario('\nSeleccione un módulo principal (0-4): ');

        if (opcion === '0') {
            console.log('\nCerrando conexiones y saliendo... ¡Hasta luego!');
            break; // Esto rompe el bucle true inmediatamente
        }

        switch (opcion) {
            case '1':
                await menuClases();
                break;
            case '2':
                await menuProfesores();
                break;
            case '3':
                await menuSocios();
                break;
            case '4':
                await menuTurnos();
                break;
            case '5':
                console.log('\n⏳ Iniciando respaldo...');
                try {
                    await backupService.realizarBackup();
                    console.log('✅ Backup completado con éxito.');
                } catch (e) {
                    console.log('❌ Error en backup:', e.message);
                }
                break;
            default:
                console.log('❌ Opción inválida. Intente de nuevo.');
        }
    }

    // Estas líneas solo se ejecutan cuando el while se rompe con el break (opción 0)
    rl.close();
    await cerrarDB();
    process.exit(0);
}

// Ejecutamos la aplicación
iniciar();
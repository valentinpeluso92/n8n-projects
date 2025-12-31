# Estructura de Planillas - Google Sheets

## 📊 Estructura actualizada de todas las hojas

**Nota:** Todos los nombres de columnas están en `snake_case` para facilitar el acceso desde código.

---

## 📅 HOJA: Turnos

Registro de todos los turnos programados.

| Columna | Tipo | Descripción | Ejemplo |
|---------|------|-------------|---------|
| `id` | string | ID único generado automáticamente | `turno_20250106_090012` |
| `fecha` | string | Fecha del turno (DD/MM/AAAA) | `06/01/2025` |
| `hora` | string | Hora del turno (HH:MM) | `9:00` |
| `nombre_completo` | string | Nombre completo del paciente | `María González` |
| `dni` | string | DNI del paciente (sin puntos) | `35123456` |
| `obra_social` | string | Obra social del paciente | `PAMI`, `OSDE`, `Particular` |
| `tipo_consulta` | string | Tipo de consulta/estudio | `Consulta`, `OCT`, `Campo Visual` |
| `primera_vez` | string | Si es primera visita | `SI`, `NO` |
| `estado` | string | Estado actual del turno | `Confirmado`, `Pendiente`, `Cancelado`, `Atendido` |
| `telefono` | string | Teléfono del paciente | `11-2345-6789` |
| `fecha_de_registro` | string | Fecha/hora de registro (DD/MM/AAAA HH:MM) | `30/12/2024 14:30` |

### **Estados posibles:**
- `Confirmado`: Turno confirmado por el paciente
- `Pendiente`: Turno registrado pero sin confirmar
- `Cancelado`: Turno cancelado
- `Atendido`: Paciente ya fue atendido
- `No asistió`: Paciente no se presentó

### **Acceso desde código:**
```javascript
const turno = {
  id: row.json.id,
  fecha: row.json.fecha,
  hora: row.json.hora,
  nombre_completo: row.json.nombre_completo,
  dni: row.json.dni,
  obra_social: row.json.obra_social,
  tipo_consulta: row.json.tipo_consulta,
  primera_vez: row.json.primera_vez,
  estado: row.json.estado,
  telefono: row.json.telefono,
  fecha_de_registro: row.json.fecha_de_registro
};
```

---

## 👥 HOJA: Pacientes

Registro maestro de todos los pacientes.

| Columna | Tipo | Descripción | Ejemplo |
|---------|------|-------------|---------|
| `id` | string | ID único generado automáticamente | `pac_35123456` |
| `dni` | string | DNI del paciente (sin puntos) | `35123456` |
| `nombre_completo` | string | Nombre completo del paciente | `María González` |
| `obra_social` | string | Obra social del paciente | `PAMI`, `OSDE`, `Particular` |
| `telefono` | string | Teléfono del paciente | `11-2345-6789` |
| `ultima_visita` | string | Fecha de última visita (DD/MM/AAAA) | `15/11/2024` |
| `total_consultas` | number | Contador de consultas realizadas | `3` |

### **Acceso desde código:**
```javascript
const paciente = {
  id: row.json.id,
  dni: row.json.dni,
  nombre_completo: row.json.nombre_completo,
  obra_social: row.json.obra_social,
  telefono: row.json.telefono,
  ultima_visita: row.json.ultima_visita,
  total_consultas: parseInt(row.json.total_consultas) || 0
};
```

---

## 📆 HOJA: Agenda

Configuración de tipos de día y bloqueos.

| Columna | Tipo | Descripción | Ejemplo |
|---------|------|-------------|---------|
| `id` | string | ID único generado automáticamente | `agenda_20250106` |
| `fecha` | string | Fecha (DD/MM/AAAA) | `06/01/2025` |
| `tipo_dia` | string | Tipo de día (valores fijos) | `PARTICULAR`, `PAMI_NUEVO`, `PAMI_VIEJO`, `CIRUGIA`, `CONTROL`, `MEDICION`, `DIA_LIBRE` |
| `horarios_bloqueados` | string | Horarios bloqueados separados por coma | `10:20,12:00` o `Todos bloqueados` |

### **Valores válidos de tipo_dia:**
- `PARTICULAR`: Pacientes particulares, OSDE, bebés
- `PAMI_NUEVO`: PAMI primera vez o +1 año
- `PAMI_VIEJO`: PAMI controles (menos de 1 año)
- `CIRUGIA`: Días reservados para cirugías
- `CONTROL`: Control post-operatorio
- `MEDICION`: Estudios especiales
- `DIA_LIBRE`: Consultorio cerrado

### **Acceso desde código:**
```javascript
const dia = {
  id: row.json.id,
  fecha: row.json.fecha,
  tipo_dia: row.json.tipo_dia,
  horarios_bloqueados: row.json.horarios_bloqueados.split(',').map(h => h.trim())
};
```

---

## 📝 HOJA: Observaciones_Pacientes

Notas y observaciones sobre pacientes.

| Columna | Tipo | Descripción | Ejemplo |
|---------|------|-------------|---------|
| `id` | string | ID único generado automáticamente | `obsp_20241230_143012` |
| `dni` | string | DNI del paciente | `35123456` |
| `observaciones` | string | Texto de la observación | `Alérgico a anestesia tópica` |
| `fecha_de_registro` | string | Fecha/hora de registro | `30/12/2024 14:30` |

### **Acceso desde código:**
```javascript
const observacion = {
  id: row.json.id,
  dni: row.json.dni,
  observaciones: row.json.observaciones,
  fecha_de_registro: row.json.fecha_de_registro
};
```

---

## 📋 HOJA: Observaciones_Agenda

Notas sobre días específicos de la agenda.

| Columna | Tipo | Descripción | Ejemplo |
|---------|------|-------------|---------|
| `id` | string | ID único generado automáticamente | `obsag_20241230_143012` |
| `id_agenda` | string | ID de la agenda referenciada | `agenda_20250106` |
| `observaciones` | string | Texto de la observación | `Día con alta demanda esperada` |
| `fecha_de_registro` | string | Fecha/hora de registro | `30/12/2024 14:30` |

### **Acceso desde código:**
```javascript
const observacion = {
  id: row.json.id,
  id_agenda: row.json.id_agenda,
  observaciones: row.json.observaciones,
  fecha_de_registro: row.json.fecha_de_registro
};
```

---

## 🔧 Funciones Helper para IDs

### **Generar ID de Turno:**
```javascript
function generarIDTurno(fecha, hora) {
  const timestamp = new Date().getTime();
  const fechaLimpia = fecha.replace(/\//g, '');
  return `turno_${fechaLimpia}_${timestamp}`;
}
// Ejemplo: "turno_06012025_1703952341234"
```

### **Generar ID de Paciente:**
```javascript
function generarIDPaciente(dni) {
  return `pac_${dni}`;
}
// Ejemplo: "pac_35123456"
```

### **Generar ID de Agenda:**
```javascript
function generarIDAgenda(fecha) {
  const fechaLimpia = fecha.replace(/\//g, '');
  return `agenda_${fechaLimpia}`;
}
// Ejemplo: "agenda_06012025"
```

### **Generar ID de Observación:**
```javascript
function generarIDObservacion(tipo) {
  const timestamp = new Date().getTime();
  const prefijo = tipo === 'paciente' ? 'obsp' : 'obsag';
  return `${prefijo}_${timestamp}`;
}
// Ejemplo: "obsp_1703952341234"
```

---

## 📊 Ejemplo completo de registro de turno

```javascript
// 1. Datos capturados del paciente
const datos = {
  nombre_completo: "María González",
  dni: "35123456",
  obra_social: "Particular",
  telefono: "11-2345-6789",
  tipo_consulta: "Consulta",
  primera_vez: "SI",
  fecha: "06/01/2025",
  hora: "9:00"
};

// 2. Generar ID
const turnoID = generarIDTurno(datos.fecha, datos.hora);

// 3. Preparar registro para hoja "Turnos"
const nuevoTurno = {
  id: turnoID,
  fecha: datos.fecha,
  hora: datos.hora,
  nombre_completo: datos.nombre_completo,
  dni: datos.dni,
  obra_social: datos.obra_social,
  tipo_consulta: datos.tipo_consulta,
  primera_vez: datos.primera_vez,
  estado: "Confirmado",
  telefono: datos.telefono,
  fecha_de_registro: obtenerFechaHoraActual() // "30/12/2024 14:30"
};

// 4. Guardar en Google Sheets
await guardarEnHoja('Turnos', nuevoTurno);

// 5. Si es paciente nuevo, crear en "Pacientes"
const pacienteExiste = await buscarPorDNI(datos.dni);
if (!pacienteExiste) {
  const pacienteID = generarIDPaciente(datos.dni);
  const nuevoPaciente = {
    id: pacienteID,
    dni: datos.dni,
    nombre_completo: datos.nombre_completo,
    obra_social: datos.obra_social,
    telefono: datos.telefono,
    ultima_visita: datos.fecha,
    total_consultas: 1
  };
  await guardarEnHoja('Pacientes', nuevoPaciente);
}
```

---

## 🔍 Consultas comunes

### **Buscar paciente por DNI:**
```javascript
const paciente = pacientes.find(row => row.json.dni === dniABuscar);
```

### **Buscar turnos de un paciente:**
```javascript
const turnosPaciente = turnos.filter(row => row.json.dni === dni);
```

### **Buscar días de un tipo específico:**
```javascript
const diasPAMI = agenda.filter(row => row.json.tipo_dia === "PAMI_NUEVO");
```

### **Obtener observaciones de un paciente:**
```javascript
const obs = observacionesPacientes.filter(row => row.json.dni === dni);
```

### **Verificar si es primera vez (+1 año):**
```javascript
const ultimaVisita = paciente.ultima_visita;
const haceUnAno = new Date();
haceUnAno.setFullYear(haceUnAno.getFullYear() - 1);
const esPrimeraVez = new Date(ultimaVisita) < haceUnAno;
```

---

## ✅ Checklist de migración

Si tienes datos antiguos con nombres de columnas diferentes:

- [ ] Renombrar columnas en Google Sheets
- [ ] Actualizar validaciones de datos
- [ ] Regenerar mock data con nuevos nombres
- [ ] Actualizar código de tools en n8n
- [ ] Actualizar prompts de agentes
- [ ] Testear todas las operaciones (crear, leer, actualizar, buscar)
- [ ] Verificar que los IDs se generan correctamente

---

## 📝 Notas importantes

1. **IDs únicos**: Siempre generar IDs únicos para nuevas entradas
2. **Formato de fechas**: Consistente en DD/MM/AAAA
3. **Formato de horas**: HH:MM en formato 24 horas
4. **DNI sin puntos**: Guardar como string sin formatear
5. **Teléfonos con guiones**: Formato: `11-2345-6789`
6. **Snake_case**: Todos los nombres de columnas en minúsculas con guión bajo
7. **Strings para booleanos**: Usar `"SI"` y `"NO"` (no true/false)

---

**Versión:** 1.0
**Última actualización:** Diciembre 2024


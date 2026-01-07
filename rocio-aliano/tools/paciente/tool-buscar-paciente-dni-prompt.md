# Tool: buscarPacientePorDNI

Busca un paciente en la hoja "Pacientes" de Google Sheets por su número de DNI.

## 📋 PARÁMETROS

- `dni` (OBLIGATORIO): Número de DNI sin puntos ni guiones (string)
  - Ejemplo: `"35123456"`
  - Formato: Solo números, sin separadores

## 📤 RETORNA

### Caso 1: Paciente encontrado
```json
{
  "status": "success",
  "encontrado": true,
  "paciente": {
    "id": "pac_35123456",
    "dni": "35123456",
    "nombre_completo": "María González",
    "obra_social": "PAMI",
    "telefono": "2342-567890",
    "ultima_visita": "15/11/2024",
    "total_consultas": 3
  },
  "mensaje": "Paciente encontrado: María González"
}
```

### Caso 2: Paciente NO encontrado (es nuevo)
```json
{
  "status": "success",
  "encontrado": false,
  "paciente": null,
  "mensaje": "No se encontró paciente con DNI 35123456. Es paciente nuevo."
}
```

### Caso 3: Error
```json
{
  "status": "error",
  "mensaje": "Error al consultar la base de datos",
  "error": "Connection timeout"
}
```

## 🎯 CUÁNDO USAR

### Agente PACIENTE:

**❌ NO USAR en FLUJO A (Solicitar turno nuevo):**
- La tool `registrarTurno` ya busca automáticamente al paciente
- NO es necesario llamar esta tool antes de registrar un turno

**✅ SÍ USAR en FLUJO B y C:**
1. **FLUJO B - Consultar turno existente** - Para obtener datos del paciente antes de buscar turnos
2. **FLUJO C - Modificar/Cancelar turno** - Para validar identidad antes de modificar
3. **Consultas administrativas** - Para ver historial y datos de contacto

### Agente ADMINISTRADOR:
1. **Búsqueda rápida de info de paciente**
2. **Verificación antes de registrar turno manual**
3. **Consulta de historial y datos de contacto**

## 📊 LÓGICA DE USO

### FLUJO B - Consultar turno:
```javascript
// Usuario: "¿Qué turno tengo?"
// Agente: "¿Me dice su DNI?"

const resultado = buscarPacientePorDNI({ dni: "35123456" });

if (resultado.encontrado) {
  const paciente = resultado.paciente;
  responder(`Hola ${paciente.nombre_completo}`);
  
  // Ahora buscar sus turnos
  buscarTurnosPorDNI({ dni: paciente.dni });
  
} else {
  responder("No encuentro un registro con ese DNI.");
}
```

### FLUJO C - Modificar/Cancelar:
```javascript
// Usuario: "Quiero cancelar mi turno"
// Agente: "¿Me dice su DNI?"

const resultado = buscarPacientePorDNI({ dni: "35123456" });

if (resultado.encontrado) {
  // Verificar que tiene turnos y proceder
  const turnos = buscarTurnosPorDNI({ dni: resultado.paciente.dni });
  // ... continuar con cancelación
} else {
  responder("No encuentro turnos con ese DNI.");
}
```

## 🔒 SEGURIDAD

### Agente PACIENTE:
- ✅ Solo retorna datos del DNI consultado
- ✅ El paciente solo puede buscar su propio DNI
- ❌ NO puede buscar DNIs de otros pacientes

### Agente ADMINISTRADOR:
- ✅ Puede buscar cualquier DNI
- ✅ Acceso total a datos de contacto
- ✅ Puede ver historial completo

## 📊 ESTRUCTURA GOOGLE SHEETS

**Hoja:** `Pacientes`

**Columnas:**
- `id`: string (ej: "pac_35123456")
- `dni`: string (ej: "35123456")
- `nombre_completo`: string
- `obra_social`: string ("PAMI", "OSDE", "Particular")
- `telefono`: string (formato: "2342-567890" con código de área)
- `ultima_visita`: string (formato: "DD/MM/AAAA")
- `total_consultas`: number

**Query:**
```javascript
// Filtrar por DNI
const paciente = pacientes.find(row => row.json.dni === dni);
```

## 💡 EJEMPLOS DE USO

### Ejemplo 1: FLUJO B - Consultar turno existente
```
Usuario: "¿Qué turno tengo?"
Agente: "Para ver su turno, ¿me dice su DNI?"
Usuario: "35123456"

[Llama: buscarPacientePorDNI({ dni: "35123456" })]
→ Retorna: { 
    encontrado: true, 
    paciente: { 
      nombre_completo: "María González",
      ultima_visita: "15/11/2024",
      obra_social: "PAMI"
    }
}

Agente: "Bienvenida de nuevo María."

[Ahora buscar sus turnos con buscarTurnosPorDNI]
```

### Ejemplo 2: FLUJO C - Antes de cancelar turno
```
Usuario: "Quiero cancelar mi turno"
Agente: "Para ayudarlo/a, necesito verificar su identidad. ¿Me dice su DNI?"
Usuario: "28999888"

[Llama: buscarPacientePorDNI({ dni: "28999888" })]
→ Retorna: { 
    encontrado: true,
    paciente: { nombre_completo: "José Pérez" }
}

[Verificar que tiene turnos y proceder a cancelar]
```

### Ejemplo 3: Paciente NO encontrado
```
Usuario: "¿Cuándo es mi turno?"
Agente: "¿Me dice su DNI?"
Usuario: "40111222"

[Llama: buscarPacientePorDNI({ dni: "40111222" })]
→ Retorna: { encontrado: false }

Agente: "No encuentro un registro con ese DNI. 
         ¿Está seguro/a del número?
         O si prefiere, puedo ayudarle a solicitar un turno nuevo."
```

## ⚠️ VALIDACIONES

### Validar DNI antes de buscar:
```javascript
function validarDNI(dni) {
  // Debe ser string de 7-8 dígitos
  const dniStr = String(dni).trim();
  if (!/^\d{7,8}$/.test(dniStr)) {
    return { valido: false, error: "DNI inválido" };
  }
  return { valido: true, dni: dniStr };
}
```

### Validar última visita para PAMI:
```javascript
function necesitaOrdenPrimeraVez(ultimaVisita) {
  if (!ultimaVisita) return true; // Sin visita previa
  
  const fecha = parseFecha(ultimaVisita); // DD/MM/AAAA → Date
  const haceUnAno = new Date();
  haceUnAno.setFullYear(haceUnAno.getFullYear() - 1);
  
  return fecha < haceUnAno; // true si hace +1 año
}
```

## 🔄 FLUJOS DE USO

### FLUJO A - Solicitar turno nuevo:
```
❌ NO llamar buscarPacientePorDNI
→ registrarTurno lo hace automáticamente
```

### FLUJO B - Consultar turno existente:
```
1. Usuario: "¿Qué turno tengo?"
2. Pedir DNI
3. ✅ Llamar buscarPacientePorDNI({ dni })
4. Si encontrado → buscarTurnosPorDNI({ dni })
5. Si no encontrado → Informar que no tiene turnos
```

### FLUJO C - Modificar/Cancelar:
```
1. Usuario: "Quiero cancelar mi turno"
2. Pedir DNI
3. ✅ Llamar buscarPacientePorDNI({ dni })
4. Si encontrado → Verificar turnos y proceder
5. Si no encontrado → Informar que no tiene turnos
```

## 🚫 ERRORES COMUNES

❌ **NO hacer:**
```javascript
// Buscar sin validar formato
buscarPacientePorDNI({ dni: "35.123.456" }); // Con puntos!

// Asumir que siempre existe
const nombre = resultado.paciente.nombre_completo; // Puede ser null!

// No verificar última visita para PAMI
// (puede necesitar orden de primera vez)
```

✅ **SÍ hacer:**
```javascript
// Validar y limpiar DNI
const dniLimpio = dni.replace(/[^0-9]/g, '');
const resultado = buscarPacientePorDNI({ dni: dniLimpio });

// Verificar antes de usar
if (resultado.encontrado && resultado.paciente) {
  const nombre = resultado.paciente.nombre_completo;
}

// Verificar última visita para PAMI
if (paciente.obra_social === "PAMI") {
  const necesitaOrden = necesitaOrdenPrimeraVez(paciente.ultima_visita);
}
```

## 📝 NOTAS

- Esta tool NO modifica datos, solo consulta
- Siempre retorna `status: "success"` incluso si no encuentra (no es un error)
- El campo `encontrado` indica si existe o no el paciente
- Útil para pre-cargar datos y evitar volver a preguntar
- En caso de error técnico, derivar a secretaria


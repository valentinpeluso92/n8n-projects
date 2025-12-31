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
    "telefono": "11-2345-6789",
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
1. **Al inicio del flujo de solicitud de turno** - Para verificar si es paciente nuevo o recurrente
2. **Antes de modificar/cancelar turno** - Para validar identidad
3. **Para determinar tipo PAMI** - Si `ultima_visita` > 1 año = PAMI_NUEVO, sino PAMI_VIEJO

### Agente ADMINISTRADOR:
1. **Búsqueda rápida de info de paciente**
2. **Verificación antes de registrar turno manual**
3. **Consulta de historial y datos de contacto**

## 📊 LÓGICA DE USO

```javascript
// 1. Paciente solicita turno
const resultado = buscarPacientePorDNI({ dni: "35123456" });

if (resultado.encontrado) {
  // Paciente existe
  const paciente = resultado.paciente;
  
  // Determinar tipo PAMI si corresponde
  if (paciente.obra_social === "PAMI") {
    const ultimaVisita = parseDate(paciente.ultima_visita);
    const haceUnAno = new Date();
    haceUnAno.setFullYear(haceUnAno.getFullYear() - 1);
    
    const tipoDia = ultimaVisita < haceUnAno ? "PAMI_NUEVO" : "PAMI_VIEJO";
  }
  
  // Pre-cargar datos para confirmar
  responder(`Bienvenido/a de nuevo ${paciente.nombre_completo}`);
  
} else {
  // Paciente nuevo
  responder("Es su primera vez, voy a registrar sus datos.");
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
- `telefono`: string (formato: "11-2345-6789")
- `ultima_visita`: string (formato: "DD/MM/AAAA")
- `total_consultas`: number

**Query:**
```javascript
// Filtrar por DNI
const paciente = pacientes.find(row => row.json.dni === dni);
```

## 💡 EJEMPLOS DE USO

### Ejemplo 1: Verificar si es primera vez
```
Usuario: "Quiero un turno"
Agente: "¿Me dice su DNI?"
Usuario: "35123456"

[Llama: buscarPacientePorDNI({ dni: "35123456" })]
→ Retorna: { encontrado: false }

Agente: "Es su primera vez en el consultorio. 
         ¿Me dice su nombre completo?"
```

### Ejemplo 2: Paciente recurrente
```
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

Agente: "Bienvenida de nuevo María. 
         Veo que tiene PAMI, ¿verdad?"
```

### Ejemplo 3: Determinar tipo de día PAMI
```
Usuario: "Tengo PAMI"

[Llama: buscarPacientePorDNI({ dni: "35123456" })]
→ Retorna: { 
    paciente: { 
      ultima_visita: "15/01/2023"  // Hace más de 1 año
    }
}

→ Determinar: ultima_visita > 1 año → tipoDia = "PAMI_NUEVO"

Agente: "Como hace más de un año que no viene, 
         va a necesitar la orden de primera consulta."
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

## 🔄 FLUJO TÍPICO

```
1. Usuario proporciona DNI
2. Llamar buscarPacientePorDNI({ dni })
3. Evaluar resultado:
   ├─ Si encontrado = false → Registrar como nuevo
   ├─ Si encontrado = true → Validar datos
   │  ├─ Si PAMI → Verificar ultima_visita
   │  │  ├─ +1 año → Solicitar orden primera vez
   │  │  └─ -1 año → No necesita orden
   │  └─ Si Particular/OSDE → Continuar normal
   └─ Si error → derivarASecretaria
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


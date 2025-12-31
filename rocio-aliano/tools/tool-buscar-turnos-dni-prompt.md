# Tool: buscarTurnosPorDNI

Busca todos los turnos de un paciente en la hoja "Turnos" de Google Sheets filtrando por DNI.

## 📋 PARÁMETROS

- `dni` (OBLIGATORIO): Número de DNI sin puntos ni guiones (string)
  - Ejemplo: `"35123456"`
  - Formato: Solo números, sin separadores

- `estado` (OPCIONAL): Filtrar por estado de turno
  - Valores: `"Confirmado"`, `"Pendiente"`, `"Cancelado"`, `"Atendido"`, `"No asistió"`
  - Default: Retorna todos los estados

- `solo_futuros` (OPCIONAL): Mostrar solo turnos futuros
  - Valores: `true` / `false`
  - Default: `false` (muestra todos)

## 📤 RETORNA

### Caso 1: Turnos encontrados
```json
{
  "status": "success",
  "encontrados": true,
  "cantidad": 2,
  "turnos": [
    {
      "id": "turno_06012025_1703952341234",
      "fecha": "06/01/2025",
      "hora": "9:00",
      "nombre_completo": "María González",
      "dni": "35123456",
      "obra_social": "PAMI",
      "tipo_consulta": "Consulta",
      "primera_vez": "NO",
      "estado": "Confirmado",
      "telefono": "11-2345-6789",
      "fecha_de_registro": "30/12/2024 14:30"
    },
    {
      "id": "turno_10012025_1703952999888",
      "fecha": "10/01/2025",
      "hora": "10:00",
      "nombre_completo": "María González",
      "dni": "35123456",
      "obra_social": "PAMI",
      "tipo_consulta": "Control",
      "primera_vez": "NO",
      "estado": "Pendiente",
      "telefono": "11-2345-6789",
      "fecha_de_registro": "30/12/2024 15:45"
    }
  ],
  "mensaje": "Se encontraron 2 turnos para DNI 35123456"
}
```

### Caso 2: Sin turnos
```json
{
  "status": "success",
  "encontrados": false,
  "cantidad": 0,
  "turnos": [],
  "mensaje": "No se encontraron turnos para DNI 35123456"
}
```

### Caso 3: Error
```json
{
  "status": "error",
  "mensaje": "Error al consultar turnos",
  "error": "Connection timeout"
}
```

## 🎯 CUÁNDO USAR

### Agente PACIENTE:
1. **Usuario pregunta por su turno** - "¿Cuándo es mi turno?"
2. **Antes de modificar turno** - Para mostrar turnos existentes
3. **Antes de cancelar** - Para que elija cuál cancelar
4. **Recordatorio de turno** - Mostrar próximo turno confirmado

### Agente ADMINISTRADOR:
1. **Ver historial completo de un paciente**
2. **Verificar turnos duplicados**
3. **Consultar cancelaciones previas**
4. **Reportes y estadísticas por paciente**

## 📊 LÓGICA DE USO

### Mostrar próximo turno del paciente:
```javascript
const resultado = buscarTurnosPorDNI({ 
  dni: "35123456",
  solo_futuros: true,
  estado: "Confirmado"
});

if (resultado.encontrados && resultado.turnos.length > 0) {
  // Ordenar por fecha (más próximo primero)
  const turnos = ordenarPorFecha(resultado.turnos);
  const proximo = turnos[0];
  
  responder(`Su próximo turno es el ${proximo.fecha} a las ${proximo.hora}`);
} else {
  responder("No tiene turnos confirmados próximos.");
}
```

### Listar todos los turnos para modificar:
```javascript
const resultado = buscarTurnosPorDNI({ 
  dni: "35123456",
  solo_futuros: true
});

if (resultado.cantidad === 0) {
  responder("No tiene turnos registrados.");
} else if (resultado.cantidad === 1) {
  const turno = resultado.turnos[0];
  responder(`Tiene un turno el ${turno.fecha} a las ${turno.hora}. ¿Desea modificarlo?`);
} else {
  // Múltiples turnos - mostrar lista
  let mensaje = "Sus turnos:\n";
  resultado.turnos.forEach((t, i) => {
    mensaje += `${i+1}. ${t.fecha} ${t.hora} - ${t.estado}\n`;
  });
  mensaje += "¿Cuál desea modificar?";
  responder(mensaje);
}
```

## 🔒 SEGURIDAD

### Agente PACIENTE:
- ✅ Solo retorna turnos del DNI consultado
- ✅ El paciente solo puede ver SUS PROPIOS turnos
- ❌ NO puede buscar turnos de otros DNIs
- ⚠️ Validar que el DNI consultado coincide con el DNI del usuario autenticado

### Agente ADMINISTRADOR:
- ✅ Puede buscar turnos de cualquier DNI
- ✅ Acceso a todos los estados (incluyendo cancelados, no asistió)
- ✅ Puede filtrar por múltiples criterios

## 📊 ESTRUCTURA GOOGLE SHEETS

**Hoja:** `Turnos`

**Columnas:**
- `id`: string (ej: "turno_06012025_1703952341234")
- `fecha`: string (DD/MM/AAAA)
- `hora`: string (HH:MM formato 24hs)
- `nombre_completo`: string
- `dni`: string (sin puntos)
- `obra_social`: string
- `tipo_consulta`: string ("Consulta", "OCT", "Campo Visual", etc.)
- `primera_vez`: string ("SI" / "NO")
- `estado`: string ("Confirmado", "Pendiente", "Cancelado", "Atendido", "No asistió")
- `telefono`: string
- `fecha_de_registro`: string (DD/MM/AAAA HH:MM)

**Query:**
```javascript
// Filtrar por DNI
let turnos = allTurnos.filter(row => row.json.dni === dni);

// Filtrar por estado (opcional)
if (estado) {
  turnos = turnos.filter(row => row.json.estado === estado);
}

// Solo futuros (opcional)
if (solo_futuros) {
  const hoy = new Date();
  turnos = turnos.filter(row => {
    const fechaTurno = parseFecha(row.json.fecha);
    return fechaTurno >= hoy;
  });
}
```

## 💡 EJEMPLOS DE USO

### Ejemplo 1: Usuario pregunta por su turno
```
Usuario: "¿Cuándo es mi turno?"
Agente: "¿Me dice su DNI para verificar?"
Usuario: "35123456"

[Llama: buscarTurnosPorDNI({ dni: "35123456", solo_futuros: true })]
→ Retorna: { 
    cantidad: 1,
    turnos: [{ fecha: "06/01/2025", hora: "9:00", estado: "Confirmado" }]
}

Agente: "Su turno es el Lunes 6/1 a las 9:00."
```

### Ejemplo 2: Usuario quiere cancelar turno
```
Usuario: "Necesito cancelar mi turno"
Agente: "¿Me dice su DNI?"
Usuario: "35123456"

[Llama: buscarTurnosPorDNI({ dni: "35123456", solo_futuros: true })]
→ Retorna: { 
    cantidad: 2,
    turnos: [
      { id: "turno_123", fecha: "06/01/2025", hora: "9:00" },
      { id: "turno_456", fecha: "10/01/2025", hora: "10:00" }
    ]
}

Agente: "Tiene 2 turnos:
1. Lunes 6/1 a las 9:00
2. Viernes 10/1 a las 10:00
¿Cuál desea cancelar?"
```

### Ejemplo 3: Sin turnos registrados
```
Usuario: "¿Cuál es mi turno?"
Agente: "¿Su DNI?"
Usuario: "35123456"

[Llama: buscarTurnosPorDNI({ dni: "35123456", solo_futuros: true })]
→ Retorna: { encontrados: false, cantidad: 0 }

Agente: "No tiene turnos registrados. 
         ¿Desea solicitar uno?"
```

### Ejemplo 4: Admin consulta historial completo
```
Admin: "Ver historial de turnos de DNI 35123456"

[Llama: buscarTurnosPorDNI({ dni: "35123456" })]
→ Retorna: { 
    cantidad: 5,
    turnos: [
      { fecha: "15/11/2024", estado: "Atendido" },
      { fecha: "10/09/2024", estado: "Cancelado" },
      { fecha: "05/07/2024", estado: "Atendido" },
      { fecha: "06/01/2025", estado: "Confirmado" },
      { fecha: "10/01/2025", estado: "Pendiente" }
    ]
}

Admin recibe: Historial completo con 3 atendidos, 1 cancelado, 
              2 futuros (1 confirmado, 1 pendiente)
```

## ⚠️ VALIDACIONES

### Validar que el paciente consulta su propio DNI:
```javascript
// En agente PACIENTE
function validarAcceso(dniConsultado, dniUsuario) {
  if (dniConsultado !== dniUsuario) {
    return {
      permitido: false,
      mensaje: "Solo puede consultar sus propios turnos"
    };
  }
  return { permitido: true };
}
```

### Ordenar turnos por fecha:
```javascript
function ordenarTurnosPorFecha(turnos) {
  return turnos.sort((a, b) => {
    const fechaA = parseFecha(a.fecha); // DD/MM/AAAA → Date
    const fechaB = parseFecha(b.fecha);
    return fechaA - fechaB; // Más cercano primero
  });
}
```

### Determinar si turno es próximo:
```javascript
function esProximo(fecha, hora) {
  const fechaTurno = parseFechaHora(fecha, hora);
  const ahora = new Date();
  const diferencia = fechaTurno - ahora;
  const horasRestantes = diferencia / (1000 * 60 * 60);
  
  return horasRestantes > 0 && horasRestantes <= 48; // Próximo = dentro de 48hs
}
```

## 🔄 FLUJO TÍPICO

```
1. Usuario solicita información sobre turno
2. Agente solicita DNI
3. Llamar buscarTurnosPorDNI({ dni, solo_futuros: true })
4. Evaluar resultado:
   ├─ Si cantidad === 0 → "No tiene turnos"
   ├─ Si cantidad === 1 → Mostrar el turno directamente
   ├─ Si cantidad > 1 → Listar todos y preguntar cuál
   └─ Si error → derivarASecretaria
```

## 🚫 ERRORES COMUNES

❌ **NO hacer:**
```javascript
// Asumir que siempre hay turnos
const turno = resultado.turnos[0]; // Puede ser undefined!

// No validar propiedad del turno (en agente paciente)
buscarTurnosPorDNI({ dni: "otro_dni" }); // Inseguro!

// No ordenar turnos antes de mostrar
mostrarTurnos(resultado.turnos); // Pueden estar desordenados
```

✅ **SÍ hacer:**
```javascript
// Verificar antes de acceder
if (resultado.encontrados && resultado.turnos.length > 0) {
  const turnos = ordenarPorFecha(resultado.turnos);
  const proximo = turnos[0];
}

// Validar acceso en agente paciente
const acceso = validarAcceso(dniConsultado, dniUsuario);
if (!acceso.permitido) {
  responder(acceso.mensaje);
  return;
}

// Siempre ordenar antes de mostrar
const turnosOrdenados = ordenarPorFecha(resultado.turnos);
```

## 📝 FILTROS ÚTILES

### Solo turnos confirmados futuros:
```javascript
buscarTurnosPorDNI({ 
  dni: "35123456", 
  solo_futuros: true,
  estado: "Confirmado"
});
```

### Solo turnos cancelados (historial):
```javascript
buscarTurnosPorDNI({ 
  dni: "35123456",
  estado: "Cancelado"
});
```

### Todos los turnos (admin):
```javascript
buscarTurnosPorDNI({ dni: "35123456" });
```

## 💬 RESPUESTAS SUGERIDAS

### Para 0 turnos:
```
"No tiene turnos registrados. ¿Desea solicitar uno?"
```

### Para 1 turno futuro:
```
"Su turno es el [DiaSemana] [fecha] a las [hora]."
```

### Para múltiples turnos:
```
"Tiene [cantidad] turnos próximos:
1. [fecha] [hora] - [estado]
2. [fecha] [hora] - [estado]"
```

### Para turno muy próximo (< 24hs):
```
"⚠️ Su turno es MAÑANA [fecha] a las [hora].
Recuerde [requisitos según obra social]."
```

## 🔍 CASOS ESPECIALES

### Turno duplicado:
Si el admin o paciente tiene 2 turnos el mismo día → Alertar

### Turno pasado sin estado:
Si `fecha < hoy` y `estado == "Confirmado"` → Posible error, actualizar a "No asistió"

### Múltiples turnos pendientes:
Si hay varios "Pendiente" → Sugerir confirmar o cancelar

---

**Nota:** Esta tool es fundamental para el flujo de modificación y cancelación de turnos. Siempre validar acceso en el agente paciente.

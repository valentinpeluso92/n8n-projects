# Tool: consultarDisponibilidadAgenda (Agente PACIENTE)

Consulta horarios disponibles en la agenda de Google Sheets filtrando por tipo de día específico. Solo accede a tipos de día para pacientes (PARTICULAR, PAMI_NUEVO, PAMI_VIEJO).

## 📋 PARÁMETROS

**OBLIGATORIOS:**
- `tipoDia` (string): Tipo de día según el tipo de paciente
  - Valores válidos: `"PARTICULAR"`, `"PAMI_NUEVO"`, `"PAMI_VIEJO"`
  - Ver sección "LÓGICA DE SELECCIÓN" para determinar cuál usar

**OPCIONALES:**
- `fechaDesde` (string): Fecha desde la cual buscar (formato DD/MM/AAAA)
  - Default: Hoy
  - Ejemplo: `"06/01/2025"`
  - Útil para buscar disponibilidad en semana específica

## 📤 RETORNA

### Caso 1: Éxito - Hay disponibilidad
```json
{
  "status": "success",
  "mensaje": "Tengo lugar el Lunes 06/01/2025 a las 9:00",
  "tipoDiaBuscado": "PAMI_NUEVO",
  "proximoTurno": {
    "fecha": "06/01/2025",
    "diaSemana": "Lunes",
    "hora": "9:00"
  },
  "disponibilidad": [
    {
      "fecha": "06/01/2025",
      "diaSemana": "Lunes",
      "horariosLibres": ["9:00", "9:20", "10:00", "10:40", "11:00"],
      "cantidadDisponibles": 5
    },
    {
      "fecha": "08/01/2025",
      "diaSemana": "Miércoles",
      "horariosLibres": ["8:40", "9:00", "11:20", "11:40"],
      "cantidadDisponibles": 4
    }
  ],
  "totalDiasDisponibles": 2,
  "totalHorariosDisponibles": 9
}
```

**El agente debe:**
- Leer `proximoTurno.fecha`, `proximoTurno.hora` y `proximoTurno.diaSemana`
- Responder: "Tengo lugar el Lunes 6/1 a las 9:00. ¿Le viene bien?"
- Si rechaza, ofrecer alternativas de `disponibilidad` array

### Caso 2: Éxito - Sin disponibilidad
```json
{
  "status": "success",
  "mensaje": "No hay horarios disponibles en los próximos días de este tipo",
  "tipoDiaBuscado": "PARTICULAR",
  "proximoTurno": null,
  "disponibilidad": [],
  "totalDiasDisponibles": 0,
  "totalHorariosDisponibles": 0
}
```

**El agente debe:**
- Informar que no hay disponibilidad
- Ofrecer derivar a secretaria para coordinar

### Caso 3: Error técnico
```json
{
  "status": "error",
  "mensaje": "Error al consultar la agenda. No se pudo acceder a Google Sheets.",
  "error": "Connection timeout"
}
```

**El agente debe:**
- NO continuar con el flujo normal
- Solicitar teléfono del paciente
- Derivar a secretaria con `derivarASecretaria`

### Caso 4: Error - Tipo de día inválido
```json
{
  "status": "error",
  "mensaje": "Tipo de día inválido. Válidos: PARTICULAR, PAMI_NUEVO, PAMI_VIEJO",
  "codigo": "TIPO_DIA_INVALIDO"
}
```

**El agente debe:**
- Esto NO debería ocurrir (validación en el agente)
- Revisar lógica de determinación de tipoDia

## 🎯 LÓGICA DE SELECCIÓN DE TIPO DE DÍA

### Determinar `tipoDia` según datos del paciente:

```javascript
function determinarTipoDia(obraSocial, esPrimeraVez, ultimaVisita) {
  // 1. Particular u OSDE
  if (obraSocial === "Particular" || obraSocial === "OSDE") {
    return "PARTICULAR";
  }
  
  // 2. Bebé (siempre PARTICULAR)
  if (esBebe) {
    return "PARTICULAR";
  }
  
  // 3. PAMI
  if (obraSocial === "PAMI") {
    // Primera vez en el consultorio
    if (esPrimeraVez) {
      return "PAMI_NUEVO";
    }
    
    // Ya vino antes, verificar cuándo
    if (ultimaVisita) {
      const fechaUltimaVisita = parseFecha(ultimaVisita); // DD/MM/AAAA
      const haceUnAno = new Date();
      haceUnAno.setFullYear(haceUnAno.getFullYear() - 1);
      
      // Si última visita fue hace más de 1 año
      if (fechaUltimaVisita < haceUnAno) {
        return "PAMI_NUEVO"; // Necesita orden de primera vez
      } else {
        return "PAMI_VIEJO"; // Es control
      }
    }
    
    // No sabemos última visita, asumir primera vez
    return "PAMI_NUEVO";
  }
  
  // Default: particular
  return "PARTICULAR";
}
```

### Tabla de decisión rápida:

| Obra Social | Primera Vez | Última Visita | → tipoDia |
|-------------|-------------|---------------|-----------|
| Particular  | -           | -             | `PARTICULAR` |
| OSDE        | -           | -             | `PARTICULAR` |
| PAMI        | ✅ SÍ       | -             | `PAMI_NUEVO` |
| PAMI        | ❌ NO       | > 1 año       | `PAMI_NUEVO` |
| PAMI        | ❌ NO       | < 1 año       | `PAMI_VIEJO` |
| Bebé        | -           | -             | `PARTICULAR` |

## 💡 EJEMPLOS DE USO COMPLETOS

### Ejemplo 1: Paciente Particular - Hay disponibilidad
```
Usuario: "Quiero solicitar un turno"
Agente: "¿Me dice su nombre completo?"
Usuario: "María González"
Agente: "¿Y su DNI?"
Usuario: "35123456"

[Llama: buscarPacientePorDNI({ dni: "35123456" })]
→ Retorna: { encontrado: false } // Es paciente nuevo

Agente: "¿Tiene obra social?"
Usuario: "Soy particular"

[Determina: tipoDia = "PARTICULAR"]

Agente: "¿Es su primera vez en el consultorio?"
Usuario: "Sí"

[Llama: consultarDisponibilidadAgenda({ 
  tipoDia: "PARTICULAR" 
})]

→ Retorna: {
    status: "success",
    proximoTurno: { fecha: "06/01/2025", diaSemana: "Lunes", hora: "9:00" },
    disponibilidad: [
      { fecha: "06/01/2025", horariosLibres: ["9:00", "9:20", "10:00"] },
      { fecha: "08/01/2025", horariosLibres: ["8:40", "11:00"] }
    ]
}

Agente: "Tengo lugar el Lunes 6/1 a las 9:00. ¿Le viene bien?"
Usuario: "Sí perfecto"

[Continuar con registrarTurno]
```

### Ejemplo 2: PAMI Primera vez - Hay disponibilidad
```
Usuario: "Necesito un turno"
Agente: "¿Su nombre?"
Usuario: "José Pérez"
Agente: "¿DNI?"
Usuario: "28999888"

[buscarPacientePorDNI → encontrado: false]

Agente: "¿Tiene obra social?"
Usuario: "PAMI"

[Determina: es primera vez → tipoDia = "PAMI_NUEVO"]

Agente: "Como tiene PAMI, ¿es su primera vez o hace más de un año que no viene?"
Usuario: "Primera vez"

Agente: "Va a necesitar:
⚠️ App de PAMI con código token
⚠️ Orden de primera consulta (código 429001)
¿Ya tiene ambas cosas?"
Usuario: "Sí, todo listo"

[Llama: consultarDisponibilidadAgenda({ 
  tipoDia: "PAMI_NUEVO" 
})]

→ Retorna: {
    status: "success",
    proximoTurno: { fecha: "07/01/2025", diaSemana: "Martes", hora: "9:00" }
}

Agente: "Tengo lugar el Martes 7/1 a las 9:00. ¿Le sirve?"
```

### Ejemplo 3: PAMI Recurrente (+1 año) - Es PAMI_NUEVO
```
Usuario: "Quiero turno"
[... captura datos...]
Usuario: "Tengo PAMI"

[Llama: buscarPacientePorDNI({ dni: "30555666" })]
→ Retorna: { 
    encontrado: true,
    paciente: { 
      ultima_visita: "10/11/2023"  // Hace más de 1 año
    }
}

[Calcula: ultima_visita hace +1 año → tipoDia = "PAMI_NUEVO"]

Agente: "Veo que hace más de un año que no viene.
         Va a necesitar orden de primera consulta del médico de cabecera.
         ¿Ya la tiene?"
Usuario: "Sí"

[Llama: consultarDisponibilidadAgenda({ 
  tipoDia: "PAMI_NUEVO" 
})]
```

### Ejemplo 4: PAMI Recurrente (menos de 1 año) - PAMI_VIEJO
```
[buscarPacientePorDNI retorna:]
{
  encontrado: true,
  paciente: { 
    ultima_visita: "15/07/2024"  // Hace 5 meses
  }
}

[Calcula: ultima_visita < 1 año → tipoDia = "PAMI_VIEJO"]

Agente: "Bienvenido/a de nuevo. Veo que vino en julio.
         Para el turno solo necesita la app de PAMI con el código.
         ¿La tiene?"
Usuario: "Sí"

[Llama: consultarDisponibilidadAgenda({ 
  tipoDia: "PAMI_VIEJO" 
})]
```

### Ejemplo 5: Sin disponibilidad
```
[Llama: consultarDisponibilidadAgenda({ tipoDia: "PARTICULAR" })]

→ Retorna: {
    status: "success",
    disponibilidad: [],
    totalHorariosDisponibles: 0
}

Agente: "No tengo turnos disponibles en los próximos días.
         ¿Me deja su teléfono? La secretaria lo llama para coordinar."
Usuario: "11-2345-6789"

[Llama: derivarASecretaria({
  nombre_completo: "María González",
  telefono: "11-2345-6789",
  dni: "35123456",
  motivo: "solicitar_turno",
  observaciones: "Sin disponibilidad para PARTICULAR en agenda",
  prioridad: "media"
})]

Agente: "✅ Su solicitud fue registrada.
         La secretaria lo contactará en el día para coordinar el turno."
```

### Ejemplo 6: Error técnico
```
[Llama: consultarDisponibilidadAgenda({ tipoDia: "PAMI_NUEVO" })]

→ Retorna: {
    status: "error",
    mensaje: "Error al consultar la agenda",
    error: "Connection timeout"
}

Agente: "Disculpe, tengo un problema técnico con la agenda.
         ¿Me deja su teléfono? La secretaria lo llama hoy para agendar."
Usuario: "11-9999-8888"

[Llama: derivarASecretaria({
  nombre_completo: "José Pérez",
  telefono: "11-9999-8888",
  dni: "28999888",
  motivo: "error_tecnico",
  observaciones: "Error al consultar agenda PAMI_NUEVO. Timeout en Google Sheets.",
  prioridad: "alta"
})]
```

### Ejemplo 7: Usuario rechaza primer horario
```
[consultarDisponibilidadAgenda retorna disponibilidad múltiple]

Agente: "Tengo lugar el Lunes 6/1 a las 9:00. ¿Le viene bien?"
Usuario: "No, muy temprano"

[Consultar array disponibilidad del resultado anterior]

Agente: "También tengo:
• Lunes 6/1 a las 10:00
• Lunes 6/1 a las 11:00
• Miércoles 8/1 a las 9:20

¿Alguno de estos le sirve?"
Usuario: "Sí, el miércoles 8 a las 9:20"

[Continuar con registrarTurno usando fecha/hora elegida]
```

## ⚠️ VALIDACIONES PRE-CONSULTA

### 1. Validar tipo de día antes de llamar:
```javascript
const TIPOS_VALIDOS_PACIENTE = ["PARTICULAR", "PAMI_NUEVO", "PAMI_VIEJO"];

function validarTipoDia(tipoDia) {
  if (!TIPOS_VALIDOS_PACIENTE.includes(tipoDia)) {
    return { 
      valido: false, 
      error: "Tipo de día inválido para agente paciente" 
    };
  }
  return { valido: true };
}
```

### 2. Validar fecha desde (si se proporciona):
```javascript
function validarFechaDesde(fechaDesde) {
  if (!fechaDesde) return { valido: true }; // Opcional
  
  const fecha = parseFecha(fechaDesde); // DD/MM/AAAA
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  
  if (fecha < hoy) {
    return { valido: false, error: "Fecha debe ser hoy o futura" };
  }
  
  return { valido: true };
}
```

## 🔄 FLUJO COMPLETO

```
1. Capturar datos del paciente:
   - Nombre completo
   - DNI
   - Obra social

2. Buscar paciente en BD:
   [buscarPacientePorDNI({ dni })]
   
3. Determinar tipoDia:
   ├─ Si Particular/OSDE → "PARTICULAR"
   ├─ Si PAMI primera vez → "PAMI_NUEVO"
   ├─ Si PAMI + ultima_visita > 1 año → "PAMI_NUEVO"
   ├─ Si PAMI + ultima_visita < 1 año → "PAMI_VIEJO"
   └─ Si bebé → "PARTICULAR"

4. Validar requisitos PAMI (si aplica):
   - App con código token
   - Orden de primera consulta (si PAMI_NUEVO)

5. ✅ Llamar consultarDisponibilidadAgenda({ tipoDia })

6. Evaluar resultado:
   ├─ Si status "error" → derivarASecretaria
   ├─ Si disponibilidad vacía → derivarASecretaria
   └─ Si hay disponibilidad → Ofrecer proximoTurno

7. Usuario elige horario:
   ├─ Acepta proximoTurno → registrarTurno
   └─ Rechaza → Ofrecer alternativas de array disponibilidad

8. Confirmar y registrar turno
```

## 📊 ESTRUCTURA GOOGLE SHEETS

**Hoja:** `Agenda`

**Columnas:**
- `id`: string (ej: "agenda_06012025")
- `fecha`: string DD/MM/AAAA (ej: "06/01/2025")
- `tipo_dia`: string (`PARTICULAR`, `PAMI_NUEVO`, `PAMI_VIEJO`, etc.)
- `horarios_bloqueados`: string separado por comas (ej: "10:20,12:00")

**Query lógica:**
```javascript
// 1. Filtrar por tipo_dia
const diasDelTipo = agenda.filter(row => row.json.tipo_dia === tipoDia);

// 2. Filtrar solo fechas futuras
const hoy = new Date();
const diasFuturos = diasDelTipo.filter(row => {
  const fechaDia = parseFecha(row.json.fecha);
  return fechaDia >= hoy;
});

// 3. Para cada día, calcular horarios libres
const horariosStandard = ["8:40", "9:00", "9:20", "9:40", "10:00", 
                          "10:40", "11:00", "11:20", "11:40"];

const disponibilidad = diasFuturos.map(dia => {
  const bloqueados = dia.json.horarios_bloqueados.split(',');
  const turnosOcupados = obtenerTurnosDelDia(dia.json.fecha);
  
  const horariosLibres = horariosStandard.filter(hora => {
    return !bloqueados.includes(hora) && 
           !turnosOcupados.includes(hora);
  });
  
  return {
    fecha: dia.json.fecha,
    diaSemana: obtenerDiaSemana(dia.json.fecha),
    horariosLibres: horariosLibres,
    cantidadDisponibles: horariosLibres.length
  };
});

// 4. Filtrar días con al menos 1 horario libre
const diasConDisponibilidad = disponibilidad.filter(d => d.cantidadDisponibles > 0);

// 5. Determinar próximo turno (primer horario del primer día)
const proximoTurno = diasConDisponibilidad.length > 0 ? {
  fecha: diasConDisponibilidad[0].fecha,
  diaSemana: diasConDisponibilidad[0].diaSemana,
  hora: diasConDisponibilidad[0].horariosLibres[0]
} : null;
```

## 🚫 ERRORES COMUNES

❌ **NO hacer:**
```javascript
// Llamar sin determinar tipoDia primero
consultarDisponibilidadAgenda({ tipoDia: "PAMI" }); // ¡Incorrecto! No existe "PAMI"

// Usar tipos administrativos
consultarDisponibilidadAgenda({ tipoDia: "CIRUGIA" }); // ¡Solo admin!

// No validar resultado antes de usar
const turno = resultado.proximoTurno; // Puede ser null!

// Llamar múltiples veces en el mismo flujo
consultarDisponibilidadAgenda({ tipoDia: "PARTICULAR" });
// ... usuario rechaza ...
consultarDisponibilidadAgenda({ tipoDia: "PARTICULAR" }); // ¡Redundante! Usar array disponibilidad
```

✅ **SÍ hacer:**
```javascript
// 1. Determinar tipoDia correctamente
const tipoDia = determinarTipoDia(obraSocial, esPrimeraVez, ultimaVisita);

// 2. Validar antes de llamar
const validacion = validarTipoDia(tipoDia);
if (!validacion.valido) {
  return error(validacion.error);
}

// 3. Llamar UNA vez
const resultado = consultarDisponibilidadAgenda({ tipoDia });

// 4. Validar resultado
if (resultado.status === "error") {
  return derivarASecretaria({ motivo: "error_tecnico" });
}

// 5. Verificar disponibilidad
if (!resultado.proximoTurno || resultado.totalHorariosDisponibles === 0) {
  return derivarASecretaria({ motivo: "sin_disponibilidad" });
}

// 6. Usar proximoTurno
const { fecha, hora, diaSemana } = resultado.proximoTurno;
responder(`Tengo lugar el ${diaSemana} ${fecha} a las ${hora}`);

// 7. Si rechaza, usar array disponibilidad (mismo resultado)
if (rechaza) {
  const alternativas = resultado.disponibilidad.slice(0, 3); // Primeras 3
  mostrarAlternativas(alternativas);
}
```

## 💬 RESPUESTAS SUGERIDAS

### Hay disponibilidad:
```
"Tengo lugar el [DiaSemana] [fecha] a las [hora]. ¿Le viene bien?"
```

### Múltiples opciones:
```
"Tengo varios horarios disponibles:
• [DiaSemana] [fecha] a las [hora]
• [DiaSemana] [fecha] a las [hora]
• [DiaSemana] [fecha] a las [hora]

¿Cuál prefiere?"
```

### Sin disponibilidad:
```
"No tengo turnos disponibles en los próximos días.
¿Me deja su teléfono? La secretaria lo llama para coordinar."
```

### Error técnico:
```
"Disculpe, tengo un problema técnico con la agenda.
¿Me deja su teléfono? La secretaria lo llama hoy para agendar su turno."
```

## 📝 NOTAS IMPORTANTES

- 🔄 **Usar UNA sola vez** por solicitud de turno
- ✅ **Validar tipoDia** antes de llamar
- 📅 **Solo fechas futuras** en resultado
- 🚫 **NO usar tipos admin** (CIRUGIA, CONTROL, MEDICION, DIA_LIBRE)
- 💾 **Guardar resultado** en memoria del agente para no volver a llamar
- 📊 **Array disponibilidad** contiene TODAS las opciones, usar si usuario rechaza
- ⚠️ **Si error** → SIEMPRE derivar a secretaria
- 📱 **Capturar teléfono** antes de derivar

---

**IMPORTANTE:** Determinar correctamente el `tipoDia` es CRÍTICO. Un error aquí significa ofrecer turnos del tipo equivocado de día.

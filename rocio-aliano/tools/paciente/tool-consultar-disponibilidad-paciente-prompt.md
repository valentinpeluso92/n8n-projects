# Tool: consultarDisponibilidadAgenda (Agente PACIENTE)

Consulta horarios disponibles en la agenda de Google Sheets filtrando por tipo de día específico. Solo accede a tipos de día para pacientes (PARTICULAR, PAMI_NUEVO, PAMI_VIEJO).

## 📋 PARÁMETROS

**OBLIGATORIOS:**
- `tipo_dia` (string): Tipo de día según el tipo de paciente
  - Valores válidos: `"PARTICULAR"`, `"PAMI_NUEVO"`, `"PAMI_VIEJO"`
  - Ver sección "LÓGICA DE SELECCIÓN" para determinar cuál usar

**OPCIONALES:**
- `fecha_desde` (string): Fecha desde la cual buscar (formato DD/MM/AAAA)
  - Default: Hoy
  - Ejemplo: `"06/01/2025"`
  - Útil para buscar disponibilidad en semana específica

## 📤 RETORNA

### Caso 1: Éxito - Hay disponibilidad
```json
{
  "status": "success",
  "mensaje": "Tengo lugar el Lunes 06/01/2025 a las 9:00",
  "tipo_dia_buscado": "PAMI_NUEVO",
  "proximo_turno": {
    "fecha": "06/01/2025",
    "dia_semana": "Lunes",
    "hora": "9:00"
  },
  "disponibilidad": [
    {
      "fecha": "06/01/2025",
      "dia_semana": "Lunes",
      "horarios_libres": ["9:00", "9:20", "10:00", "10:40", "11:00"],
      "cantidad_disponibles": 5
    },
    {
      "fecha": "08/01/2025",
      "dia_semana": "Miércoles",
      "horarios_libres": ["8:40", "9:00", "11:20", "11:40"],
      "cantidad_disponibles": 4
    }
  ],
  "total_dias_disponibles": 2,
  "total_horarios_disponibles": 9
}
```

**El agente debe:**
- Leer `proximo_turno.fecha`, `proximo_turno.hora` y `proximo_turno.dia_semana`
- Responder: "Tengo lugar el Lunes 6/1 a las 9:00. ¿Le viene bien?"
- Si rechaza, ofrecer alternativas de `disponibilidad` array

### Caso 2: Éxito - Sin disponibilidad
```json
{
  "status": "success",
  "mensaje": "No hay horarios disponibles en los próximos días de este tipo",
  "tipo_dia_buscado": "PARTICULAR",
  "proximo_turno": null,
  "disponibilidad": [],
  "total_dias_disponibles": 0,
  "total_horarios_disponibles": 0
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

### Determinar `tipo_dia` según datos del paciente:

```javascript
function determinarTipoDia(obra_social, es_primera_vez, ultima_visita) {
  // 1. Particular u OSDE
  if (obra_social === "Particular" || obra_social === "OSDE") {
    return "PARTICULAR";
  }
  
  // 2. Bebé (siempre PARTICULAR)
  if (es_bebe) {
    return "PARTICULAR";
  }
  
  // 3. PAMI
  if (obra_social === "PAMI") {
    // Primera vez en el consultorio
    if (es_primera_vez) {
      return "PAMI_NUEVO";
    }
    
    // Ya vino antes, verificar cuándo
    if (ultima_visita) {
      const fecha_ultima_visita = parseFecha(ultima_visita); // DD/MM/AAAA
      const hace_un_ano = new Date();
      hace_un_ano.setFullYear(hace_un_ano.getFullYear() - 1);
      
      // Si última visita fue hace más de 1 año
      if (fecha_ultima_visita < hace_un_ano) {
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

| Obra Social | Primera Vez | Última Visita | → tipo_dia |
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

[Determina: tipo_dia = "PARTICULAR"]

Agente: "¿Es su primera vez en el consultorio?"
Usuario: "Sí"

[Llama: consultarDisponibilidadAgenda({ 
  tipo_dia: "PARTICULAR" 
})]

→ Retorna: {
    status: "success",
    proximo_turno: { fecha: "06/01/2025", dia_semana: "Lunes", hora: "9:00" },
    disponibilidad: [
      { fecha: "06/01/2025", horarios_libres: ["9:00", "9:20", "10:00"] },
      { fecha: "08/01/2025", horarios_libres: ["8:40", "11:00"] }
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

[Determina: es primera vez → tipo_dia = "PAMI_NUEVO"]

Agente: "Como tiene PAMI, ¿es su primera vez o hace más de un año que no viene?"
Usuario: "Primera vez"

Agente: "Va a necesitar:
⚠️ App de PAMI con código token
⚠️ Orden de primera consulta (código 429001)
¿Ya tiene ambas cosas?"
Usuario: "Sí, todo listo"

[Llama: consultarDisponibilidadAgenda({ 
  tipo_dia: "PAMI_NUEVO" 
})]

→ Retorna: {
    status: "success",
    proximo_turno: { fecha: "07/01/2025", dia_semana: "Martes", hora: "9:00" }
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

[Calcula: ultima_visita hace +1 año → tipo_dia = "PAMI_NUEVO"]

Agente: "Veo que hace más de un año que no viene.
         Va a necesitar orden de primera consulta del médico de cabecera.
         ¿Ya la tiene?"
Usuario: "Sí"

[Llama: consultarDisponibilidadAgenda({ 
  tipo_dia: "PAMI_NUEVO" 
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

[Calcula: ultima_visita < 1 año → tipo_dia = "PAMI_VIEJO"]

Agente: "Bienvenido/a de nuevo. Veo que vino en julio.
         Para el turno solo necesita la app de PAMI con el código.
         ¿La tiene?"
Usuario: "Sí"

[Llama: consultarDisponibilidadAgenda({ 
  tipo_dia: "PAMI_VIEJO" 
})]
```

### Ejemplo 5: Sin disponibilidad
```
[Llama: consultarDisponibilidadAgenda({ tipo_dia: "PARTICULAR" })]

→ Retorna: {
    status: "success",
    disponibilidad: [],
    total_horarios_disponibles: 0
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
[Llama: consultarDisponibilidadAgenda({ tipo_dia: "PAMI_NUEVO" })]

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

function validarTipoDia(tipo_dia) {
  if (!TIPOS_VALIDOS_PACIENTE.includes(tipo_dia)) {
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
function validarFechaDesde(fecha_desde) {
  if (!fecha_desde) return { valido: true }; // Opcional
  
  const fecha = parseFecha(fecha_desde); // DD/MM/AAAA
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
   
3. Determinar tipo_dia:
   ├─ Si Particular/OSDE → "PARTICULAR"
   ├─ Si PAMI primera vez → "PAMI_NUEVO"
   ├─ Si PAMI + ultima_visita > 1 año → "PAMI_NUEVO"
   ├─ Si PAMI + ultima_visita < 1 año → "PAMI_VIEJO"
   └─ Si bebé → "PARTICULAR"

4. Validar requisitos PAMI (si aplica):
   - App con código token
   - Orden de primera consulta (si PAMI_NUEVO)

5. ✅ Llamar consultarDisponibilidadAgenda({ tipo_dia })

6. Evaluar resultado:
   ├─ Si status "error" → derivarASecretaria
   ├─ Si disponibilidad vacía → derivarASecretaria
   └─ Si hay disponibilidad → Ofrecer proximo_turno

7. Usuario elige horario:
   ├─ Acepta proximo_turno → registrarTurno
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
const dias_del_tipo = agenda.filter(row => row.json.tipo_dia === tipo_dia);

// 2. Filtrar solo fechas futuras
const hoy = new Date();
const dias_futuros = dias_del_tipo.filter(row => {
  const fecha_dia = parseFecha(row.json.fecha);
  return fecha_dia >= hoy;
});

// 3. Para cada día, calcular horarios libres
const horarios_standard = ["8:40", "9:00", "9:20", "9:40", "10:00", 
                          "10:40", "11:00", "11:20", "11:40"];

const disponibilidad = dias_futuros.map(dia => {
  const bloqueados = dia.json.horarios_bloqueados.split(',');
  const turnos_ocupados = obtenerTurnosDelDia(dia.json.fecha);
  
  const horarios_libres = horarios_standard.filter(hora => {
    return !bloqueados.includes(hora) && 
           !turnos_ocupados.includes(hora);
  });
  
  return {
    fecha: dia.json.fecha,
    dia_semana: obtenerDiaSemana(dia.json.fecha),
    horarios_libres: horarios_libres,
    cantidad_disponibles: horarios_libres.length
  };
});

// 4. Filtrar días con al menos 1 horario libre
const dias_con_disponibilidad = disponibilidad.filter(d => d.cantidad_disponibles > 0);

// 5. Determinar próximo turno (primer horario del primer día)
const proximo_turno = dias_con_disponibilidad.length > 0 ? {
  fecha: dias_con_disponibilidad[0].fecha,
  dia_semana: dias_con_disponibilidad[0].dia_semana,
  hora: dias_con_disponibilidad[0].horarios_libres[0]
} : null;
```

## 🚫 ERRORES COMUNES

❌ **NO hacer:**
```javascript
// Llamar sin determinar tipo_dia primero
consultarDisponibilidadAgenda({ tipo_dia: "PAMI" }); // ¡Incorrecto! No existe "PAMI"

// Usar tipos administrativos
consultarDisponibilidadAgenda({ tipo_dia: "CIRUGIA" }); // ¡Solo admin!

// No validar resultado antes de usar
const turno = resultado.proximo_turno; // Puede ser null!

// Llamar múltiples veces en el mismo flujo
consultarDisponibilidadAgenda({ tipo_dia: "PARTICULAR" });
// ... usuario rechaza ...
consultarDisponibilidadAgenda({ tipo_dia: "PARTICULAR" }); // ¡Redundante! Usar array disponibilidad
```

✅ **SÍ hacer:**
```javascript
// 1. Determinar tipo_dia correctamente
const tipo_dia = determinarTipoDia(obra_social, es_primera_vez, ultima_visita);

// 2. Validar antes de llamar
const validacion = validarTipoDia(tipo_dia);
if (!validacion.valido) {
  return error(validacion.error);
}

// 3. Llamar UNA vez
const resultado = consultarDisponibilidadAgenda({ tipo_dia });

// 4. Validar resultado
if (resultado.status === "error") {
  return derivarASecretaria({ motivo: "error_tecnico" });
}

// 5. Verificar disponibilidad
if (!resultado.proximo_turno || resultado.total_horarios_disponibles === 0) {
  return derivarASecretaria({ motivo: "sin_disponibilidad" });
}

// 6. Usar proximo_turno
const { fecha, hora, dia_semana } = resultado.proximo_turno;
responder(`Tengo lugar el ${dia_semana} ${fecha} a las ${hora}`);

// 7. Si rechaza, usar array disponibilidad (mismo resultado)
if (rechaza) {
  const alternativas = resultado.disponibilidad.slice(0, 3); // Primeras 3
  mostrarAlternativas(alternativas);
}
```

## 💬 RESPUESTAS SUGERIDAS

### Hay disponibilidad:
```
"Tengo lugar el [dia_semana] [fecha] a las [hora]. ¿Le viene bien?"
```

### Múltiples opciones:
```
"Tengo varios horarios disponibles:
• [dia_semana] [fecha] a las [hora]
• [dia_semana] [fecha] a las [hora]
• [dia_semana] [fecha] a las [hora]

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
- ✅ **Validar tipo_dia** antes de llamar
- 📅 **Solo fechas futuras** en resultado
- 🚫 **NO usar tipos admin** (CIRUGIA, CONTROL, MEDICION, DIA_LIBRE)
- 💾 **Guardar resultado** en memoria del agente para no volver a llamar
- 📊 **Array disponibilidad** contiene TODAS las opciones, usar si usuario rechaza
- ⚠️ **Si error** → SIEMPRE derivar a secretaria
- 📱 **Capturar teléfono** antes de derivar

---

**IMPORTANTE:** Determinar correctamente el `tipo_dia` es CRÍTICO. Un error aquí significa ofrecer turnos del tipo equivocado de día.

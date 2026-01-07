# Tool: consultarDisponibilidadAgenda (Agente ADMINISTRADOR)

Consulta horarios disponibles en la agenda de Google Sheets filtrando por tipo de día específico. Acceso administrativo completo a todos los 7 tipos de día.

## 🎯 CUÁNDO Y POR QUÉ USAR ESTA TOOL

**Llama a esta tool cuando necesites:**
- Consultar disponibilidad para agendar un turno (cualquier tipo: PARTICULAR, PAMI, CIRUGIA, CONTROL, etc.)
- Verificar horarios disponibles antes de registrar o modificar turnos
- Planificar agenda futura o revisar disponibilidad en rangos de fechas específicos
- Acceder a tipos de día administrativos (CIRUGIA, CONTROL, MEDICION, DIA_LIBRE)

**Ventaja del admin:** Acceso a TODOS los 7 tipos de día, incluyendo los administrativos que pacientes no pueden ver.

## 📋 PARÁMETROS

**OBLIGATORIOS:**
- `tipoDia` (string): Tipo de día a consultar
  - Valores válidos: `"PARTICULAR"`, `"PAMI_NUEVO"`, `"PAMI_VIEJO"`, `"CIRUGIA"`, `"CONTROL"`, `"MEDICION"`, `"DIA_LIBRE"`

**OPCIONALES:**
- `fechaDesde` (string): Fecha desde la cual buscar (formato DD/MM/AAAA)
  - Default: Hoy
  - Ejemplo: `"06/01/2025"`
  - Útil para planificación futura

- `fechaHasta` (string): Fecha límite de búsqueda (formato DD/MM/AAAA)
  - Solo para admin
  - Útil para reportes de disponibilidad en rango específico
  - Ejemplo: `"31/01/2025"`

## 📤 RETORNA

### Caso 1: Éxito - Hay disponibilidad
```json
{
  "status": "success",
  "mensaje": "Se encontraron 3 días con disponibilidad",
  "tipoDiaBuscado": "PARTICULAR",
  "proximoTurno": {
    "fecha": "06/01/2025",
    "diaSemana": "Lunes",
    "hora": "9:00"
  },
  "disponibilidad": [
    {
      "fecha": "06/01/2025",
      "diaSemana": "Lunes",
      "horariosLibres": ["9:00", "9:20", "10:00", "10:40", "11:00", "11:20"],
      "horariosOcupados": ["8:40", "9:40"],
      "horariosBloqueados": ["12:00"],
      "cantidadDisponibles": 6,
      "cantidadOcupados": 2,
      "cantidadBloqueados": 1
    },
    {
      "fecha": "08/01/2025",
      "diaSemana": "Miércoles",
      "horariosLibres": ["8:40", "9:00", "11:20", "11:40"],
      "horariosOcupados": ["9:20", "9:40", "10:00", "10:40"],
      "horariosBloqueados": ["11:00"],
      "cantidadDisponibles": 4,
      "cantidadOcupados": 4,
      "cantidadBloqueados": 1
    },
    {
      "fecha": "10/01/2025",
      "diaSemana": "Viernes",
      "horariosLibres": ["8:40", "9:00", "9:20", "10:00", "10:40", "11:00", "11:20", "11:40"],
      "horariosOcupados": ["9:40"],
      "horariosBloqueados": [],
      "cantidadDisponibles": 8,
      "cantidadOcupados": 1,
      "cantidadBloqueados": 0
    }
  ],
  "totalDiasDisponibles": 3,
  "totalHorariosDisponibles": 18,
  "totalDiasPeriodo": 5,
  "ocupacionPromedio": "47%"
}
```

**El agente admin obtiene información detallada:**
- Horarios libres, ocupados Y bloqueados por día
- Estadísticas de ocupación
- Total de días en el período

### Caso 2: Éxito - Tipo administrativo (CIRUGIA)
```json
{
  "status": "success",
  "mensaje": "Se encontraron 2 días de cirugía con disponibilidad",
  "tipoDiaBuscado": "CIRUGIA",
  "proximoTurno": {
    "fecha": "07/01/2025",
    "diaSemana": "Martes",
    "hora": "8:40"
  },
  "disponibilidad": [
    {
      "fecha": "07/01/2025",
      "diaSemana": "Martes",
      "horariosLibres": ["8:40", "9:00", "9:20"],
      "horariosOcupados": ["9:40", "10:00"],
      "horariosBloqueados": ["10:20", "10:40", "11:00", "11:20", "11:40"],
      "cantidadDisponibles": 3,
      "cantidadOcupados": 2,
      "cantidadBloqueados": 5
    },
    {
      "fecha": "14/01/2025",
      "diaSemana": "Martes",
      "horariosLibres": ["8:40", "9:00", "9:20", "9:40", "10:00"],
      "horariosOcupados": [],
      "horariosBloqueados": ["10:20", "10:40", "11:00", "11:20", "11:40"],
      "cantidadDisponibles": 5,
      "cantidadOcupados": 0,
      "cantidadBloqueados": 5
    }
  ],
  "totalDiasDisponibles": 2,
  "totalHorariosDisponibles": 8
}
```

### Caso 3: Éxito - Sin disponibilidad
```json
{
  "status": "success",
  "mensaje": "No hay horarios disponibles para PAMI_NUEVO en el período consultado",
  "tipoDiaBuscado": "PAMI_NUEVO",
  "proximoTurno": null,
  "disponibilidad": [],
  "totalDiasDisponibles": 0,
  "totalHorariosDisponibles": 0,
  "razon": "Todos los días PAMI_NUEVO están completos o bloqueados"
}
```

### Caso 4: Éxito - Reporte de rango (con fechaHasta)
```json
{
  "status": "success",
  "mensaje": "Reporte de disponibilidad del 06/01/2025 al 31/01/2025",
  "tipoDiaBuscado": "PARTICULAR",
  "proximoTurno": { ... },
  "disponibilidad": [ ... ],
  "totalDiasDisponibles": 12,
  "totalHorariosDisponibles": 85,
  "totalDiasPeriodo": 20,
  "ocupacionPromedio": "68%",
  "rangoConsultado": {
    "desde": "06/01/2025",
    "hasta": "31/01/2025",
    "dias": 26
  }
}
```

### Caso 5: Error técnico
```json
{
  "status": "error",
  "mensaje": "Error al consultar la agenda. No se pudo acceder a Google Sheets.",
  "error": "Connection timeout",
  "codigo": "ERROR_CONEXION"
}
```

### Caso 6: Error - Tipo de día inválido
```json
{
  "status": "error",
  "mensaje": "Tipo de día inválido",
  "codigo": "TIPO_DIA_INVALIDO",
  "tipoDiaRecibido": "PAMI",
  "tiposValidos": ["PARTICULAR", "PAMI_NUEVO", "PAMI_VIEJO", "CIRUGIA", "CONTROL", "MEDICION", "DIA_LIBRE"]
}
```

## 🎯 TIPOS DE DÍA - USO ADMINISTRATIVO

### Tipos para Pacientes (iguales que agente paciente):

**`PARTICULAR`** - Días para pacientes particulares, OSDE, bebés
- Alta demanda
- Horarios flexibles
- Sin requisitos especiales

**`PAMI_NUEVO`** - Días para PAMI primera vez o +1 año
- Requiere orden de primera consulta
- Más tiempo de consulta
- Menor rotación

**`PAMI_VIEJO`** - Días para PAMI recurrentes
- Solo app de PAMI necesaria
- Consultas más rápidas
- Mayor rotación

### Tipos Administrativos (solo admin):

**`CIRUGIA`** - Días reservados para cirugías
- Horarios largos bloqueados
- Solo para registrar cirugías
- Planificación especial

**`CONTROL`** - Días de control post-operatorio
- Seguimiento de cirugías
- Turnos más cortos
- Prioridad para post-operados

**`MEDICION`** - Días de estudios especiales
- OCT, Campo Visual, etc.
- Equipamiento especial
- Requiere técnico

**`DIA_LIBRE`** - Consultorio cerrado
- No hay atención
- Feriados, vacaciones
- Útil para planificación

## 💡 EJEMPLOS DE USO COMPLETOS

### Ejemplo 1: Registrar turno para paciente particular
```
Admin: "Registrar turno para Roberto García, particular"

[Determina: tipoDia = "PARTICULAR"]

[Llama: consultarDisponibilidadAgenda({ 
  tipoDia: "PARTICULAR" 
})]

→ Retorna: {
    status: "success",
    proximoTurno: { fecha: "06/01/2025", hora: "9:00" },
    disponibilidad: [
      { fecha: "06/01/2025", horariosLibres: ["9:00", "10:00", "11:00"] },
      { fecha: "08/01/2025", horariosLibres: ["9:00", "10:40"] }
    ]
}

Agente: "Disponibilidad PARTICULAR:
         • Lunes 6/1: 9:00, 10:00, 11:00
         • Miércoles 8/1: 9:00, 10:40
         
         ¿Qué horario prefiere para Roberto García?"

Admin: "Lunes 6/1 a las 9:00"

[Continuar con registrarTurnoAdmin]
```

### Ejemplo 2: Ver disponibilidad de días de cirugía
```
Admin: "¿Qué días de cirugía hay libres este mes?"

[Llama: consultarDisponibilidadAgenda({ 
  tipoDia: "CIRUGIA",
  fechaDesde: "01/01/2025",
  fechaHasta: "31/01/2025"
})]

→ Retorna: {
    status: "success",
    tipoDiaBuscado: "CIRUGIA",
    disponibilidad: [
      { 
        fecha: "07/01/2025", 
        horariosLibres: ["8:40", "9:00", "9:20"],
        cantidadDisponibles: 3
      },
      { 
        fecha: "14/01/2025", 
        horariosLibres: ["8:40", "9:00", "9:20", "9:40"],
        cantidadDisponibles: 4
      },
      { 
        fecha: "21/01/2025", 
        horariosLibres: ["8:40", "9:00"],
        cantidadDisponibles: 2
      }
    ],
    totalDiasDisponibles: 3,
    totalHorariosDisponibles: 9
}

Agente: "📊 Disponibilidad de CIRUGÍA - Enero 2025
         
         ✅ 3 días con disponibilidad
         📅 Total: 9 horarios libres
         
         • Martes 7/1: 3 horarios (8:40, 9:00, 9:20)
         • Martes 14/1: 4 horarios
         • Martes 21/1: 2 horarios
         
         ¿Para qué fecha necesita agendar la cirugía?"
```

### Ejemplo 3: Verificar ocupación de PAMI
```
Admin: "¿Cuántos horarios libres hay para PAMI Nuevo?"

[Llama: consultarDisponibilidadAgenda({ 
  tipoDia: "PAMI_NUEVO" 
})]

→ Retorna: {
    status: "success",
    totalDiasDisponibles: 4,
    totalHorariosDisponibles: 15,
    ocupacionPromedio: "55%",
    disponibilidad: [ ... ]
}

Agente: "📊 Estadísticas PAMI_NUEVO:
         
         ✅ 4 días disponibles
         📅 15 horarios libres
         📈 Ocupación: 55%
         
         Próxima disponibilidad: Martes 7/1 a las 9:00"
```

### Ejemplo 4: Planificar próxima semana
```
Admin: "Mostrame la disponibilidad general de la próxima semana"

[Hacer múltiples consultas por tipo:]

consultarDisponibilidadAgenda({ 
  tipoDia: "PARTICULAR",
  fechaDesde: "06/01/2025",
  fechaHasta: "10/01/2025"
})

consultarDisponibilidadAgenda({ 
  tipoDia: "PAMI_NUEVO",
  fechaDesde: "06/01/2025",
  fechaHasta: "10/01/2025"
})

consultarDisponibilidadAgenda({ 
  tipoDia: "PAMI_VIEJO",
  fechaDesde: "06/01/2025",
  fechaHasta: "10/01/2025"
})

→ Consolidar resultados

Agente: "📊 Disponibilidad Semana 06/01 - 10/01:
         
         PARTICULAR:
         • 12 horarios libres (60% ocupación)
         
         PAMI_NUEVO:
         • 8 horarios libres (70% ocupación)
         
         PAMI_VIEJO:
         • 10 horarios libres (55% ocupación)
         
         CIRUGIA:
         • 1 día: Martes 7/1 (3 horarios)
         
         Total: 33 horarios disponibles"
```

### Ejemplo 5: Buscar slot para urgencia
```
Admin: "Necesito ubicar una urgencia HOY"

[Llama: consultarDisponibilidadAgenda({ 
  tipoDia: "PARTICULAR",
  fechaDesde: "31/12/2024"  // Hoy
})]

→ Retorna: {
    disponibilidad: [
      {
        fecha: "31/12/2024",
        horariosLibres: ["11:00", "11:20"],
        cantidadDisponibles: 2
      }
    ]
}

Agente: "⚠️ Disponibilidad HOY (31/12):
         
         Horarios libres:
         • 11:00
         • 11:20
         
         ¿Desea crear sobreturno o usar uno de estos?"

Admin: "11:00"

[registrarTurnoAdmin con forzar_horario si es necesario]
```

### Ejemplo 6: Sin disponibilidad para tipo específico
```
Admin: "Buscar turno PAMI Viejo para esta semana"

[Llama: consultarDisponibilidadAgenda({ 
  tipoDia: "PAMI_VIEJO",
  fechaDesde: "30/12/2024",
  fechaHasta: "03/01/2025"
})]

→ Retorna: {
    status: "success",
    totalHorariosDisponibles: 0,
    disponibilidad: []
}

Agente: "❌ No hay disponibilidad PAMI_VIEJO esta semana.
         
         Opciones:
         1. Buscar semana siguiente
         2. Crear sobreturno
         3. Registrar en día PARTICULAR (si es urgente)
         
         ¿Qué prefiere?"
```

### Ejemplo 7: Consultar día específico bloqueado
```
Admin: "Ver disponibilidad del 1 de enero"

[Llama: consultarDisponibilidadAgenda({ 
  tipoDia: "DIA_LIBRE",  // 1/1 es feriado
  fechaDesde: "01/01/2025",
  fechaHasta: "01/01/2025"
})]

→ Retorna: {
    status: "success",
    disponibilidad: [
      {
        fecha: "01/01/2025",
        horariosLibres: [],
        horariosBloqueados: ["Todos bloqueados"],
        cantidadDisponibles: 0
      }
    ]
}

Agente: "🚫 01/01/2025 es DÍA LIBRE
         Consultorio cerrado (Año Nuevo)
         
         Próxima disponibilidad: 02/01/2025"
```

## ⚙️ VALIDACIONES ADMIN

### Validar tipo de día:
```javascript
const TIPOS_VALIDOS_ADMIN = [
  "PARTICULAR", 
  "PAMI_NUEVO", 
  "PAMI_VIEJO", 
  "CIRUGIA", 
  "CONTROL", 
  "MEDICION", 
  "DIA_LIBRE"
];

function validarTipoDiaAdmin(tipoDia) {
  if (!TIPOS_VALIDOS_ADMIN.includes(tipoDia)) {
    return { 
      valido: false, 
      error: `Tipo inválido. Válidos: ${TIPOS_VALIDOS_ADMIN.join(', ')}` 
    };
  }
  return { valido: true };
}
```

### Validar rango de fechas:
```javascript
function validarRangoFechas(fechaDesde, fechaHasta) {
  if (!fechaHasta) return { valido: true }; // Opcional
  
  const desde = parseFecha(fechaDesde || obtenerFechaHoy());
  const hasta = parseFecha(fechaHasta);
  
  if (hasta < desde) {
    return { 
      valido: false, 
      error: "fechaHasta debe ser posterior a fechaDesde" 
    };
  }
  
  // Límite máximo de rango (ej: 3 meses)
  const diferenciaDias = (hasta - desde) / (1000 * 60 * 60 * 24);
  if (diferenciaDias > 90) {
    return { 
      valido: false, 
      error: "Rango máximo: 90 días" 
    };
  }
  
  return { valido: true };
}
```

## 🔄 FLUJO ADMIN

```
1. Admin solicita consultar disponibilidad

2. Determinar propósito:
   ├─ Registrar turno para paciente → Usar tipo según paciente
   ├─ Planificar cirugía → "CIRUGIA"
   ├─ Ver carga de trabajo → Consultar múltiples tipos
   └─ Reporte de período → Usar fechaHasta

3. Validar parámetros

4. ✅ Llamar consultarDisponibilidadAgenda({ tipoDia, fechaDesde?, fechaHasta? })

5. Evaluar resultado:
   ├─ Si error → Reportar problema técnico
   ├─ Si sin disponibilidad → Ofrecer alternativas (otros tipos, sobreturnos)
   └─ Si hay disponibilidad → Mostrar opciones detalladas

6. Admin elige acción:
   ├─ Registrar turno → registrarTurnoAdmin
   ├─ Ver otro tipo → Consultar nuevamente
   ├─ Crear sobreturno → forzar_horario: true
   └─ Solo info → Finalizar
```

## 📊 CASOS ESPECIALES ADMIN

### Consulta para reporte de ocupación:
```javascript
// Obtener estadísticas completas de un período
async function reporteOcupacion(fechaDesde, fechaHasta) {
  const tipos = ["PARTICULAR", "PAMI_NUEVO", "PAMI_VIEJO"];
  const resultados = {};
  
  for (const tipo of tipos) {
    const resultado = await consultarDisponibilidadAgenda({
      tipoDia: tipo,
      fechaDesde,
      fechaHasta
    });
    
    resultados[tipo] = {
      diasDisponibles: resultado.totalDiasDisponibles,
      horariosLibres: resultado.totalHorariosDisponibles,
      ocupacion: resultado.ocupacionPromedio
    };
  }
  
  return resultados;
}
```

### Buscar hueco para sobreturno:
```javascript
// Encontrar día con más disponibilidad para sobreturno
async function buscarMejorDiaParaSobreturno(tipoDia) {
  const resultado = await consultarDisponibilidadAgenda({ tipoDia });
  
  if (resultado.disponibilidad.length === 0) {
    return null;
  }
  
  // Ordenar por cantidad de horarios libres (descendente)
  const ordenado = resultado.disponibilidad.sort(
    (a, b) => b.cantidadDisponibles - a.cantidadDisponibles
  );
  
  return ordenado[0]; // Día con más disponibilidad
}
```

## 🚫 ERRORES COMUNES

❌ **NO hacer:**
```javascript
// Usar tipo que no existe
consultarDisponibilidadAgenda({ tipoDia: "EMERGENCIA" }); // No existe

// Rango inválido
consultarDisponibilidadAgenda({ 
  fechaDesde: "31/01/2025",
  fechaHasta: "01/01/2025"  // Hasta < Desde!
});

// No validar tipo antes de usar
const tipo = "PAMI"; // Incorrecto, debe ser PAMI_NUEVO o PAMI_VIEJO
consultarDisponibilidadAgenda({ tipoDia: tipo });
```

✅ **SÍ hacer:**
```javascript
// Validar tipo
const validacion = validarTipoDiaAdmin(tipoDia);
if (!validacion.valido) return error(validacion.error);

// Validar rango
const rangoValido = validarRangoFechas(fechaDesde, fechaHasta);
if (!rangoValido.valido) return error(rangoValido.error);

// Llamar con parámetros válidos
const resultado = consultarDisponibilidadAgenda({ 
  tipoDia, 
  fechaDesde, 
  fechaHasta 
});

// Procesar resultado con estadísticas
if (resultado.status === "success") {
  mostrarEstadisticas(resultado);
}
```

## 💬 RESPUESTAS ADMIN

### Con disponibilidad:
```
"📊 Disponibilidad [TIPO]:

✅ [N] días con disponibilidad
📅 [N] horarios libres
📈 Ocupación: [%]

Próximo disponible: [DiaSemana] [fecha] [hora]

[Lista de días con horarios]"
```

### Sin disponibilidad:
```
"❌ No hay disponibilidad [TIPO] en el período consultado

Opciones:
1. Buscar en otro rango de fechas
2. Crear sobreturno (forzar_horario)
3. Registrar en otro tipo de día"
```

### Reporte de ocupación:
```
"📊 Reporte [fechaDesde] - [fechaHasta]

PARTICULAR: [N] libres ([%] ocupación)
PAMI_NUEVO: [N] libres ([%] ocupación)
PAMI_VIEJO: [N] libres ([%] ocupación)
CIRUGIA: [N] días, [N] horarios

Ocupación promedio general: [%]
Total horarios disponibles: [N]"
```

## 📝 NOTAS IMPORTANTES

- 🔓 **Acceso total**: Admin puede consultar los 7 tipos
- 📊 **Estadísticas detalladas**: Incluye ocupados y bloqueados
- 📅 **Rango de fechas**: Usar `fechaHasta` para reportes
- 📈 **Planificación**: Útil para organizar agenda
- 🚨 **Urgencias**: Buscar slots libres para sobreturnos
- 🔍 **Análisis**: Ver tendencias de ocupación
- 📱 **Reportes**: Generar estadísticas por período

---

**DIFERENCIA CLAVE**: Admin tiene acceso a tipos administrativos (CIRUGIA, CONTROL, MEDICION, DIA_LIBRE) y estadísticas detalladas. Usar para planificación y gestión de agenda.

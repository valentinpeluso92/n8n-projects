# Tool: modificarTurno (Agente PACIENTE)

Modifica la fecha u hora de un turno existente del paciente actual. Solo puede modificar sus propios turnos.

## 🎯 CUÁNDO Y POR QUÉ USAR ESTA TOOL

**Llama a esta tool cuando necesites:**
- Cambiar la fecha u horario de un turno existente
- Reprogramar un turno a solicitud del paciente
- Actualizar los datos de fecha/hora en el sistema

**Requisito previo:**
- Debes haber consultado primero los turnos del paciente con `buscarTurnosPorDNI` para obtener el `id_turno`
- Verificar que el turno esté a más de 24hs de distancia (si es menos, derivar a secretaria)
- Consultar disponibilidad con `consultarDisponibilidadAgenda` para ofrecer opciones

## 📋 PARÁMETROS

**OBLIGATORIOS:**
- `id_turno` (string): ID del turno a modificar
  - Ejemplo: `"turno_06012025_1703952341234"`
  - Obtener con `buscarTurnosPorDNI` primero

- `dni` (string): DNI del paciente (para validación de seguridad)
  - Debe coincidir con el DNI del turno
  - Debe coincidir con el DNI del usuario autenticado

**AL MENOS UNO DE:**
- `nueva_fecha` (string): Nueva fecha (DD/MM/AAAA)
  - Debe ser fecha futura
  - Debe tener disponibilidad

- `nueva_hora` (string): Nueva hora (HH:MM)
  - Debe ser horario válido de agenda
  - Debe estar disponible

## 📤 RETORNA

### Caso 1: Modificación exitosa
```json
{
  "status": "success",
  "turno_anterior": {
    "fecha": "06/01/2025",
    "hora": "9:00"
  },
  "turno_modificado": {
    "id": "turno_06012025_1703952341234",
    "fecha": "08/01/2025",
    "hora": "10:00",
    "nombre_completo": "María González",
    "dni": "35123456",
    "obra_social": "PAMI",
    "tipo_consulta": "Consulta",
    "primera_vez": "NO",
    "estado": "Confirmado",
    "telefono": "11-2345-6789",
    "fecha_de_registro": "31/12/2024 10:30"
  },
  "mensaje": "✅ Turno modificado. Nuevo horario: Miércoles 8/1 a las 10:00"
}
```

### Caso 2: Error - No es dueño del turno
```json
{
  "status": "error",
  "codigo": "ACCESO_DENEGADO",
  "mensaje": "Solo puede modificar sus propios turnos"
}
```

### Caso 3: Error - Nuevo horario ocupado
```json
{
  "status": "error",
  "codigo": "HORARIO_OCUPADO",
  "mensaje": "El nuevo horario 08/01/2025 10:00 ya está ocupado",
  "sugerencia": "Consulte otros horarios disponibles"
}
```

### Caso 4: Error - Turno muy próximo
```json
{
  "status": "error",
  "codigo": "TURNO_PROXIMO",
  "mensaje": "No se puede modificar turnos con menos de 24hs de anticipación",
  "sugerencia": "Llame al consultorio: [TELÉFONO]"
}
```

## 🎯 CUÁNDO USAR

1. **Usuario solicita cambiar fecha/hora** de turno existente
2. **Después de buscar sus turnos** con `buscarTurnosPorDNI`
3. **Después de consultar nueva disponibilidad** con `consultarDisponibilidadAgenda`
4. **Usuario confirma** el nuevo horario

## 🔒 SEGURIDAD CRÍTICA

### Validaciones obligatorias:

1. **Verificar propiedad del turno:**
   ```javascript
   // 1. Buscar turno por ID
   const turno = buscarTurnoPorID(id_turno);
   
   // 2. Verificar que el DNI del turno coincide con el DNI del usuario
   if (turno.dni !== usuarioAutenticado.dni) {
     return error("ACCESO_DENEGADO", "No puede modificar turnos de otros");
   }
   
   // 3. Verificar que el DNI en parámetros coincide
   if (dni !== usuarioAutenticado.dni) {
     return error("ACCESO_DENEGADO", "DNI no coincide");
   }
   ```

2. **Validar plazo de modificación:**
   ```javascript
   // No permitir modificaciones < 24hs antes
   function puedeModificar(fechaTurno, horaTurno) {
     const fechaHoraTurno = parseFechaHora(fechaTurno, horaTurno);
     const ahora = new Date();
     const diferencia = fechaHoraTurno - ahora;
     const horas = diferencia / (1000 * 60 * 60);
     
     return horas >= 24; // Mínimo 24hs de anticipación
   }
   ```

## 📊 ESTRUCTURA GOOGLE SHEETS

### Hoja: Turnos (lectura + escritura)
1. Busca turno por `id`
2. Valida que `dni` coincide
3. Actualiza `fecha` y/o `hora`
4. Actualiza `fecha_de_registro` (timestamp de modificación)

### Hoja: Agenda (lectura)
Verifica que nuevo horario esté disponible.

## 💡 EJEMPLOS DE USO

### Ejemplo 1: Cambiar solo la fecha
```
Usuario: "No puedo ir el lunes, necesito cambiarlo"
Agente: "¿Me dice su DNI?"
Usuario: "35123456"

[Llama: buscarTurnosPorDNI({ dni: "35123456", solo_futuros: true })]
→ Retorna: 1 turno el 06/01/2025 9:00

Agente: "Su turno es el Lunes 6/1 a las 9:00.
         ¿Para qué día lo necesita?"
Usuario: "Miércoles 8"

[Llama: consultarDisponibilidadAgenda({ 
  tipoDia: "PAMI_NUEVO", 
  fechaDesde: "08/01/2025" 
})]
→ Retorna: Disponible 08/01 9:00

Agente: "Tengo lugar el Miércoles 8/1 a las 9:00.
         ¿Le sirve?"
Usuario: "Sí perfecto"

[Llama: modificarTurno({
  id_turno: "turno_06012025_1703952341234",
  dni: "35123456",
  nueva_fecha: "08/01/2025"
  // nueva_hora no se envía, mantiene 9:00
})]

→ Retorna: { status: "success" }

Agente: "✅ Turno modificado.
         Nuevo horario: Miércoles 8/1 a las 9:00"
```

### Ejemplo 2: Cambiar fecha y hora
```
Usuario: "Cambiar turno a otro día y hora"

[Después de consultar disponibilidad...]

[Llama: modificarTurno({
  id_turno: "turno_06012025_1703952341234",
  dni: "35123456",
  nueva_fecha: "10/01/2025",
  nueva_hora: "10:40"
})]

Agente: "✅ Turno modificado.
         Anterior: Lunes 6/1 9:00
         Nuevo: Viernes 10/1 10:40"
```

### Ejemplo 3: Error - Turno muy próximo
```
Usuario: "Cambiar turno de mañana"
[Turno es 01/01/2025, hoy es 31/12/2024 16:00]

[Llama: modificarTurno({
  id_turno: "turno_01012025_xxx",
  dni: "35123456",
  nueva_fecha: "03/01/2025"
})]

→ Retorna: { 
    status: "error",
    codigo: "TURNO_PROXIMO",
    mensaje: "No se puede modificar < 24hs"
}

Agente: "No puedo modificar turnos con menos de 24hs.
         Para cambios urgentes llame al [TELÉFONO]."
```

### Ejemplo 4: Error - Intentar modificar turno de otro
```
Usuario autenticado: DNI 35123456
Usuario intenta: modificar turno de DNI 40111222

[Llama: modificarTurno({
  id_turno: "turno_xxx",
  dni: "40111222"  // ← DNI diferente!
})]

→ Retorna: { 
    status: "error",
    codigo: "ACCESO_DENEGADO"
}

Agente: "Solo puede modificar sus propios turnos."
```

## ⚠️ VALIDACIONES PRE-MODIFICACIÓN

### 1. Validar propiedad del turno:
```javascript
async function validarPropiedadTurno(id_turno, dni_usuario) {
  const turno = await buscarTurnoPorID(id_turno);
  
  if (!turno) {
    return { valido: false, error: "Turno no encontrado" };
  }
  
  if (turno.dni !== dni_usuario) {
    return { valido: false, error: "No es su turno" };
  }
  
  return { valido: true, turno };
}
```

### 2. Validar plazo mínimo:
```javascript
function validarPlazoMinimo(fecha, hora) {
  const fechaHoraTurno = parseFechaHora(fecha, hora);
  const ahora = new Date();
  const horasRestantes = (fechaHoraTurno - ahora) / (1000 * 60 * 60);
  
  if (horasRestantes < 24) {
    return { 
      valido: false, 
      error: "Modificaciones deben hacerse con 24hs de anticipación" 
    };
  }
  
  return { valido: true };
}
```

### 3. Validar disponibilidad del nuevo horario:
```javascript
async function validarDisponibilidad(nueva_fecha, nueva_hora, id_turno_actual) {
  const turnosEnHorario = await buscarTurnosPorFechaHora(nueva_fecha, nueva_hora);
  
  // Filtrar el turno que estamos modificando (puede mantener su horario)
  const ocupado = turnosEnHorario.find(t => t.id !== id_turno_actual);
  
  if (ocupado) {
    return { 
      disponible: false, 
      error: "Horario ocupado",
      ocupado_por: ocupado.nombre_completo
    };
  }
  
  return { disponible: true };
}
```

## 🔄 FLUJO COMPLETO DE MODIFICACIÓN

```
1. Usuario solicita modificar turno
2. Solicitar DNI (si no está autenticado)
3. Llamar buscarTurnosPorDNI({ dni, solo_futuros: true })
4. Mostrar turnos del usuario
5. Usuario selecciona cuál modificar (obtener id_turno)
6. Validar plazo mínimo (>= 24hs)
7. Preguntar nueva fecha/hora deseada
8. Determinar tipoDia según obra social del turno
9. Llamar consultarDisponibilidadAgenda({ tipoDia, fechaDesde })
10. Ofrecer horarios disponibles
11. Usuario confirma nuevo horario
12. ✅ Llamar modificarTurno({ id_turno, dni, nueva_fecha, nueva_hora })
13. Evaluar resultado:
    ├─ Si success → Confirmar cambio
    ├─ Si HORARIO_OCUPADO → Buscar otra alternativa
    ├─ Si TURNO_PROXIMO → Derivar a secretaria
    ├─ Si ACCESO_DENEGADO → Denegar operación
    └─ Si error técnico → derivarASecretaria
14. Enviar confirmación con recordatorio de requisitos
```

## 💬 RESPUESTAS SUGERIDAS

### Éxito:
```
"✅ Turno modificado exitosamente

❌ Anterior: [DiaSemana] [fecha] [hora]
✅ Nuevo: [DiaSemana] [fecha] [hora]

👤 [Nombre]
🏥 [TipoConsulta] - [ObraSocial]

[Si PAMI: Recordar requisitos]

⚠️ Las cancelaciones deben hacerse con 24hs de anticipación."
```

### Error - Turno próximo:
```
"No puedo modificar turnos con menos de 24hs de anticipación.

Para cambios urgentes, comuníquese con el consultorio:
📞 [TELÉFONO]
⏰ Lunes a Viernes 9-12hs"
```

### Error - Horario ocupado:
```
"El horario [fecha] [hora] ya está ocupado.
Le busco otra alternativa..."
[Volver a consultar disponibilidad]
```

## 🚫 ERRORES COMUNES

❌ **NO hacer:**
```javascript
// Modificar sin validar propiedad
modificarTurno({ id_turno, dni: "cualquier_dni" }); // Inseguro!

// No validar plazo mínimo
modificarTurno({ ... }); // Puede ser < 24hs!

// No consultar disponibilidad primero
modificarTurno({ nueva_fecha, nueva_hora }); // Puede estar ocupado!
```

✅ **SÍ hacer:**
```javascript
// 1. Validar propiedad
const validacion = await validarPropiedadTurno(id_turno, dni_usuario);
if (!validacion.valido) return error(validacion.error);

// 2. Validar plazo
const turno = validacion.turno;
const plazo = validarPlazoMinimo(turno.fecha, turno.hora);
if (!plazo.valido) return error(plazo.error);

// 3. Consultar disponibilidad
const disponibilidad = await consultarDisponibilidadAgenda({ tipoDia });

// 4. Usuario confirma nuevo horario

// 5. Modificar
const resultado = modificarTurno({ id_turno, dni, nueva_fecha, nueva_hora });
```

## 📝 NOTAS IMPORTANTES

- ⚠️ **Plazo mínimo:** 24 horas de anticipación (política del consultorio)
- 🔒 **Seguridad:** Validar SIEMPRE que el turno pertenece al usuario
- 📅 **Disponibilidad:** Consultar ANTES de intentar modificar
- 💬 **Confirmación:** Siempre mostrar horario anterior y nuevo
- 📱 **Recordatorios:** Re-enviar requisitos según obra social

---

**IMPORTANTE:** Esta tool NO puede cancelar turnos, solo modificar fecha/hora. Para cancelar usar `cancelarTurno`.


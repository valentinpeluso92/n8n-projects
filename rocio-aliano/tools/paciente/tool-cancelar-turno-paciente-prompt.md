# Tool: cancelarTurno (Agente PACIENTE)

Cancela un turno existente del paciente actual. Solo puede cancelar sus propios turnos.

## 📋 PARÁMETROS

**OBLIGATORIOS:**
- `id_turno` (string): ID del turno a cancelar
  - Ejemplo: `"turno_06012025_1703952341234"`
  - Obtener con `buscarTurnosPorDNI` primero

- `dni` (string): DNI del paciente (para validación de seguridad)
  - Debe coincidir con el DNI del turno
  - Debe coincidir con el DNI del usuario autenticado

**OPCIONALES:**
- `motivo` (string): Razón de la cancelación
  - Opcional pero recomendado
  - Ejemplo: `"No puedo asistir"`, `"Problema de salud"`, `"Viaje imprevisto"`

## 📤 RETORNA

### Caso 1: Cancelación exitosa
```json
{
  "status": "success",
  "turno_cancelado": {
    "id": "turno_06012025_1703952341234",
    "fecha": "06/01/2025",
    "hora": "9:00",
    "nombre_completo": "María González",
    "dni": "35123456",
    "obra_social": "PAMI",
    "tipo_consulta": "Consulta",
    "primera_vez": "NO",
    "estado": "Cancelado",
    "telefono": "11-2345-6789",
    "fecha_de_registro": "31/12/2024 10:30",
    "fecha_cancelacion": "31/12/2024 16:00",
    "motivo_cancelacion": "No puedo asistir"
  },
  "debe_cobro": false,
  "mensaje": "✅ Turno cancelado. Su lugar quedó disponible para otros pacientes."
}
```

### Caso 2: Cancelación tardía (< 24hs) - Se cobra
```json
{
  "status": "success",
  "turno_cancelado": { ... },
  "debe_cobro": true,
  "monto_a_cobrar": "[PRECIO_CONSULTA]",
  "advertencia": "⚠️ Cancelación con menos de 24hs de anticipación. Se cobrará la consulta.",
  "mensaje": "Turno cancelado. Por política del consultorio, debe abonar la consulta."
}
```

### Caso 3: Error - No es dueño del turno
```json
{
  "status": "error",
  "codigo": "ACCESO_DENEGADO",
  "mensaje": "Solo puede cancelar sus propios turnos"
}
```

### Caso 4: Error - Turno ya cancelado
```json
{
  "status": "error",
  "codigo": "TURNO_YA_CANCELADO",
  "mensaje": "Este turno ya fue cancelado anteriormente"
}
```

## 🎯 CUÁNDO USAR

1. **Usuario solicita cancelar turno** explícitamente
2. **Después de buscar sus turnos** con `buscarTurnosPorDNI`
3. **Después de confirmar** que desea cancelar (si es < 24hs)

## ⚠️ POLÍTICA DE CANCELACIÓN

### Reglas del consultorio:

**Cancelación con 24hs o más de anticipación:**
- ✅ Sin cargo
- ✅ Horario liberado para otros pacientes
- ✅ Puede solicitar nuevo turno

**Cancelación con menos de 24hs:**
- ❌ Se cobra el valor de la consulta
- ⚠️ Debe abonar aunque no asista
- ⚠️ Excepción: Urgencias médicas justificadas

**No asistir sin cancelar:**
- ❌ Se cobra el valor de la consulta
- ⚠️ Posible restricción para futuros turnos

## 🔒 SEGURIDAD CRÍTICA

### Validaciones obligatorias:

1. **Verificar propiedad del turno:**
   ```javascript
   const turno = buscarTurnoPorID(id_turno);
   
   if (turno.dni !== usuarioAutenticado.dni) {
     return error("ACCESO_DENEGADO", "No puede cancelar turnos de otros");
   }
   
   if (dni !== usuarioAutenticado.dni) {
     return error("ACCESO_DENEGADO", "DNI no coincide");
   }
   ```

2. **Validar estado del turno:**
   ```javascript
   if (turno.estado === "Cancelado") {
     return error("TURNO_YA_CANCELADO", "Este turno ya está cancelado");
   }
   
   if (turno.estado === "Atendido") {
     return error("TURNO_ATENDIDO", "No se puede cancelar un turno ya atendido");
   }
   ```

3. **Calcular si hay cobro:**
   ```javascript
   function debeCobro(fechaTurno, horaTurno) {
     const fechaHoraTurno = parseFechaHora(fechaTurno, horaTurno);
     const ahora = new Date();
     const horasRestantes = (fechaHoraTurno - ahora) / (1000 * 60 * 60);
     
     return horasRestantes < 24; // true si < 24hs
   }
   ```

## 📊 ESTRUCTURA GOOGLE SHEETS

### Hoja: Turnos (escritura)
1. Busca turno por `id`
2. Valida que `dni` coincide
3. Actualiza `estado` a "Cancelado"
4. Agrega `fecha_cancelacion` (timestamp actual)
5. Agrega `motivo_cancelacion` si se proporcionó
6. Calcula y guarda `debe_cobro` (true/false)

## 💡 EJEMPLOS DE USO

### Ejemplo 1: Cancelación anticipada (sin cobro)
```
Usuario: "Necesito cancelar mi turno"
Agente: "¿Me dice su DNI?"
Usuario: "35123456"

[Llama: buscarTurnosPorDNI({ dni: "35123456", solo_futuros: true })]
→ Retorna: 1 turno el 06/01/2025 9:00

Agente: "Su turno es el Lunes 6/1 a las 9:00.
         ¿Está seguro/a que desea cancelarlo?"
Usuario: "Sí"

[Hoy: 31/12/2024, turno: 06/01/2025 = más de 24hs]

[Llama: cancelarTurno({
  id_turno: "turno_06012025_1703952341234",
  dni: "35123456",
  motivo: "No puedo asistir"
})]

→ Retorna: { 
    status: "success",
    debe_cobro: false
}

Agente: "✅ Turno cancelado sin cargo.
         Si necesita otro turno, puedo ayudarlo/a a agendarlo."
```

### Ejemplo 2: Cancelación tardía (se cobra)
```
Usuario: "Cancelar turno de mañana"
[Hoy: 31/12/2024 22:00, turno: 01/01/2025 9:00 = <24hs]

Agente: "⚠️ Su turno es mañana 1/1 a las 9:00.
         Si cancela con menos de 24hs, debe abonar la consulta.
         ¿Confirma la cancelación?"
Usuario: "Sí, confirmo"

[Llama: cancelarTurno({
  id_turno: "turno_01012025_xxx",
  dni: "35123456",
  motivo: "Imprevisto familiar"
})]

→ Retorna: { 
    status: "success",
    debe_cobro: true,
    monto_a_cobrar: "$[PRECIO]"
}

Agente: "✅ Turno cancelado.
         
         Por política del consultorio, al cancelar con menos de 24hs 
         debe abonar $[PRECIO] (valor de consulta).
         
         Se comunicarán para coordinar el pago."
```

### Ejemplo 3: Usuario tiene múltiples turnos
```
Usuario: "Cancelar turno"
Agente: "¿Su DNI?"
Usuario: "35123456"

[Llama: buscarTurnosPorDNI({ dni: "35123456", solo_futuros: true })]
→ Retorna: 2 turnos

Agente: "Tiene 2 turnos próximos:
1. Lunes 6/1 9:00 - Consulta
2. Viernes 10/1 10:00 - Control

¿Cuál desea cancelar?"
Usuario: "El primero"

[Llama: cancelarTurno({
  id_turno: "turno_06012025_xxx",
  dni: "35123456"
})]
```

### Ejemplo 4: Error - Intentar cancelar turno de otro
```
Usuario autenticado: DNI 35123456
Usuario intenta: cancelar turno de DNI 40111222

[Llama: cancelarTurno({
  id_turno: "turno_xxx",
  dni: "40111222"  // ← DNI diferente!
})]

→ Retorna: { 
    status: "error",
    codigo: "ACCESO_DENEGADO"
}

Agente: "Solo puede cancelar sus propios turnos."
```

## 🔄 FLUJO COMPLETO DE CANCELACIÓN

```
1. Usuario solicita cancelar turno
2. Solicitar DNI (si no está autenticado)
3. Llamar buscarTurnosPorDNI({ dni, solo_futuros: true })
4. Mostrar turnos del usuario
5. Usuario selecciona cuál cancelar (obtener id_turno)
6. Mostrar detalles del turno a cancelar
7. Calcular si debe cobro (< 24hs?)
   ├─ Si debe cobro → ADVERTIR y solicitar confirmación explícita
   └─ Si no debe cobro → Solicitar confirmación simple
8. Usuario confirma
9. Opcionalmente preguntar motivo
10. ✅ Llamar cancelarTurno({ id_turno, dni, motivo? })
11. Evaluar resultado:
    ├─ Si success + debe_cobro → Informar política de cobro
    ├─ Si success + sin cobro → Confirmar cancelación
    ├─ Si ACCESO_DENEGADO → Denegar operación
    ├─ Si TURNO_YA_CANCELADO → Informar que ya estaba cancelado
    └─ Si error técnico → derivarASecretaria
12. Ofrecer agendar nuevo turno si lo necesita
```

## 💬 RESPUESTAS SUGERIDAS

### Confirmación previa - Sin cobro:
```
"Su turno: [DiaSemana] [fecha] [hora]
[TipoConsulta] - [ObraSocial]

¿Está seguro/a que desea cancelarlo?
Si cancela ahora (más de 24hs antes) no hay cargo."
```

### Confirmación previa - Con cobro:
```
"⚠️ IMPORTANTE

Su turno es [DiaSemana] [fecha] [hora] (en [X] horas)

Por política del consultorio, al cancelar con menos de 24hs 
de anticipación debe abonar el valor de la consulta ($[PRECIO]).

¿Confirma la cancelación? (SÍ/NO)"
```

### Éxito - Sin cobro:
```
"✅ Turno cancelado exitosamente

❌ [DiaSemana] [fecha] [hora]

Su lugar quedó disponible para otros pacientes.
Si necesita otro turno, puedo ayudarlo/a."
```

### Éxito - Con cobro:
```
"✅ Turno cancelado

❌ [DiaSemana] [fecha] [hora]

⚠️ Por cancelar con menos de 24hs, debe abonar $[PRECIO].
La secretaria se comunicará para coordinar el pago.

Si tiene alguna urgencia médica, puede consultarnos."
```

### Turno ya cancelado:
```
"Este turno ya fue cancelado anteriormente el [fecha_cancelacion].

¿Necesita agendar un nuevo turno?"
```

## 🚫 ERRORES COMUNES

❌ **NO hacer:**
```javascript
// Cancelar sin validar propiedad
cancelarTurno({ id_turno, dni: "cualquier_dni" }); // Inseguro!

// No advertir sobre cobro antes de cancelar
cancelarTurno({ ... }); // Usuario no sabe que le cobrarán!

// Cancelar sin confirmar
// (especialmente si < 24hs)
```

✅ **SÍ hacer:**
```javascript
// 1. Validar propiedad
const turno = await buscarTurnoPorID(id_turno);
if (turno.dni !== usuarioAutenticado.dni) {
  return error("No puede cancelar turnos de otros");
}

// 2. Calcular cobro
const debe_cobro = debeCobro(turno.fecha, turno.hora);

// 3. Advertir si hay cobro
if (debe_cobro) {
  const confirma = await preguntar(
    "⚠️ Se cobrará la consulta. ¿Confirma? (SÍ/NO)"
  );
  if (confirma !== "SÍ") return cancelado();
}

// 4. Cancelar
const resultado = cancelarTurno({ id_turno, dni, motivo });
```

## 📝 NOTAS IMPORTANTES

- ⚠️ **Plazo:** 24 horas es el límite para cancelación sin cargo
- 💰 **Cobro:** Si < 24hs, se cobra SIEMPRE (política del consultorio)
- 🔒 **Seguridad:** Validar SIEMPRE que el turno pertenece al usuario
- 💬 **Confirmación:** SIEMPRE pedir confirmación explícita
- 📞 **Urgencias:** Si es urgencia médica, derivar a secretaria para evaluar
- 🔄 **Reagendar:** Ofrecer buscar nuevo turno después de cancelar

## ⚠️ CASOS ESPECIALES

### Cancelación por urgencia médica:
Si el paciente cancela por urgencia médica justificada (ej: internación, COVID, etc.), derivar a secretaria para evaluar exención de cargo.

```
Usuario: "Me interné, no puedo ir"
Agente: "Lamento que esté en esa situación.
         Por favor comuníquese con el consultorio al [TELÉFONO]
         para informar su situación. Pueden hacer una excepción."
```

### Paciente quiere reagendar en lugar de cancelar:
```
Usuario: "Cancelar turno"
Agente: "¿Desea cancelar o reprogramar para otra fecha?
         Si reprograma, puedo ayudarlo/a a encontrar otro horario."
         
[Si quiere reprogramar → usar modificarTurno en lugar de cancelar]
```

---

**IMPORTANTE:** Siempre confirmar explícitamente antes de cancelar, especialmente si hay cobro. La cancelación es irreversible.


# Tool: modificarCualquierTurno (Agente ADMINISTRADOR)

Modifica cualquier turno existente sin restricciones de propiedad. Capacidades administrativas completas.

## 📋 PARÁMETROS

**OBLIGATORIOS:**
- `id_turno` (string): ID del turno a modificar

**AL MENOS UNO DE:**
- `nueva_fecha` (string): Nueva fecha (DD/MM/AAAA)
- `nueva_hora` (string): Nueva hora (HH:MM)

**OPCIONALES (solo admin):**
- `nuevo_estado` (string): Cambiar estado del turno
  - Valores: `"Confirmado"`, `"Pendiente"`, `"Cancelado"`, `"Atendido"`, `"No asistió"`
  
- `forzar_modificacion` (boolean): Ignorar validaciones de plazo
  - Default: `false`
  - Uso: Modificaciones urgentes < 24hs
  
- `notas_modificacion` (string): Notas sobre por qué se modificó
  - Ejemplo: `"Modificado por pedido telefónico urgente"`

- `notificar_paciente` (boolean): Enviar notificación al paciente
  - Default: `true`

## 📤 RETORNA

### Caso 1: Modificación exitosa
```json
{
  "status": "success",
  "turno_anterior": {
    "fecha": "06/01/2025",
    "hora": "9:00",
    "estado": "Confirmado"
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
    "fecha_de_registro": "31/12/2024 16:45"
  },
  "modificacion_forzada": false,
  "mensaje": "✅ Turno modificado para María González (DNI: 35123456)"
}
```

### Caso 2: Modificación forzada (< 24hs)
```json
{
  "status": "success",
  "turno_modificado": { ... },
  "modificacion_forzada": true,
  "advertencia": "⚠️ Modificación realizada con menos de 24hs de anticipación",
  "mensaje": "✅ Turno modificado. Notificar urgentemente al paciente."
}
```

### Caso 3: Error - Turno no encontrado
```json
{
  "status": "error",
  "codigo": "TURNO_NO_ENCONTRADO",
  "mensaje": "No se encontró turno con ID turno_xxx"
}
```

## 🎯 CAPACIDADES ADMINISTRATIVAS

### Diferencias con agente PACIENTE:

1. **Modificar cualquier turno** (de cualquier paciente)
2. **Modificar sin plazo mínimo** con `forzar_modificacion: true`
3. **Cambiar estado del turno** (`Confirmado` ↔ `Pendiente`, etc.)
4. **Modificar turnos pasados** (para corregir historial)
5. **Agregar notas de modificación** para auditoría
6. **Controlar notificaciones** al paciente

## 💡 EJEMPLOS DE USO

### Ejemplo 1: Modificación estándar
```
Admin: "Cambiar turno de María González DNI 35123456 
        del 6/1 al 8/1 misma hora"

[Llama: buscarTurnosPorDNI({ dni: "35123456" })]
→ id_turno: "turno_06012025_xxx"

[Llama: modificarCualquierTurno({
  id_turno: "turno_06012025_xxx",
  nueva_fecha: "08/01/2025"
})]

→ Retorna: { status: "success" }

Agente: "✅ Turno modificado
         María González (DNI: 35123456)
         Nuevo: Miércoles 8/1 9:00
         
         ¿Desea notificar al paciente?"
```

### Ejemplo 2: Modificación urgente (< 24hs)
```
Admin: "Cancelar consultorio mañana, mover todos los turnos"
[Turno de mañana 01/01/2025, hoy 31/12/2024]

[Llama: modificarCualquierTurno({
  id_turno: "turno_01012025_xxx",
  nueva_fecha: "03/01/2025",
  forzar_modificacion: true,  // ← Ignora plazo 24hs
  notas_modificacion: "Consultorio cerrado por imprevisto",
  notificar_paciente: true
})]

→ Retorna: { 
    status: "success",
    modificacion_forzada: true,
    advertencia: "Modificación < 24hs"
}

Agente: "⚠️ Turno modificado con menos de 24hs.
         ✅ Notificación enviada al paciente.
         
         Próximo turno en lista..."
```

### Ejemplo 3: Cambiar estado sin cambiar fecha
```
Admin: "Marcar turno de Pedro Gómez como 'No asistió'"

[Llama: modificarCualquierTurno({
  id_turno: "turno_xxx",
  nuevo_estado: "No asistió"
  // No envía nueva_fecha ni nueva_hora
})]

Agente: "✅ Estado actualizado
         Pedro Gómez (DNI: 40111222)
         Estado: No asistió
         Fecha original: 30/12/2024 9:00"
```

### Ejemplo 4: Corregir turno histórico
```
Admin: "Corregir fecha de turno atendido, 
        era 15/11 no 14/11"

[Llama: modificarCualquierTurno({
  id_turno: "turno_14112024_xxx",
  nueva_fecha: "15/11/2024",  // Fecha pasada OK para admin
  nuevo_estado: "Atendido",
  notas_modificacion: "Corrección de fecha errónea"
})]

Agente: "✅ Turno histórico corregido
         Fecha actualizada: 15/11/2024"
```

## 🔒 PERMISOS ADMINISTRATIVOS

### El agente admin PUEDE:
- ✅ Modificar turnos de cualquier paciente
- ✅ Modificar sin plazo mínimo (con `forzar_modificacion`)
- ✅ Modificar turnos pasados (corrección de historial)
- ✅ Cambiar estado del turno
- ✅ Agregar notas administrativas
- ✅ Controlar si se notifica al paciente
- ✅ Modificar múltiples turnos en lote

### El agente admin DEBE:
- ⚠️ Confirmar modificaciones forzadas
- ⚠️ Notificar siempre al paciente (salvo correcciones administrativas)
- ⚠️ Documentar razón de modificación en `notas_modificacion`
- ⚠️ Verificar disponibilidad del nuevo horario (evitar solapamientos)

## ⚙️ VALIDACIONES ADMIN

### Confirmar modificación forzada:
```javascript
async function confirmarModificacionForzada(turno) {
  const horasRestantes = calcularHorasRestantes(turno.fecha, turno.hora);
  
  if (horasRestantes < 24) {
    return preguntar(
      `⚠️ El turno es en ${Math.round(horasRestantes)} horas.
      ¿Confirma modificación urgente? (SÍ/NO)
      Nota: Se notificará al paciente inmediatamente.`
    );
  }
  return true;
}
```

### Verificar disponibilidad nuevo horario:
```javascript
async function verificarDisponibilidadAdmin(nueva_fecha, nueva_hora, id_actual) {
  const turnosEnHorario = await buscarTurnosPorFechaHora(nueva_fecha, nueva_hora);
  const ocupado = turnosEnHorario.find(t => t.id !== id_actual);
  
  if (ocupado) {
    return advertir(
      `⚠️ Horario ${nueva_fecha} ${nueva_hora} ocupado por ${ocupado.nombre_completo}.
      ¿Desea crear sobreturno? (SÍ/NO)`
    );
  }
  return true;
}
```

## 📊 FLUJO COMPLETO ADMIN

```
1. Admin solicita modificar turno
2. Identificar turno:
   ├─ Por ID (si lo tiene)
   ├─ Por DNI + fecha (buscar primero)
   └─ Por nombre + fecha (buscar primero)
3. Mostrar datos actuales del turno
4. Confirmar cambios deseados
5. Validar:
   ├─ Si < 24hs → Confirmar modificación forzada
   ├─ Si nuevo horario ocupado → Confirmar sobreturno
   └─ Si todo OK → Proceder
6. Llamar modificarCualquierTurno({ ...params })
7. Evaluar resultado:
   ├─ Si success → Confirmar y preguntar notificación
   └─ Si error → Mostrar error y sugerencias
8. Si notificar → Enviar mensaje al paciente
9. Registrar en log/observaciones
```

## 💬 RESPUESTAS ADMIN

### Éxito - Modificación estándar:
```
"✅ Turno modificado

👤 [Nombre] (DNI: [DNI])
📞 [Teléfono]

❌ Anterior: [fecha] [hora]
✅ Nuevo: [fecha] [hora]

Estado: [estado]

¿Desea notificar al paciente? (SÍ/NO)"
```

### Éxito - Modificación forzada:
```
"⚠️ Modificación urgente realizada

👤 [Nombre] (DNI: [DNI])
📞 [Teléfono]

❌ Anterior: [fecha] [hora] (en [X] horas)
✅ Nuevo: [fecha] [hora]

⚠️ NOTIFICAR URGENTEMENTE AL PACIENTE
Llamar al [teléfono] para confirmar."
```

### Éxito - Solo cambio de estado:
```
"✅ Estado actualizado

👤 [Nombre] (DNI: [DNI])
📅 [Fecha] [Hora]

Estado anterior: [estado anterior]
Estado nuevo: [nuevo estado]

[Si "No asistió": Considerar cobrar consulta según política]"
```

## 🔍 CASOS ESPECIALES ADMIN

### Modificación en lote (mismo día):
```
Admin: "Mover todos los turnos del 6/1 al 8/1"

[Para cada turno del 6/1:]
modificarCualquierTurno({
  id_turno: turno.id,
  nueva_fecha: "08/01/2025",
  notas_modificacion: "Reprogramación masiva",
  notificar_paciente: true
});

→ "✅ 5 turnos reprogramados del 6/1 al 8/1.
   Notificaciones enviadas a todos los pacientes."
```

### Intercambiar horarios entre pacientes:
```
Admin: "Intercambiar turnos de María (9:00) y José (10:00)"

// Turno 1: María 9:00 → 10:00
modificarCualquierTurno({
  id_turno: "turno_maria",
  nueva_hora: "10:00",
  notas_modificacion: "Intercambio con José"
});

// Turno 2: José 10:00 → 9:00
modificarCualquierTurno({
  id_turno: "turno_jose",
  nueva_hora: "9:00",
  notas_modificacion: "Intercambio con María"
});

→ "✅ Turnos intercambiados. Notificar a ambos pacientes."
```

### Corregir datos erróneos:
```
Admin: "El turno de Juan estaba mal cargado, era PAMI no Particular"

[Esto requeriría otra tool "actualizarDatosTurno"]
// modificarCualquierTurno solo modifica fecha/hora/estado
```

## 🚫 ERRORES COMUNES

❌ **NO hacer:**
```javascript
// Modificar sin verificar disponibilidad
modificarCualquierTurno({ nueva_fecha, nueva_hora }); // Puede solaparse!

// Forzar sin notificar al paciente
modificarCualquierTurno({ 
  forzar_modificacion: true,
  notificar_paciente: false  // Peligroso si es urgente!
});
```

✅ **SÍ hacer:**
```javascript
// Verificar disponibilidad
const disponible = await verificarDisponibilidadAdmin(fecha, hora, id);

// Si forzado, siempre notificar
if (forzar_modificacion) {
  notificar_paciente = true; // Obligatorio
}

// Documentar razón
modificarCualquierTurno({
  ...,
  notas_modificacion: "Razón de la modificación"
});
```

## 📝 NOTAS IMPORTANTES

- ⚠️ **Notificaciones:** Siempre notificar salvo correcciones administrativas
- 📋 **Auditoría:** Usar `notas_modificacion` para trazabilidad
- 🔒 **Responsabilidad:** Con gran poder viene gran responsabilidad
- 📱 **Confirmación:** Llamar al paciente si modificación < 24hs

---

**DIFERENCIA CLAVE:** Admin puede modificar cualquier turno sin restricciones de tiempo o propiedad. Usar con precaución.


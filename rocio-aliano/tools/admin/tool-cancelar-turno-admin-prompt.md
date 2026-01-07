# Tool: cancelarCualquierTurno (Agente ADMINISTRADOR)

Cancela cualquier turno sin restricciones de propiedad. Capacidades administrativas completas.

## 🎯 CUÁNDO Y POR QUÉ USAR ESTA TOOL

**Llama a esta tool cuando necesites:**
- Cancelar CUALQUIER turno, incluso si es de otro paciente
- Cancelar turnos con menos de 24hs (sin restricción de tiempo)
- Eximir cobros en cancelaciones urgentes o justificadas
- Registrar motivos administrativos de cancelación
- Cancelaciones masivas o por cierre de consultorio

**Ventaja del admin:** Sin restricciones de propiedad ni tiempo, puede eximir cobros y registrar motivos administrativos.

**Requisito previo:**
- Debes conocer el `id_turno` (usar `buscarTurnosPorDNI` o búsqueda por fecha si es necesario)

## 📋 PARÁMETROS

**OBLIGATORIOS:**
- `id_turno` (string): ID del turno a cancelar

**OPCIONALES (solo admin):**
- `motivo` (string): Razón administrativa de cancelación
  - Ejemplo: `"Consultorio cerrado"`, `"Pedido del paciente"`, `"Reprogramación masiva"`
  
- `eximir_cobro` (boolean): No cobrar aunque sea < 24hs
  - Default: `false`
  - Uso: Urgencias médicas, errores del consultorio, casos especiales
  
- `notificar_paciente` (boolean): Enviar notificación al paciente
  - Default: `true`
  
- `notas_admin` (string): Observaciones administrativas internas
  - No visible para el paciente
  - Ejemplo: `"Cancelado por pedido telefónico urgente"`

## 📤 RETORNA

### Caso 1: Cancelación exitosa estándar
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
    "estado": "Cancelado",
    "telefono": "11-2345-6789",
    "fecha_cancelacion": "31/12/2024 16:00",
    "motivo_cancelacion": "Pedido del paciente",
    "debe_cobro": false
  },
  "mensaje": "✅ Turno cancelado para María González (DNI: 35123456)"
}
```

### Caso 2: Cancelación con exención de cobro
```json
{
  "status": "success",
  "turno_cancelado": { ... },
  "debe_cobro": false,
  "cobro_eximido": true,
  "motivo_exencion": "Urgencia médica justificada",
  "mensaje": "✅ Turno cancelado con exención de cobro"
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

1. **Cancelar cualquier turno** (de cualquier paciente)
2. **Eximir cobro** con `eximir_cobro: true` (urgencias, errores)
3. **Cancelación masiva** (múltiples turnos a la vez)
4. **Cancelar sin plazo mínimo** (incluso el mismo día)
5. **Agregar notas administrativas** para auditoría
6. **Controlar notificaciones** al paciente
7. **Cancelar turnos pasados** (para corregir historial)

## 💡 EJEMPLOS DE USO

### Ejemplo 1: Cancelación por pedido del paciente
```
Admin: "Cancelar turno de María González DNI 35123456, 
        llamó para avisar que no puede venir"

[Llama: buscarTurnosPorDNI({ dni: "35123456", solo_futuros: true })]
→ id_turno: "turno_06012025_xxx"

[Turno es en 2 días = sin cobro]

[Llama: cancelarCualquierTurno({
  id_turno: "turno_06012025_xxx",
  motivo: "Pedido del paciente",
  notificar_paciente: true,
  notas_admin: "Llamó el 31/12 a las 16:00"
})]

→ Retorna: { status: "success", debe_cobro: false }

Agente: "✅ Turno cancelado
         María González (DNI: 35123456)
         Fecha cancelada: 06/01/2025 9:00
         Sin cargo (cancelación anticipada)
         
         Notificación enviada al paciente."
```

### Ejemplo 2: Cancelación tardía con exención (urgencia)
```
Admin: "Cancelar turno de mañana de Pedro Gómez, 
        está internado"

[Turno mañana = < 24hs, normalmente se cobra]

[Llama: cancelarCualquierTurno({
  id_turno: "turno_01012025_xxx",
  motivo: "Internación por urgencia médica",
  eximir_cobro: true,  // ← Exención especial
  notificar_paciente: false,  // No molestarlo si está internado
  notas_admin: "Familiar llamó informando internación"
})]

→ Retorna: { 
    status: "success",
    debe_cobro: false,
    cobro_eximido: true
}

Agente: "✅ Turno cancelado con exención de cobro
         Pedro Gómez (DNI: 40111222)
         Motivo: Internación por urgencia médica
         
         ⚠️ Recordar llamar para verificar estado y reagendar."
```

### Ejemplo 3: Cancelación masiva (consultorio cerrado)
```
Admin: "Cancelar todos los turnos del 6/1, consultorio cerrado"

[Para cada turno del 6/1:]
cancelarCualquierTurno({
  id_turno: turno.id,
  motivo: "Consultorio cerrado por imprevisto",
  eximir_cobro: true,  // No cobrar, es responsabilidad del consultorio
  notificar_paciente: true,
  notas_admin: "Cierre imprevisto 6/1/2025"
});

→ "✅ 8 turnos cancelados del 06/01/2025
   Notificaciones enviadas a todos los pacientes
   Sin cargo por responsabilidad del consultorio
   
   ¿Desea reprogramar estos turnos para otra fecha?"
```

### Ejemplo 4: Cancelación por error administrativo
```
Admin: "Cancelar turno, se registró mal el horario"

[Llama: cancelarCualquierTurno({
  id_turno: "turno_xxx",
  motivo: "Error en registro de turno",
  eximir_cobro: true,
  notificar_paciente: true,
  notas_admin: "Error administrativo, se registrará correctamente"
})]

Agente: "✅ Turno cancelado por error administrativo
         Sin cargo
         
         ¿Desea registrar el turno correcto ahora?"
```

## 🔒 PERMISOS ADMINISTRATIVOS

### El agente admin PUEDE:
- ✅ Cancelar turnos de cualquier paciente
- ✅ Cancelar sin plazo mínimo (mismo día OK)
- ✅ Eximir cobro en casos justificados
- ✅ Cancelar múltiples turnos en lote
- ✅ Cancelar turnos pasados (corrección de historial)
- ✅ Decidir si notificar o no al paciente
- ✅ Agregar notas administrativas

### El agente admin DEBE:
- ⚠️ Documentar razón de exención de cobro
- ⚠️ Notificar al paciente (salvo casos justificados)
- ⚠️ Registrar en `notas_admin` para auditoría
- ⚠️ Ofrecer reagendar si es responsabilidad del consultorio

## ⚙️ VALIDACIONES ADMIN

### Confirmar cancelación masiva:
```javascript
async function confirmarCancelacionMasiva(turnos) {
  const cantidad = turnos.length;
  
  return preguntar(
    `⚠️ Esta acción cancelará ${cantidad} turnos.
    ¿Confirma la cancelación masiva? (SÍ/NO)
    
    Pacientes afectados:
    ${turnos.map(t => `- ${t.nombre_completo} (${t.fecha} ${t.hora})`).join('\n')}
    
    ¿Notificar a todos? (SÍ/NO)`
  );
}
```

### Validar exención de cobro:
```javascript
function requiereExencion(motivo) {
  const motivosExencion = [
    "urgencia médica",
    "internación",
    "error administrativo",
    "consultorio cerrado",
    "reprogramación por consultorio"
  ];
  
  return motivosExencion.some(m => 
    motivo.toLowerCase().includes(m)
  );
}
```

## 📊 FLUJO COMPLETO ADMIN

```
1. Admin solicita cancelar turno
2. Identificar turno:
   ├─ Por ID (si lo tiene)
   ├─ Por DNI + fecha
   └─ Por nombre + fecha
3. Mostrar datos del turno
4. Confirmar cancelación
5. Determinar:
   ├─ ¿Es < 24hs? → ¿Eximir cobro?
   ├─ ¿Es responsabilidad del consultorio? → Eximir automáticamente
   └─ ¿Notificar al paciente? → Default: SÍ
6. Llamar cancelarCualquierTurno({ ...params })
7. Evaluar resultado:
   ├─ Si success → Confirmar y registrar
   └─ Si error → Mostrar error
8. Si es responsabilidad del consultorio → Ofrecer reagendar
9. Registrar en log/observaciones
```

## 💬 RESPUESTAS ADMIN

### Éxito - Cancelación estándar:
```
"✅ Turno cancelado

👤 [Nombre] (DNI: [DNI])
📞 [Teléfono]
📅 [Fecha] [Hora]
🏥 [Tipo] - [Obra Social]

Motivo: [motivo]
Cobro: [SÍ/NO + monto si aplica]

[Si se notificó: ✅ Notificación enviada]
[Si no: ⚠️ Llamar manualmente para notificar]"
```

### Éxito - Con exención:
```
"✅ Turno cancelado con exención de cobro

👤 [Nombre] (DNI: [DNI])
📞 [Teléfono]
📅 [Fecha] [Hora]

Motivo: [motivo]
Exención: [motivo_exencion]

⚠️ IMPORTANTE: Ofrecer reagendar
[Si es urgencia: Llamar para verificar estado]"
```

### Éxito - Cancelación masiva:
```
"✅ Cancelación masiva completada

Total cancelados: [N] turnos
Fecha(s): [fechas]
Motivo: [motivo]

Notificaciones enviadas: [N]
Exenciones de cobro: [N] (por [razón])

¿Desea reprogramar estos turnos?"
```

## 🔍 CASOS ESPECIALES ADMIN

### Cancelar día completo:
```
Admin: "Cancelar consultorio 6/1 completo"

[Buscar todos los turnos del 6/1]
const turnos = await buscarTurnosPorFecha("06/01/2025");

[Cancelar en lote]
for (const turno of turnos) {
  await cancelarCualquierTurno({
    id_turno: turno.id,
    motivo: "Consultorio cerrado por [razón]",
    eximir_cobro: true,
    notificar_paciente: true,
    notas_admin: "Cierre programado 6/1"
  });
}

→ "✅ 8 turnos cancelados del 6/1
   Todos notificados
   Sin cargo (responsabilidad consultorio)"
```

### Cancelar por duplicado:
```
Admin: "Hay turno duplicado de Juan Pérez, cancelar uno"

[Llama: cancelarCualquierTurno({
  id_turno: "turno_duplicado",
  motivo: "Turno duplicado por error",
  eximir_cobro: true,
  notificar_paciente: false,  // Ya tiene el otro
  notas_admin: "Mantener turno_06012025_xxx"
})]

→ "✅ Turno duplicado cancelado
   Se mantuvo turno: 06/01/2025 9:00"
```

### Cancelar turno histórico (corrección):
```
Admin: "Cancelar turno pasado que no asistió"

[Llama: cancelarCualquierTurno({
  id_turno: "turno_15112024_xxx",
  motivo: "Corrección administrativa - No asistió",
  notas_admin: "Actualización de historial"
})]

→ Estado cambia de "Confirmado" a "Cancelado"
→ "✅ Historial corregido"
```

## 🚫 ERRORES COMUNES

❌ **NO hacer:**
```javascript
// Cancelar sin documentar razón
cancelarCualquierTurno({ id_turno }); // Sin motivo!

// Eximir cobro sin justificación
cancelarCualquierTurno({ 
  eximir_cobro: true 
  // Sin motivo claro!
});

// No notificar al paciente sin razón
cancelarCualquierTurno({ 
  notificar_paciente: false 
  // ¿Por qué no notificar?
});
```

✅ **SÍ hacer:**
```javascript
// Documentar todo
cancelarCualquierTurno({
  id_turno,
  motivo: "Razón clara y específica",
  eximir_cobro: requiereExencion(motivo),
  notificar_paciente: true,
  notas_admin: "Detalles para auditoría"
});

// Si se exime, justificar
if (eximir_cobro) {
  notas_admin = `Exención justificada: ${motivo_exencion}`;
}
```

## 📝 NOTAS IMPORTANTES

- 📋 **Documentación:** Siempre documentar motivo y notas
- 💰 **Exenciones:** Solo en casos justificados (urgencias, errores del consultorio)
- 📱 **Notificaciones:** Default: SIEMPRE notificar al paciente
- 🔄 **Reagendar:** Si es responsabilidad del consultorio, ofrecer nuevo turno
- 🔒 **Auditoría:** Registrar todas las cancelaciones administrativas

## ⚠️ CUANDO EXIMIR COBRO

### Eximir SIEMPRE:
- ✅ Internación o urgencia médica grave
- ✅ Error administrativo del consultorio
- ✅ Consultorio cerrado por imprevisto
- ✅ Reprogramación solicitada por el consultorio
- ✅ Turno duplicado por error

### Evaluar caso por caso:
- ⚠️ Problemas de salud no graves
- ⚠️ Problemas familiares urgentes
- ⚠️ Casos de fuerza mayor

### NO eximir:
- ❌ "Me olvidé"
- ❌ "Se me complicó"
- ❌ Cancelaciones reiteradas sin justificación

---

**DIFERENCIA CLAVE:** Admin puede cancelar cualquier turno y tiene discreción para eximir cobros en casos justificados. Usar con responsabilidad y documentar.


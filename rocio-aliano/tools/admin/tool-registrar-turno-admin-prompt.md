# Tool: registrarTurnoAdmin (Agente ADMINISTRADOR)

Registra un nuevo turno en la hoja "Turnos" de Google Sheets para cualquier paciente. Tiene capacidades administrativas completas.

## 📋 PARÁMETROS

**OBLIGATORIOS:**
- `fecha` (string): Fecha del turno (DD/MM/AAAA)
- `hora` (string): Hora del turno (HH:MM)
- `nombre_completo` (string): Nombre completo del paciente
- `dni` (string): DNI sin puntos
- `obra_social` (string): `"PAMI"`, `"OSDE"`, `"Particular"`
- `tipo_consulta` (string): Tipo de consulta/estudio
- `primera_vez` (string): `"SI"` / `"NO"`
- `telefono` (string): Teléfono (formato: "11-2345-6789")

**OPCIONALES (solo admin):**
- `estado` (string): Estado inicial del turno
  - Default: `"Confirmado"`
  - Valores: `"Confirmado"`, `"Pendiente"`, `"Cancelado"`, `"Atendido"`, `"No asistió"`
  
- `notas` (string): Observaciones administrativas
  - Ejemplo: `"Turno urgente"`, `"Derivado por emergencia"`

- `forzar_horario` (boolean): Registrar aunque esté ocupado
  - Default: `false`
  - Uso: Sobreturnos, urgencias

## 📤 RETORNA

### Caso 1: Turno registrado exitosamente
```json
{
  "status": "success",
  "turno": {
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
    "fecha_de_registro": "31/12/2024 10:30"
  },
  "paciente_nuevo": false,
  "sobreturno": false,
  "mensaje": "✅ Turno registrado para María González el 06/01/2025 9:00"
}
```

### Caso 2: Sobreturno (horario ocupado pero forzado)
```json
{
  "status": "success",
  "turno": { ... },
  "sobreturno": true,
  "advertencia": "⚠️ Sobreturno registrado. Horario originalmente ocupado.",
  "mensaje": "✅ Sobreturno registrado para María González"
}
```

### Caso 3: Error (horario ocupado, sin forzar)
```json
{
  "status": "error",
  "codigo": "HORARIO_OCUPADO",
  "mensaje": "El horario 06/01/2025 9:00 ya está ocupado",
  "ocupado_por": {
    "nombre": "Juan Pérez",
    "dni": "40111222"
  },
  "sugerencia": "Use forzar_horario: true para crear sobreturno"
}
```

## 🎯 CAPACIDADES ADMINISTRATIVAS

### Diferencias con agente PACIENTE:

1. **Registrar para cualquier paciente** (no solo el autenticado)
2. **Crear sobreturnos** con `forzar_horario: true`
3. **Establecer estado inicial** (ej: "Pendiente" para turnos sin confirmar)
4. **Agregar notas administrativas** invisibles para el paciente
5. **Registrar turnos en fechas pasadas** (para historial)
6. **Modificar turnos de días administrativos** (CIRUGIA, CONTROL, MEDICION)

## ⚙️ ACCIONES AUTOMÁTICAS

Igual que versión paciente, más:

1. **Permite fechas pasadas** (para registrar historial)
2. **Permite sobreturnos** si `forzar_horario: true`
3. **Guarda notas administrativas** si se proporcionan
4. **Puede cambiar estado inicial** a "Pendiente" si aún no confirmó con paciente

## 💡 EJEMPLOS DE USO

### Ejemplo 1: Registrar turno estándar
```
Admin: "Registrar turno para Roberto García, DNI 40111222, 
        mañana 9:00, consulta, particular"

[Llama: registrarTurnoAdmin({
  fecha: "01/01/2025",
  hora: "9:00",
  nombre_completo: "Roberto García",
  dni: "40111222",
  obra_social: "Particular",
  tipo_consulta: "Consulta",
  primera_vez: "SI",
  telefono: "11-5555-1234",
  estado: "Pendiente"  // Aún no confirmó con el paciente
})]

→ Retorna: { status: "success" }

Agente: "✅ Turno registrado para Roberto García.
         Estado: Pendiente (llamar para confirmar)"
```

### Ejemplo 2: Crear sobreturno urgente
```
Admin: "Urgencia, registrar sobreturno para emergencia 
        hoy 10:00, María López DNI 35888999"

[Llama: registrarTurnoAdmin({
  fecha: "31/12/2024",
  hora: "10:00",
  nombre_completo: "María López",
  dni: "35888999",
  obra_social: "OSDE",
  tipo_consulta: "Urgencia",
  primera_vez: "NO",
  telefono: "11-6666-7777",
  forzar_horario: true,  // ← Permite sobreturno
  notas: "Urgencia - Ojo rojo con dolor"
})]

→ Retorna: { 
    status: "success", 
    sobreturno: true,
    advertencia: "Sobreturno registrado" 
}

Agente: "✅ Sobreturno urgente registrado.
         ⚠️ Horario originalmente ocupado.
         Notas: Urgencia - Ojo rojo con dolor"
```

### Ejemplo 3: Registrar turno histórico (fecha pasada)
```
Admin: "Registrar que Juan Pérez DNI 30111222 vino el 15/11/2024"

[Llama: registrarTurnoAdmin({
  fecha: "15/11/2024",  // Fecha pasada OK para admin
  hora: "9:00",
  nombre_completo: "Juan Pérez",
  dni: "30111222",
  obra_social: "PAMI",
  tipo_consulta: "Consulta",
  primera_vez: "NO",
  telefono: "11-4444-3333",
  estado: "Atendido"  // Ya fue atendido
})]

→ Actualiza historial del paciente
→ Incrementa total_consultas
→ Actualiza ultima_visita

Agente: "✅ Turno histórico registrado.
         Total de consultas de Juan Pérez: 5"
```

### Ejemplo 4: Error - Horario ocupado sin forzar
```
Admin: "Registrar turno para Pedro Gómez, 06/01 9:00"

[Llama: registrarTurnoAdmin({
  fecha: "06/01/2025",
  hora: "9:00",
  ... otros datos ...
  // forzar_horario: false (default)
})]

→ Retorna: { 
    status: "error",
    codigo: "HORARIO_OCUPADO",
    ocupado_por: { nombre: "María González", dni: "35123456" },
    sugerencia: "Use forzar_horario: true"
}

Agente: "⚠️ El horario 06/01 9:00 ya está ocupado por María González.
         ¿Desea crear un sobreturno? (SÍ/NO)"

Admin: "Sí"

[Llama con forzar_horario: true]
```

## 🔒 PERMISOS ADMINISTRATIVOS

### El agente admin PUEDE:
- ✅ Registrar para cualquier paciente (cualquier DNI)
- ✅ Crear sobreturnos (horarios ocupados)
- ✅ Registrar en fechas pasadas (historial)
- ✅ Establecer cualquier estado inicial
- ✅ Agregar notas administrativas
- ✅ Registrar en días CIRUGIA, CONTROL, MEDICION, DIA_LIBRE
- ✅ Modificar `fecha_de_registro` manualmente (si es histórico)

### El agente admin DEBE:
- ⚠️ Confirmar sobreturnos con el operador
- ⚠️ Validar datos antes de registrar
- ⚠️ Notificar a secretaria si crea urgencia
- ⚠️ Actualizar estado a "Confirmado" después de confirmar con paciente

## ⚙️ VALIDACIONES ADMIN

### Validar datos básicos:
```javascript
function validarDatosAdmin(datos) {
  const errores = [];
  
  // DNI válido
  if (!/^\d{7,8}$/.test(datos.dni)) {
    errores.push("DNI inválido");
  }
  
  // Hora válida
  const horasValidas = ["8:40", "9:00", "9:20", "9:40", "10:00", 
                        "10:40", "11:00", "11:20", "11:40", "12:00"];
  if (!horasValidas.includes(datos.hora)) {
    errores.push("Hora no válida");
  }
  
  // Obra social válida
  const obrasSociales = ["PAMI", "OSDE", "Particular"];
  if (!obrasSociales.includes(datos.obra_social)) {
    errores.push("Obra social inválida");
  }
  
  return errores.length > 0 ? { valido: false, errores } : { valido: true };
}
```

### Confirmar sobreturno:
```javascript
async function confirmarSobreturno(fecha, hora) {
  const ocupado = await verificarHorario(fecha, hora);
  
  if (ocupado) {
    return preguntar(
      `⚠️ El horario ${fecha} ${hora} ya está ocupado por ${ocupado.nombre}.
      ¿Desea crear un sobreturno? (SÍ/NO)`
    );
  }
  return true; // Horario libre, no necesita confirmación
}
```

## 📊 FLUJO COMPLETO ADMIN

```
1. Admin solicita registrar turno
2. Capturar datos (o extraerlos del mensaje)
3. Validar datos básicos
4. Verificar si horario está ocupado
   ├─ Si libre → Registrar directamente
   └─ Si ocupado → Preguntar si desea sobreturno
5. Si es urgencia → Establecer estado "Urgente" y notas
6. Llamar registrarTurnoAdmin({ ...datos, forzar_horario: ? })
7. Evaluar resultado:
   ├─ Si success → Confirmar y mostrar detalles
   ├─ Si sobreturno → Alertar y notificar
   └─ Si error → Mostrar sugerencia
8. Sugerir acciones adicionales:
   - "¿Desea notificar al paciente?"
   - "¿Agregar observación?"
```

## 💬 RESPUESTAS ADMIN

### Éxito - Turno estándar:
```
"✅ Turno registrado
👤 [Nombre] (DNI: [DNI])
📅 [Fecha] [Hora]
🏥 [Tipo] - [Obra Social]
Estado: [Estado]

¿Desea notificar al paciente?"
```

### Éxito - Sobreturno:
```
"⚠️ Sobreturno registrado
👤 [Nombre] (DNI: [DNI])
📅 [Fecha] [Hora]
🚨 Horario originalmente ocupado

⚠️ Verificar disponibilidad real con la Dra.
¿Desea notificar al paciente?"
```

### Éxito - Turno histórico:
```
"✅ Turno histórico registrado
👤 [Nombre] (DNI: [DNI])
📅 [Fecha pasada]
Estado: Atendido

Historial actualizado:
• Total consultas: [N]
• Última visita: [Fecha]"
```

## 🔍 CASOS ESPECIALES ADMIN

### Turno en día administrativo:
```javascript
// Permitir registrar en CIRUGIA, CONTROL, etc.
registrarTurnoAdmin({
  fecha: "06/01/2025", // Es día CIRUGIA
  tipo_consulta: "Cirugía cataratas",
  notas: "Confirmar con quirófano"
});
```

### Turno múltiple (mismo paciente, mismo día):
```javascript
// Paciente tiene estudios + consulta el mismo día
// Admin puede registrar ambos
registrarTurnoAdmin({ fecha: "06/01", hora: "9:00", tipo_consulta: "OCT" });
registrarTurnoAdmin({ fecha: "06/01", hora: "10:00", tipo_consulta: "Consulta" });
```

### Turno de bebé (prioridad):
```javascript
registrarTurnoAdmin({
  nombre_completo: "Bebé de María González",
  tipo_consulta: "Control RN",
  notas: "Bebé recién nacido - PRIORIDAD",
  forzar_horario: true  // Sobreturno permitido para bebés
});
```

## 🚫 ERRORES COMUNES

❌ **NO hacer:**
```javascript
// Crear sobreturno sin confirmar
registrarTurnoAdmin({ ..., forzar_horario: true }); // Sin preguntar!

// No validar datos antes de registrar
registrarTurnoAdmin({ obra_social: "Swiss Medical" }); // No trabajamos!
```

✅ **SÍ hacer:**
```javascript
// Confirmar sobreturno
const confirma = await confirmarSobreturno(fecha, hora);
if (confirma) {
  registrarTurnoAdmin({ ..., forzar_horario: true });
}

// Validar datos
const validacion = validarDatosAdmin(datos);
if (!validacion.valido) {
  return error(validacion.errores);
}
```

---

**DIFERENCIA CLAVE:** Admin puede registrar para cualquier paciente y crear sobreturnos. Usar con responsabilidad.


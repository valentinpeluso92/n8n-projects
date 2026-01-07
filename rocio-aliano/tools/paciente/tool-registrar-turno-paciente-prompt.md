# Tool: registrarTurno (Agente PACIENTE)

Registra un nuevo turno en la hoja "Turnos" de Google Sheets para el paciente actual. Si es paciente nuevo, también lo crea en la hoja "Pacientes".

## 📋 PARÁMETROS

**OBLIGATORIOS:**
- `fecha` (string): Fecha del turno (formato DD/MM/AAAA)
  - Ejemplo: `"06/01/2025"`
  - DEBE ser fecha futura (>= hoy)

- `hora` (string): Hora del turno (formato HH:MM)
  - Ejemplo: `"9:00"`
  - Valores válidos: horarios de agenda (8:40, 9:00, 9:20, 9:40, 10:00, 10:40, 11:00, 11:20, 11:40)

- `nombre_completo` (string): Nombre completo del paciente
  - Ejemplo: `"María González"`

- `dni` (string): DNI sin puntos
  - Ejemplo: `"35123456"`

- `obra_social` (string): Obra social del paciente
  - Valores: `"PAMI"`, `"OSDE"`, `"Particular"`

- `tipo_consulta` (string): Tipo de consulta/estudio
  - Valores: `"Consulta"`, `"OCT"`, `"Campo Visual"`, `"Fondo de Ojo"`, etc.

- `telefono` (string): Teléfono de contacto
  - Formato recomendado: `"2342-567890"` (código de área + número)
  - También aceptado: `"2342567890"` (sin guiones)
  - Ejemplo: `"2342-123456"`, `"11-23456789"`

**⚠️ IMPORTANTE:** 
- La tool **determina automáticamente** si es primera vez consultando la base de datos de pacientes
- NO es necesario llamar `buscarPacientePorDNI` antes de usar esta tool
- La tool se encarga de crear o actualizar el registro del paciente según corresponda

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
    "telefono": "2342-567890",
    "fecha_de_registro": "31/12/2024 10:30"
  },
  "paciente_nuevo": false,
  "mensaje": "✅ Turno confirmado para el Lunes 6/1 a las 9:00"
}
```

### Caso 2: Error (horario ocupado)
```json
{
  "status": "error",
  "codigo": "HORARIO_OCUPADO",
  "mensaje": "El horario 06/01/2025 9:00 ya está ocupado",
  "sugerencia": "Intente con otro horario"
}
```

### Caso 3: Error (validación)
```json
{
  "status": "error",
  "codigo": "VALIDACION",
  "mensaje": "La fecha debe ser futura",
  "campo": "fecha"
}
```

## 🎯 CUÁNDO USAR

1. **Después de confirmar disponibilidad** con `consultarDisponibilidadAgenda`
2. **Después de capturar todos los datos** del paciente
3. **Después de validar requisitos PAMI** (si aplica)
4. **Cuando el paciente confirma** fecha y hora ofrecida

## ⚙️ ACCIONES AUTOMÁTICAS

### La tool ejecuta automáticamente:

1. **Busca paciente en BD** por DNI:
   - Consulta hoja "Pacientes" para verificar si existe
   - Determina automáticamente si es primera vez

2. **Determina `primera_vez`**:
   - Si NO existe en "Pacientes" → `primera_vez: "SI"`
   - Si existe y es PAMI con última visita > 1 año → `primera_vez: "SI"`
   - Si existe y última visita < 1 año → `primera_vez: "NO"`

3. **Genera ID único** del turno:
   ```javascript
   id = `turno_${fecha.replace(/\//g, '')}_${Date.now()}`
   // Ejemplo: "turno_06012025_1703952341234"
   ```

4. **Registra en hoja "Turnos"**:
   - Guarda todos los datos proporcionados
   - Incluye `primera_vez` determinado automáticamente
   - Establece `estado: "Confirmado"`
   - Registra `fecha_de_registro` actual

5. **Si es paciente nuevo**:
   - Crea registro en "Pacientes" con:
     ```javascript
     {
       id: `pac_${dni}`,
       dni: dni,
       nombre_completo: nombre_completo,
       obra_social: obra_social,
       telefono: telefono,
       ultima_visita: fecha,  // Fecha del turno registrado
       total_consultas: 1
     }
     ```

6. **Si es paciente recurrente**:
   - Actualiza `ultima_visita` con fecha del nuevo turno
   - Incrementa `total_consultas` en 1

## 🔒 SEGURIDAD

### Agente PACIENTE:
- ✅ Solo registra turnos para el DNI del usuario autenticado
- ✅ Solo puede registrar UN turno a la vez
- ❌ NO puede registrar turnos para otros DNIs
- ⚠️ Validar que DNI en parámetros coincide con DNI del usuario

## 📊 ESTRUCTURA GOOGLE SHEETS

### Hoja: Turnos (escritura)
Inserta nueva fila con todas las columnas.

### Hoja: Pacientes (escritura/actualización)
- Si nuevo → Inserta nueva fila
- Si existe → Actualiza `ultima_visita` y `total_consultas`

### Hoja: Agenda (lectura)
Consulta para validar que el horario esté libre.

## 💡 EJEMPLOS DE USO

### Ejemplo 1: Paciente nuevo, primera vez
```
[Datos capturados:]
- nombre: "María González"
- dni: "35123456"
- obra_social: "Particular"
- telefono: "2342-567890"

[Disponibilidad consultada:]
- fecha: "06/01/2025"
- hora: "9:00"

[Usuario confirma:]
Usuario: "Sí, me viene bien"

[Llama: registrarTurno({
  fecha: "06/01/2025",
  hora: "9:00",
  nombre_completo: "María González",
  dni: "35123456",
  obra_social: "Particular",
  tipo_consulta: "Consulta",
  telefono: "2342-567890"
})]

→ Tool busca DNI en "Pacientes" (NO existe)
→ Tool determina: primera_vez = "SI"
→ Crea turno en "Turnos" con primera_vez: "SI"
→ Crea paciente en "Pacientes" con total_consultas: 1
→ Retorna: { 
    status: "success", 
    paciente_nuevo: true,
    turno: { ..., primera_vez: "SI" }
}

Agente: "✅ Turno confirmado para el Lunes 6/1 a las 9:00.
         Le enviaremos un recordatorio el día anterior."
```

### Ejemplo 2: Paciente PAMI recurrente
```
[Datos capturados:]
- nombre: "José Pérez"
- dni: "28999888"
- obra_social: "PAMI"
- tipo_consulta: "Control"
- telefono: "2342-123456"

[Usuario confirma horario]

[Llama: registrarTurno({
  fecha: "06/01/2025",
  hora: "10:00",
  nombre_completo: "José Pérez",
  dni: "28999888",
  obra_social: "PAMI",
  tipo_consulta: "Control",
  telefono: "2342-123456"
})]

→ Tool busca DNI en "Pacientes" (SÍ existe)
→ Tool verifica ultima_visita: "15/11/2024" (hace 2 meses)
→ Tool determina: primera_vez = "NO"
→ Crea turno en "Turnos" con primera_vez: "NO"
→ Actualiza "Pacientes":
   • ultima_visita: "06/01/2025"
   • total_consultas: 5 → 6
→ Retorna: { 
    status: "success", 
    paciente_nuevo: false,
    turno: { ..., primera_vez: "NO" }
}

Agente: "✅ Turno confirmado para el Lunes 6/1 a las 10:00.
         Recuerde traer la app de PAMI con el código token."
```

### Ejemplo 3: Paciente PAMI +1 año (considerado como primera vez)
```
[Llama: registrarTurno({
  fecha: "06/01/2025",
  hora: "9:00",
  nombre_completo: "Carlos Ramírez",
  dni: "30111222",
  obra_social: "PAMI",
  tipo_consulta: "Consulta",
  telefono: "2342-789012"
})]

→ Tool busca DNI en "Pacientes" (SÍ existe)
→ Tool verifica ultima_visita: "10/11/2023" (hace más de 1 año)
→ Tool determina: primera_vez = "SI" (para efectos de PAMI)
→ Crea turno en "Turnos" con primera_vez: "SI"
→ Actualiza "Pacientes":
   • ultima_visita: "06/01/2025"
   • total_consultas: 2 → 3
→ Retorna: { 
    status: "success", 
    paciente_nuevo: false,
    turno: { ..., primera_vez: "SI" }
}

Agente: "✅ Turno confirmado para el Lunes 6/1 a las 9:00.
         Como hace más de 1 año que no viene, necesita:
         • App de PAMI con código token
         • Orden de primera consulta (cod 429001)"
```

### Ejemplo 4: Error - Horario ocupado
```
[Llama: registrarTurno({...
  fecha: "06/01/2025",
  hora: "9:00",
  ...
})]

→ Retorna: { 
    status: "error", 
    codigo: "HORARIO_OCUPADO",
    mensaje: "El horario ya está ocupado"
}

Agente: "Lo siento, ese horario ya fue tomado.
         Le busco otra alternativa..."
[Vuelve a llamar consultarDisponibilidadAgenda]
```

## ⚠️ VALIDACIONES PRE-REGISTRO

### Antes de llamar la tool, validar:

```javascript
// 1. Fecha futura
function validarFecha(fecha) {
  const fechaTurno = parseFecha(fecha); // DD/MM/AAAA
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  
  if (fechaTurno < hoy) {
    return { valido: false, error: "La fecha debe ser futura" };
  }
  return { valido: true };
}

// 2. Hora válida
function validarHora(hora) {
  const horasValidas = ["8:40", "9:00", "9:20", "9:40", "10:00", 
                        "10:40", "11:00", "11:20", "11:40"];
  if (!horasValidas.includes(hora)) {
    return { valido: false, error: "Hora no disponible" };
  }
  return { valido: true };
}

// 3. DNI del usuario autenticado
function validarDNI(dniTurno, dniUsuario) {
  if (dniTurno !== dniUsuario) {
    return { valido: false, error: "Solo puede registrar turnos para usted" };
  }
  return { valido: true };
}

// 4. Datos completos
function validarDatosCompletos(datos) {
  // ⚠️ NO incluir 'primera_vez' - la tool lo determina automáticamente
  const requeridos = ['fecha', 'hora', 'nombre_completo', 'dni', 
                      'obra_social', 'tipo_consulta', 'telefono'];
  const faltantes = requeridos.filter(campo => !datos[campo]);
  
  if (faltantes.length > 0) {
    return { 
      valido: false, 
      error: `Faltan datos: ${faltantes.join(', ')}` 
    };
  }
  return { valido: true };
}
```

## 🔄 FLUJO COMPLETO DE REGISTRO

```
1. Capturar datos del paciente (nombre, DNI, obra social, teléfono)
2. Validar requisitos PAMI (si aplica: app + orden si primera vez)
3. Determinar tipoDia según obra social
4. Llamar consultarDisponibilidadAgenda({ tipoDia })
5. Ofrecer fecha/hora disponible
6. Usuario confirma
7. ✅ Llamar registrarTurno({ fecha, hora, nombre_completo, dni, obra_social, tipo_consulta, telefono })
   → La tool automáticamente:
   • Busca si el paciente existe en BD
   • Determina si es primera vez (o +1 año para PAMI)
   • Registra el turno
   • Crea o actualiza el paciente
8. Evaluar resultado:
   ├─ Si success → Confirmar y dar instrucciones según primera_vez
   ├─ Si error HORARIO_OCUPADO → Buscar nueva disponibilidad
   ├─ Si error VALIDACION → Corregir dato y reintentar
   └─ Si error técnico → derivarASecretaria
9. Enviar recordatorio final con requisitos según obra social y primera_vez
```

## 📝 MENSAJE DE CONFIRMACIÓN

### Estructura sugerida (basada en respuesta de la tool):

```javascript
// Leer respuesta de registrarTurno
const resultado = registrarTurno({ ... });
const turno = resultado.turno;
const esPrimeraVez = turno.primera_vez === "SI";
const esPAMI = turno.obra_social === "PAMI";
```

```
✅ Turno confirmado

📅 Fecha: [DiaSemana] [DD/MM/AAAA]
⏰ Hora: [HH:MM]hs
👤 Paciente: [Nombre]
🏥 Tipo: [Consulta/Estudio]

[Si PAMI y primera_vez === "SI":]
⚠️ Requisitos PAMI (Primera Vez):
• App de PAMI con código token
• Orden de primera consulta oftalmológica (código 429001)

[Si PAMI y primera_vez === "NO":]
⚠️ Requisito PAMI:
• App de PAMI con código token

[Si Particular:]
💰 Consulta: $40.000 en efectivo

📍 Dirección: [Dirección del consultorio]

⚠️ Las cancelaciones deben hacerse con 24hs de anticipación.
En caso de no asistir, se cobrará la consulta.

¿Necesita algo más?
```

## 🚫 ERRORES COMUNES

❌ **NO hacer:**
```javascript
// Registrar sin consultar disponibilidad primero
registrarTurno({ fecha: "06/01/2025", hora: "9:00" }); // Puede estar ocupado!

// No validar fecha futura
registrarTurno({ fecha: "01/12/2024", ... }); // Fecha pasada!

// No verificar DNI del usuario
registrarTurno({ dni: "otro_dni", ... }); // Inseguro!
```

✅ **SÍ hacer:**
```javascript
// 1. Consultar disponibilidad
const disponibilidad = consultarDisponibilidadAgenda({ tipoDia });

// 2. Usuario confirma horario
const horaElegida = disponibilidad.proximoTurno;

// 3. Validar fecha futura
const esValido = validarFecha(horaElegida.fecha);

// 4. Validar DNI
if (datos.dni !== usuarioAutenticado.dni) {
  return error("Solo puede registrar turnos para usted");
}

// 5. Registrar
const resultado = registrarTurno({ ...datos });
```

## 💬 RESPUESTAS POST-REGISTRO

### Éxito - Paciente Particular/OSDE:
```
"✅ Turno confirmado para el Lunes 6/1 a las 9:00.
La consulta tiene un costo de $40.000 en efectivo.
Le enviaremos un recordatorio el día anterior."
```

### Éxito - PAMI primera vez:
```
"✅ Turno confirmado para el Lunes 6/1 a las 9:00.
Recuerde traer:
• App de PAMI con código token
• Orden de primera consulta (cod 429001)
Le enviaremos un recordatorio."
```

### Éxito - PAMI control:
```
"✅ Turno confirmado para el Lunes 6/1 a las 9:00.
Recuerde traer la app de PAMI con el código token.
Le enviaremos un recordatorio."
```

### Error - Horario ocupado:
```
"Lo siento, ese horario acaba de ser tomado.
Le busco otra alternativa..."
[Volver a consultar disponibilidad]
```

---

**IMPORTANTE:** Siempre llamar `consultarDisponibilidadAgenda` ANTES de `registrarTurno` para evitar conflictos de horarios.


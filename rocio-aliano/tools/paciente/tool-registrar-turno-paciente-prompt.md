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

- `primera_vez` (string): Si es primera visita al consultorio
  - Valores: `"SI"`, `"NO"`

- `telefono` (string): Teléfono de contacto
  - Formato: `"11-2345-6789"`

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

1. **Genera ID único** del turno:
   ```javascript
   id = `turno_${fecha.replace(/\//g, '')}_${Date.now()}`
   // Ejemplo: "turno_06012025_1703952341234"
   ```

2. **Registra en hoja "Turnos"**:
   - Guarda todos los datos proporcionados
   - Establece `estado: "Confirmado"`
   - Registra `fecha_de_registro` actual

3. **Si es paciente nuevo** (`primera_vez === "SI"`):
   - Verifica que no exista en "Pacientes" (por DNI)
   - Crea registro con:
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

4. **Si es paciente recurrente**:
   - Busca paciente en "Pacientes" por DNI
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
- primera_vez: "SI"
- telefono: "11-2345-6789"

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
  primera_vez: "SI",
  telefono: "11-2345-6789"
})]

→ Crea turno en "Turnos"
→ Crea paciente en "Pacientes"
→ Retorna: { status: "success", paciente_nuevo: true }

Agente: "✅ Turno confirmado para el Lunes 6/1 a las 9:00.
         Le enviaremos un recordatorio el día anterior."
```

### Ejemplo 2: Paciente PAMI recurrente
```
[Paciente ya existe, última visita: 15/11/2024]

[Llama: registrarTurno({
  fecha: "06/01/2025",
  hora: "10:00",
  nombre_completo: "José Pérez",
  dni: "28999888",
  obra_social: "PAMI",
  tipo_consulta: "Control",
  primera_vez: "NO",
  telefono: "11-9876-5432"
})]

→ Crea turno en "Turnos"
→ Actualiza "Pacientes":
   • ultima_visita: "06/01/2025"
   • total_consultas: 5 → 6

Agente: "✅ Turno confirmado para el Lunes 6/1 a las 10:00.
         Recuerde traer la app de PAMI con el código token."
```

### Ejemplo 3: Error - Horario ocupado
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
  const requeridos = ['fecha', 'hora', 'nombre_completo', 'dni', 
                      'obra_social', 'tipo_consulta', 'primera_vez', 'telefono'];
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
1. Capturar datos del paciente (nombre, DNI, obra social)
2. Validar requisitos PAMI (si aplica)
3. Determinar tipoDia según obra social
4. Llamar consultarDisponibilidadAgenda({ tipoDia })
5. Ofrecer fecha/hora disponible
6. Usuario confirma
7. ✅ Llamar registrarTurno({ ...datos })
8. Evaluar resultado:
   ├─ Si success → Confirmar y dar instrucciones
   ├─ Si error HORARIO_OCUPADO → Buscar nueva disponibilidad
   ├─ Si error VALIDACION → Corregir dato y reintentar
   └─ Si error técnico → derivarASecretaria
9. Enviar recordatorio final con todos los detalles
```

## 📝 MENSAJE DE CONFIRMACIÓN

### Estructura sugerida:
```
✅ Turno confirmado

📅 Fecha: [DiaSemana] [DD/MM/AAAA]
⏰ Hora: [HH:MM]hs
👤 Paciente: [Nombre]
🏥 Tipo: [Consulta/Estudio]

[Si PAMI:]
⚠️ Requisitos PAMI:
• App de PAMI con código token
[Si primera vez: • Orden de primera consulta (cod 429001)]

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
La consulta tiene un costo de [PRECIO].
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


# Tool: registrarTurno (Agente PACIENTE)

Registra un nuevo turno en la hoja "Turnos" de Google Sheets para el paciente actual. Si es paciente nuevo, también lo crea en la hoja "Pacientes".

## 🎯 CUÁNDO Y POR QUÉ USAR ESTA TOOL

**Llama a esta tool cuando necesites:**
- Confirmar y registrar un turno nuevo después de que el paciente eligió fecha y horario
- Crear el registro completo del turno en el sistema
- Registrar un paciente nuevo automáticamente si es su primera vez

**Requisitos previos:**
- Debes haber capturado TODOS los datos requeridos: nombre completo, DNI, obra social, teléfono, tipo de consulta, fecha y horario elegidos
- NO necesitas llamar a `buscarPacientePorDNI` antes - Esta tool lo hace automáticamente para determinar si es primera vez

**📖 Para más detalles** (parámetros completos, mensajes de confirmación según primera_vez, validaciones, ejemplos), consulta la sección "HERRAMIENTAS DISPONIBLES" en el prompt principal del agente paciente.

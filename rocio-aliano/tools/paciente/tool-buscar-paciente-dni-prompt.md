# Tool: buscarPacientePorDNI

Busca un paciente en la hoja "Pacientes" de Google Sheets por su número de DNI.

## 🎯 CUÁNDO Y POR QUÉ USAR ESTA TOOL

**Llama a esta tool cuando necesites:**
- **FLUJO B y C:** Verificar si un paciente existe antes de consultar o modificar sus turnos
- Obtener información de un paciente existente (nombre, obra social, teléfono, última visita)

**⚠️ NO usar en:**
- **FLUJO A (Solicitar turno nuevo)** - La tool `registrarTurno` determina automáticamente si es primera vez
- Para buscar turnos del paciente - Usar `buscarTurnosPorDNI` para eso

**📖 Para más detalles** (parámetros, ejemplos, validaciones), consulta la sección "HERRAMIENTAS DISPONIBLES" en el prompt principal del agente paciente.

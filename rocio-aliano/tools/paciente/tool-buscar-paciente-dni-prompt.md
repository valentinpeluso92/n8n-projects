# Tool: buscarPacientePorDNI

Busca un paciente en la hoja "Pacientes" de Google Sheets por su número de DNI.

## 🎯 CUÁNDO Y POR QUÉ USAR ESTA TOOL

**:**
- **FLUJO B y C:** Verificar si un paciente existe antes de consultar o modificar sus turnos
- **FLUJO A (EXCEPCIÓN):** Si el paciente tiene PAMI, buscar para determinar si es PAMI_NUEVO o PAMI_VIEJO antes de consultar disponibilidad
- Obtener información de un paciente existente (nombre, obra social, teléfono, última visita)

**⚠️ NO usar para:**
- Determinar si es "primera vez" al registrar turno - La tool `registrarTurno` lo hace automáticamente
- Buscar turnos del paciente - Usar `buscarTurnosPorDNI` para eso

**📖 Para más detalles** (parámetros, ejemplos, validaciones), consulta la sección "HERRAMIENTAS DISPONIBLES" en el prompt principal del agente paciente.

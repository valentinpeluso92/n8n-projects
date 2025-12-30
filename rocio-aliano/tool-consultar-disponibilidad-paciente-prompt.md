Consulta horarios disponibles en la agenda de Google Sheets filtrando por tipo de día específico.
Usa esta herramienta cuando el paciente solicite un turno nuevo.

TIPOS DE DÍA VÁLIDOS:
- "PARTICULAR": Para pacientes particulares, OSDE, bebés
- "PAMI_NUEVO": Para pacientes PAMI primera vez o +1 año sin consultar
- "PAMI_VIEJO": Para pacientes PAMI que ya consultaron (menos de 1 año)

CUÁNDO USAR CADA TIPO:
• Si el paciente es Particular u OSDE → tipoDia: "PARTICULAR"
• Si el paciente es bebé → tipoDia: "PARTICULAR"
• Si el paciente es PAMI primera vez → tipoDia: "PAMI_NUEVO"
• Si el paciente es PAMI +1 año sin venir → tipoDia: "PAMI_NUEVO"
• Si el paciente es PAMI y ya vino hace menos de 1 año → tipoDia: "PAMI_VIEJO"

PARÁMETROS:
- tipoDia (OBLIGATORIO): Tipo de día según el paciente
- fechaDesde (OPCIONAL): Fecha desde la cual buscar (formato DD/MM/AAAA)

RETORNA:
- status: "success" o "error"
- proximoTurno: { fecha, diaSemana, hora }
- disponibilidad: Array con todos los horarios libres
- mensaje: Descripción del resultado

IMPORTANTE:
• Úsala UNA SOLA VEZ por solicitud de turno
• Siempre determina el tipoDia correcto ANTES de llamar la herramienta
• Solo retorna horarios en días del tipo especificado
• Solo retorna fechas FUTURAS (nunca en el pasado)
• Si retorna status "error" → Solicitar teléfono y derivar a secretaria

EJEMPLOS DE USO:

Ejemplo 1 - Paciente Particular:
Paciente: "Soy particular, quiero un turno"
→ Llamar: consultarDisponibilidadAgenda({ tipoDia: "PARTICULAR" })

Ejemplo 2 - PAMI primera vez:
Paciente: "Tengo PAMI, es mi primera vez"
→ Llamar: consultarDisponibilidadAgenda({ tipoDia: "PAMI_NUEVO" })

Ejemplo 3 - PAMI control:
Paciente: "Tengo PAMI, vine hace 6 meses"
→ Llamar: consultarDisponibilidadAgenda({ tipoDia: "PAMI_VIEJO" })

NUNCA uses: "CIRUGIA", "CONTROL", "MEDICION", "DIA_LIBRE" (son para uso administrativo)
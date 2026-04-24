export function generateCertificateId(eventId: string, sequenceNumber: number) {
  const shortEventId = eventId.toString().slice(-4).toUpperCase();
  const year = new Date().getFullYear().toString();
  const paddedSeq = sequenceNumber.toString().padStart(4, "0");
  return `CC-${year}-EVT${shortEventId}-${paddedSeq}`;
}


export function getPublicFestivalEventTitle(title?: string | null) {
  return (title || '').replace(/\b(?:lyka|laika)\b/gi, 'LAIKA');
}

export function getFestivalAttendanceLabel(attendanceType?: string) {
  if (attendanceType?.trim().toLowerCase() === 'free') return undefined;

  const labels: Record<string, string> = {
    paid: 'Paid',
    donation: 'Donation',
    registrationRequired: 'Registration required',
    inviteOnly: 'Invite only',
  };
  return attendanceType ? labels[attendanceType] || attendanceType : undefined;
}

export function getPublicFestivalEventTitle(title?: string | null) {
  return (title || '').replace(/\b(?:lyka|laika)\b/gi, 'LAIKA');
}

export function getFestivalAttendanceLabel(attendanceType?: string) {
  const labels: Record<string, string> = {
    free: 'Free',
    paid: 'Paid',
    donation: 'Donation',
    registrationRequired: 'Registration required',
    inviteOnly: 'Invite only',
  };
  return attendanceType ? labels[attendanceType] || attendanceType : undefined;
}

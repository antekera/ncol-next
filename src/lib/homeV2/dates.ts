export function formatHomeDate(
  value: string | undefined,
  time = false
): string | null {
  if (!value) return null
  // WPGraphQL's date is local to the editorial timezone when no offset exists.
  let source = value
  if (value.length === 19) source = `${value}-04:00`
  if (value.length === 10) source = `${value}T12:00:00-04:00`
  const date = new Date(source)
  if (!Number.isFinite(date.getTime())) return null
  return new Intl.DateTimeFormat(
    'es-VE',
    time
      ? {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
          timeZone: 'America/Caracas'
        }
      : {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
          timeZone: 'America/Caracas'
        }
  ).format(date)
}

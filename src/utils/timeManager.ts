export type TTime = {
  hour: number
  minute: number
  daysLeft: number
  repeat: boolean
}

export const timeToString = (time: TTime): string => {
  return `${time.hour}:${time.minute}|${time.daysLeft}${
    time.repeat ? '|R' : ''
  }`
}

export const stringToTime = (time: string): TTime | undefined => {
  const parsed = time.split('|')
  if (parsed.length < 2) return
  const repeat = parsed.length === 3
  const t = parsed[0].split(':')
  if (t.length < 2) return
  const daysLeft = +parsed[1]
  return {
    hour: +t[0],
    minute: +t[1],
    daysLeft,
    repeat,
  }
}

export const isTime = (time: string): boolean => {
  const parsed = time.split('|')
  if (!parsed || (parsed.length !== 3 && parsed.length !== 2)) return false
  const t = parsed[0].split(':')
  if (!t || t.length !== 2) return false
  return true
}

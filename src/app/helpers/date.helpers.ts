/** El próximo sábado (o hoy, si es sábado) a la hora indicada. */
export function nextSaturday(hours = 0, minutes = 0): Date {
    const date = new Date();
    const daysUntilSaturday = (6 - date.getDay() + 7) % 7;
    date.setDate(date.getDate() + daysUntilSaturday);
    date.setHours(hours, minutes, 0, 0);
    return date;
}

/** Fecha en formato ISO local `YYYY-MM-DDTHH:mm`, como lo espera `ion-datetime`. */
export function toLocalIsoString(date: Date): string {
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
        + `T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

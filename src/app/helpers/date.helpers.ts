export function nextSaturday() {
    const date = new Date();
    const saturday = date.getDate() - (date.getDay() - 1) + 5;
    return new Date(date.setDate(saturday));
}

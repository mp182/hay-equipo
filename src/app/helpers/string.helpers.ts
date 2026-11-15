export const EMAIL_PATTERN = '^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\\.[a-zA-Z0-9-.]+$';

export function titleCase(str: string) {
    return str.trim().toLowerCase().split(' ')
        .map(word => (word.charAt(0).toUpperCase() + word.slice(1)))
        .join(' ');
}

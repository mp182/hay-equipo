// La versión de la app sale de `package.json` (se sube con `npm version patch|minor|major`).
// Se importa solo el campo `version`: el resto del package.json no entra en el bundle.
import { version } from '../../package.json';

export const APP_VERSION: string = version;

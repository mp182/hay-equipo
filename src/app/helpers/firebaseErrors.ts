/** Mensaje para mostrar al usuario cuando falla el ingreso con Google. */
export function firebaseErrors(errorCode: string | undefined): string {
    switch (errorCode) {
        case 'auth/popup-closed-by-user':
        case 'auth/cancelled-popup-request':
            // El usuario cerró el popup de Google: no es un error.
            return '';
        case 'auth/popup-blocked':
            return 'El navegador bloqueó la ventana de Google. Permití las ventanas emergentes y probá de nuevo.';
        case 'auth/network-request-failed':
            return 'Por favor chequea tu conexión a Internet.';
        case 'auth/too-many-requests':
            return 'Detectamos muchas peticiones desde tu dispositivo, por favor tomate un descanso!';
        case 'auth/user-disabled':
            return 'Tu cuenta fue deshabilitada o eliminada. Por favor ponete en contacto con el administrador del sistema.';
        default:
            return 'Ups! Algo anda mal. Probá en un rato.';
    }
}

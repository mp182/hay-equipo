export function firebaseErrors(errorCode: string) {

    let message: string;

    switch (errorCode) {
        case 'auth/wrong-password':
            message = 'Credenciales Inválidas.';
            break;
        case 'auth/network-request-failed':
            message = 'Por favor chequea tu conexión a Internet.';
            break;
        case 'auth/too-many-requests':
            message =
                'Detectamos muchas peticiones desde tu dispositivo, por favor tomate un descanso!';
            break;
        case 'auth/user-disabled':
            message =
                'Tu cuenta fue deshabilitada o eliminada. Por favor ponete en contacto con el administrador del sistema.';
            break;
        case 'auth/requires-recent-login':
            message = 'Por favor ingresa de nuevo!';
            break;
        case 'auth/email-already-exists':
            message = 'Ese email ya está siendo usando por otro usuario.';
            break;
        case 'auth/user-not-found':
            message =
                'No podemos encontrar la cuenta asociada a ese email o teléfono.';
            break;
        case 'auth/phone-number-already-exists':
            message = 'Ese teléfono ya está siendo usado por otro usuario.';
            break;
        case 'auth/invalid-phone-number':
            message = 'Ese teléfono no es válido!';
            break;
        case 'auth/invalid-email  ':
            message = 'Ese email no es válido!';
            break;
        case 'auth/cannot-delete-own-user-account':
            message = 'No podés eliminar tu propia cuenta de usuario.';
            break;
        default:
            message = 'Ups! Algo anda mal. Probá en un rato.';
            break;
    }

    return message;
}

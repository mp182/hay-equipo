import { addIcons } from 'ionicons';
import {
  addCircleOutline, arrowDown, arrowDownCircleOutline, arrowUp, calendar, camera, cameraOutline, checkmark,
  checkmarkCircle, checkmarkDoneCircle, close, closeCircle, cloudUpload, create, downloadOutline, enter, flag,
  flagOutline, football, image, informationCircle, informationCircleOutline, logIn, logOut, medal, newspaperOutline,
  open, people, personAdd, pin, play, podium, refresh, removeCircle, rocketOutline, sad, settings, star, starHalf,
  starOutline, stopCircle, trophy, wifi
} from 'ionicons/icons';

/**
 * Con los componentes standalone de Ionic los íconos se registran a mano.
 * Si usás un ícono nuevo en un template (`<ion-icon name="...">`), agregalo acá.
 */
export function registerIcons() {
  addIcons({
    addCircleOutline, arrowDown, arrowDownCircleOutline, arrowUp, calendar, camera, cameraOutline, checkmark,
    checkmarkCircle, checkmarkDoneCircle, close, closeCircle, cloudUpload, create, downloadOutline, enter, flag,
    flagOutline, football, image, informationCircle, informationCircleOutline, logIn, logOut, medal, newspaperOutline,
    open, people, personAdd, pin, play, podium, refresh, removeCircle, rocketOutline, sad, settings, star, starHalf,
    starOutline, stopCircle, trophy, wifi
  });
}

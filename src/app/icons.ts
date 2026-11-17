import { addIcons } from 'ionicons';
import {
  addCircleOutline, arrowDown, arrowUp, calendar, checkmark,
  checkmarkCircle, checkmarkDoneCircle, chevronForward, close, closeCircle, cloudOfflineOutline, create, downloadOutline, enter, flag,
  flagOutline, football, informationCircle, informationCircleOutline, logIn, logOut, medal, newspaperOutline,
  people, personAdd, pin, play, podium, refresh, removeCircle, rocketOutline, sad, settings, shuffle, star, starHalf,
  starOutline, stopCircle, swapVertical, timeOutline, trophy, wifi
} from 'ionicons/icons';

/**
 * Con los componentes standalone de Ionic los íconos se registran a mano.
 * Si usás un ícono nuevo en un template (`<ion-icon name="...">`), agregalo acá.
 */
export function registerIcons() {
  addIcons({
    addCircleOutline, arrowDown, arrowUp, calendar, checkmark,
    checkmarkCircle, checkmarkDoneCircle, chevronForward, close, closeCircle, cloudOfflineOutline, create, downloadOutline, enter, flag,
    flagOutline, football, informationCircle, informationCircleOutline, logIn, logOut, medal, newspaperOutline,
    people, personAdd, pin, play, podium, refresh, removeCircle, rocketOutline, sad, settings, shuffle, star, starHalf,
    starOutline, stopCircle, swapVertical, timeOutline, trophy, wifi
  });
}

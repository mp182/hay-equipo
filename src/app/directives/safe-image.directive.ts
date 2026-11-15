import { Directive, ElementRef, inject, input } from '@angular/core';
import { DEFAULT_AVATAR } from '../services/authentication.service';

/** Si la imagen no carga, muestra el avatar por defecto (o `imgSrc`). */
@Directive({
  selector: '[appSafeImage]',
  host: {
    '(error)': 'loadDefaultOnError()'
  }
})
export class SafeImageDirective {

  readonly imgSrc = input<string>();

  private readonly elemRef = inject<ElementRef<HTMLImageElement>>(ElementRef);

  loadDefaultOnError() {
    const fallback = this.imgSrc() || DEFAULT_AVATAR;
    const element = this.elemRef.nativeElement;
    if (!element.src?.endsWith(fallback)) {
      element.src = fallback;
    }
  }

}

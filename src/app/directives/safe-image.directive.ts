import { Directive, Input, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[appSafeImage]'
})
export class SafeImageDirective {

  @Input() imgSrc: string;

  constructor(private elemRef: ElementRef) { }

  @HostListener('error')
  loadDefaultOnError() {
    const element: HTMLImageElement = this.elemRef.nativeElement as HTMLImageElement;
    element.src = this.imgSrc || '../../../assets/img/playerAvatar.png';
  }

}

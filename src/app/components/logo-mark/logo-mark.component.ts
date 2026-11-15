import { Component, input } from '@angular/core';

/**
 * Isotipo de Hay Equipo!: dos "¡" que son dos jugadores, uno de cada equipo.
 * Con `animated` los jugadores saltan uno detrás del otro (se usa como loader).
 * Los SVG de referencia y los íconos están en /branding.
 */
@Component({
  selector: 'app-logo-mark',
  template: `
    <svg viewBox="0 0 100 100" role="img" [attr.aria-label]="label()" [class.animated]="animated()">
      <g class="player white"><g transform="translate(36 52) rotate(4)">
        <circle cx="0" cy="-30" r="10.5" /><path d="M-6.5 -11 Q0 -14 6.5 -11 L10.5 31 Q0 40 -10.5 31 Z" /></g></g>
      <g class="player black"><g transform="translate(66 50) rotate(-4)">
        <circle cx="0" cy="-30" r="10.5" /><path d="M-6.5 -11 Q0 -14 6.5 -11 L10.5 31 Q0 40 -10.5 31 Z" /></g></g>
    </svg>
  `,
  styles: `
    :host { display: inline-block; width: 64px; height: 64px; }
    svg { width: 100%; height: 100%; display: block; overflow: visible; }
    .white { fill: var(--logo-white, #ffffff); }
    .black { fill: var(--logo-black, #0b0b0b); }
    .animated .player { animation: hop 1.2s ease-in-out infinite; }
    .animated .black { animation-delay: .15s; }
    @keyframes hop {
      0%, 55%, 100% { transform: translateY(0); }
      70% { transform: translateY(-12px); }
    }
    @media (prefers-reduced-motion: reduce) {
      .animated .player { animation: none; }
    }
  `,
})
export class LogoMarkComponent {
  readonly animated = input(false);
  readonly label = input('Hay Equipo!');
}

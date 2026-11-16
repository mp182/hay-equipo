import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.page').then(m => m.LoginPage)
  },
  {
    path: 'no-internet',
    loadComponent: () => import('./pages/no-internet/no-internet.page').then(m => m.NoInternetPage)
  },
  {
    path: '',
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/dashboard/dashboard.page').then(m => m.DashboardPage)
      },
      {
        path: 'match/:id',
        loadComponent: () => import('./pages/match/match.page').then(m => m.MatchPage)
      },
      {
        path: 'change-nickname',
        loadComponent: () => import('./pages/change-nickname/change-nickname.page').then(m => m.ChangeNicknamePage)
      },
      {
        path: 'add-game',
        loadComponent: () => import('./pages/add-game/add-game.page').then(m => m.AddGamePage)
      },
      {
        path: 'add-friend/:id',
        loadComponent: () => import('./pages/add-friend/add-friend.page').then(m => m.AddFriendPage)
      },
      {
        path: 'add-new-friend',
        loadComponent: () => import('./pages/add-new-friend/add-new-friend.page').then(m => m.AddNewFriendPage)
      },
      {
        path: 'add-news',
        loadComponent: () => import('./pages/add-news/add-news.page').then(m => m.AddNewsPage)
      },
      {
        path: 'ranking-tabs',
        loadComponent: () => import('./pages/ranking-tabs/ranking-tabs.page').then(m => m.RankingTabsPage),
        children: [
          {
            path: 'ranking',
            loadComponent: () => import('./pages/ranking/ranking.page').then(m => m.RankingPage)
          },
          {
            path: 'asistencias',
            loadComponent: () => import('./pages/asistencias/asistencias.page').then(m => m.AsistenciasPage)
          },
          {
            path: 'ganados',
            loadComponent: () => import('./pages/ganados/ganados.page').then(m => m.GanadosPage)
          },
        ]
      },
      {
        path: 'new-season',
        loadComponent: () => import('./pages/new-season/new-season.page').then(m => m.NewSeasonPage)
      },
      {
        path: 'change-teams/:id',
        loadComponent: () => import('./pages/change-teams/change-teams.page').then(m => m.ChangeTeamsPage)
      },
      {
        path: 'about',
        loadComponent: () => import('./pages/about/about.page').then(m => m.AboutPage)
      },
    ]
  },
  // Cualquier ruta desconocida (por ej. las viejas /register o /reset-password) va al login.
  { path: '**', redirectTo: 'login' },
];

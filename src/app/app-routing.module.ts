import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AngularFireAuthGuard, redirectUnauthorizedTo } from '@angular/fire/auth-guard';

const redirectUnauthorizedToLogin = () => redirectUnauthorizedTo(['login']);

const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'login',
    loadChildren: () => import('./pages/login/login.module').then(m => m.LoginPageModule)
  },
  {
    path: 'register',
    loadChildren: () => import('./pages/register/register.module').then(m => m.RegisterPageModule)
  },
  {
    path: 'dashboard', canActivate: [AngularFireAuthGuard], data: { authGuardPipe: redirectUnauthorizedToLogin },
    loadChildren: () => import('./pages/dashboard/dashboard.module').then(m => m.DashboardPageModule)
  },
  {
    path: 'match/:id', canActivate: [AngularFireAuthGuard], data: { authGuardPipe: redirectUnauthorizedToLogin },
    loadChildren: () => import('./pages/match/match.module').then(m => m.MatchPageModule)
  },
  {
    path: 'reset-password',
    loadChildren: () => import('./pages/reset-password/reset-password.module').then(m => m.ResetPasswordPageModule)
  },
  {
    path: 'change-nickname', canActivate: [AngularFireAuthGuard], data: { authGuardPipe: redirectUnauthorizedToLogin },
    loadChildren: () => import('./pages/change-nickname/change-nickname.module').then(m => m.ChangeNicknamePageModule)
  },
  {
    path: 'add-game', canActivate: [AngularFireAuthGuard], data: { authGuardPipe: redirectUnauthorizedToLogin },
    loadChildren: () => import('./pages/add-game/add-game.module').then(m => m.AddGamePageModule)
  },
  {
    path: 'edit-image', canActivate: [AngularFireAuthGuard], data: { authGuardPipe: redirectUnauthorizedToLogin },
    loadChildren: () => import('./pages/edit-image/edit-image.module').then(m => m.EditImagePageModule)
  },
  {
    path: 'update',
    loadChildren: () => import('./pages/update/update.module').then(m => m.UpdatePageModule)
  },
  {
    path: 'add-friend/:id', canActivate: [AngularFireAuthGuard], data: { authGuardPipe: redirectUnauthorizedToLogin },
    loadChildren: () => import('./pages/add-friend/add-friend.module').then(m => m.AddFriendPageModule)
  },
  {
    path: 'add-new-friend', canActivate: [AngularFireAuthGuard], data: { authGuardPipe: redirectUnauthorizedToLogin },
    loadChildren: () => import('./pages/add-new-friend/add-new-friend.module').then(m => m.AddNewFriendPageModule)
  },
  {
    path: 'no-internet',
    loadChildren: () => import('./pages/no-internet/no-internet.module').then(m => m.NoInternetPageModule)
  },
  {
    path: 'add-news', canActivate: [AngularFireAuthGuard], data: { authGuardPipe: redirectUnauthorizedToLogin },
    loadChildren: () => import('./pages/add-news/add-news.module').then(m => m.AddNewsPageModule)
  },
  {
    path: 'ranking-tabs', canActivate: [AngularFireAuthGuard], data: { authGuardPipe: redirectUnauthorizedToLogin },
    loadChildren: () => import('./pages/ranking-tabs/ranking-tabs.module').then(m => m.RankingTabsPageModule)
  },
  {
    path: 'new-season', canActivate: [AngularFireAuthGuard], data: { authGuardPipe: redirectUnauthorizedToLogin },
    loadChildren: () => import('./pages/new-season/new-season.module').then(m => m.NewSeasonPageModule)
  },
  {
    path: 'change-teams/:id', canActivate: [AngularFireAuthGuard], data: { authGuardPipe: redirectUnauthorizedToLogin },
    loadChildren: () => import('./pages/change-teams/change-teams.module').then(m => m.ChangeTeamsPageModule)
  },
  {
    path: 'about', canActivate: [AngularFireAuthGuard], data: { authGuardPipe: redirectUnauthorizedToLogin },
    loadChildren: () => import('./pages/about/about.module').then( m => m.AboutPageModule)
  },

];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules, relativeLinkResolution: 'legacy' })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }

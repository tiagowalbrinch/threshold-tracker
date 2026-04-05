import { Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { TaskDetailsLoggedComponent } from './features/task-details/task-details-logged.component';
import { TaskDetailsPublicComponent } from './features/task-details/task-details-public.component';
import { LoginComponent } from './features/login/login.component';
import { RegisterComponent } from './features/register/register.component';
import { ProfileComponent } from './features/profile/profile.component';
import { LeaderboardComponent } from './features/leaderboard/leaderboard.component';
import { authGuard } from './guards/auth.guard';
import { taskDetailGuard } from './guards/task-detail.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'task/:id', component: TaskDetailsLoggedComponent, canActivate: [taskDetailGuard] },
      { path: 'task/:id/leaderboard', component: TaskDetailsPublicComponent },
      { path: 'leaderboard', component: LeaderboardComponent },
      { path: 'profile', component: ProfileComponent, canActivate: [authGuard] },
    ]
  }
];

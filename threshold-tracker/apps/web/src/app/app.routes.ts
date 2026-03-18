import { DashboardComponent } from './features/dashboard/dashboard.component';
import { TaskDetailsComponent } from './features/task-details/task-details.component';
import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'task/:id', component: TaskDetailsComponent }
];

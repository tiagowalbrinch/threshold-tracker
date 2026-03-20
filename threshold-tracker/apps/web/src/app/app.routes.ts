import { Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { TaskDetailsComponent } from './features/task-details/task-details.component';

export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'task/:id', component: TaskDetailsComponent },
    ]
  }
];

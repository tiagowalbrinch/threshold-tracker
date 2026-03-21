import { Component, OnInit, signal, inject } from '@angular/core';
import { Router, NavigationEnd, RouterLink, RouterOutlet } from '@angular/router';
import { NgClass } from '@angular/common';
import { filter } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterLink, RouterOutlet, NgClass],
  templateUrl: './layout.component.html',
})
export class LayoutComponent implements OnInit {
  private router = inject(Router);
  authService = inject(AuthService);

  mobileMenuOpen = signal(false);
  currentRoute = signal('');
  showUserMenu = signal(false);

  ngOnInit() {
    this.currentRoute.set(this.router.url);
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd)
    ).subscribe((e: any) => {
      this.currentRoute.set(e.url);
      this.showUserMenu.set(false);
    });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}

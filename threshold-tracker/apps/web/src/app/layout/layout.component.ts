import { Component, OnInit, signal, inject } from '@angular/core';
import { Router, NavigationEnd, RouterLink, RouterOutlet } from '@angular/router';
import { NgClass } from '@angular/common';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterLink, RouterOutlet, NgClass],
  templateUrl: './layout.component.html',
})
export class LayoutComponent implements OnInit {
  private router = inject(Router);

  mobileMenuOpen = signal(false);
  currentRoute = signal('');

  ngOnInit() {
    this.currentRoute.set(this.router.url);
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd)
    ).subscribe((e: any) => {
      this.currentRoute.set(e.url);
    });
  }
}

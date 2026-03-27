import { Component, OnDestroy, OnInit, PLATFORM_ID, effect, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { AuthService } from './services/auth.service';
import { SyncPollingService } from './services/sync-polling.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
})
export class App implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private pollingService = inject(SyncPollingService);
  private platformId = inject(PLATFORM_ID);

  constructor() {
    effect(() => {
      if (this.authService.isLoggedIn()) {
        this.pollingService.start();
      } else {
        this.pollingService.stop();
      }
    });
  }

  ngOnInit() {
    if (!isPlatformBrowser(this.platformId)) return;
    if (this.authService.isLoggedIn()) {
      this.authService.loadProfile().subscribe(() => this.pollingService.start());
    }
  }

  ngOnDestroy() {
    this.pollingService.stop();
  }
}

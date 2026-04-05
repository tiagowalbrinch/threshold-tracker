import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Subscription, EMPTY, interval } from 'rxjs';
import { catchError, filter, switchMap } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { SyncService } from './sync.service';

@Injectable({ providedIn: 'root' })
export class SyncPollingService {
  private authService = inject(AuthService);
  private syncService = inject(SyncService);
  private platformId = inject(PLATFORM_ID);

  private subscription: Subscription | null = null;

  start(): void {
    if (!isPlatformBrowser(this.platformId) || this.subscription) return;
    this.subscription = interval(600_000).pipe(
      filter(() => this.authService.isLoggedIn() && this.authService.hasAimlabsUsername()),
      switchMap(() => this.syncService.sync().pipe(catchError(() => EMPTY)))
    ).subscribe();
  }

  stop(): void {
    this.subscription?.unsubscribe();
    this.subscription = null;
  }
}

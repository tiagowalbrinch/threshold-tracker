import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { routes } from './app.routes';
import { mockProviders } from './mocks/mock.providers';
// import { realProviders } from './services/real.providers'; // ← swap when backend is ready

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideClientHydration(withEventReplay()),
    provideHttpClient(withFetch()),
    provideCharts(withDefaultRegisterables()),
    ...mockProviders,
    // ...realProviders, // ← uncomment and remove mockProviders line when backend is ready
  ]
};

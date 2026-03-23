import { ApplicationConfig, provideBrowserGlobalErrorListeners, APP_INITIALIZER } from '@angular/core';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { GlobalStore } from './core/store/store';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';


export function initAppFactory(store: GlobalStore) {
  return () => store.initApp();
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideClientHydration(withEventReplay()),

    {
      provide: APP_INITIALIZER,
      useFactory: initAppFactory,
      deps: [GlobalStore],
      multi: true
    }
  ]
};
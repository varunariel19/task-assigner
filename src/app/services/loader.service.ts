import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LoaderService {
  private _loading = signal<boolean>(false);

  readonly isLoading = this._loading.asReadonly();

  show(): void {
    document.body.style.overflowY = 'hidden';
    this._loading.set(true);
  }

  hide(): void {
    document.body.style.overflowY = 'auto';
    this._loading.set(false);
  }

  toggle(): void {
    this._loading.update((v) => !v);
  }
}

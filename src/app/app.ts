import { Component, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { LoaderComponent } from './pages/loader/loader.component';

@Component({
  selector: 'app-root',
  imports: [RouterModule, LoaderComponent],
  standalone: true,
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('demo-app');
}

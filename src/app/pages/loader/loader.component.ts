import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoaderService } from '../../services/loader.service';

@Component({
  selector: 'app-loader',
  standalone: true,
  imports: [CommonModule],
  templateUrl: '../loader/loader.component.html',
  styleUrl: '../loader/loader.component.css',
})
export class LoaderComponent {
  protected loaderService = inject(LoaderService);
}

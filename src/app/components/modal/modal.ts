import { CreateTicketFormComponent } from "../create-ticket/create-ticket";
import { Component, EventEmitter, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-modal',
    standalone: true,
    imports: [CommonModule, CreateTicketFormComponent],
    templateUrl: './modal.html'
})
export class ModalComponent {
    isOpen = signal(false);

    @Output() closed = new EventEmitter<void>();

    open() { this.isOpen.set(true); }
    close() {
        this.isOpen.set(false);
        this.closed.emit();
    }
}

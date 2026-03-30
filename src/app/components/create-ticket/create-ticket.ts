import { Component, EventEmitter, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Api } from '../../core/services/api';
import { GlobalStore } from '../../core/store/store';
import { ModalComponent } from '../modal/modal';
import { FormData, FormType, Ticket } from '../../interface';
import { v4 as uuidV4 } from 'uuid';
import { LoaderService } from '../../services/loader.service';

@Component({
  selector: 'app-create-ticket-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create-ticket.html',
})
export class CreateTicketFormComponent {
  @Output() submitForm = new EventEmitter<any>();
  ticketCreating = signal(false);

  private api = inject(Api);
  private loaderService = inject(LoaderService);
  store = inject(GlobalStore);
  modal = inject(ModalComponent);

  options = ['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE'];
  priority = [
    { value: 1, label: 'High' },
    { value: 2, label: 'Medium' },
    { value: 3, label: 'Low' },
  ];

  private defaultFormData(): FormData {
    return {
      taskId: '',
      ticketId: null,
      title: '',
      description: '',
      priority: 3,
      type: 'BUG',
      status: 'TODO',
      assignToId: '',
      reportedById: '',
    };
  }

  formData: FormData = this.defaultFormData();

  updateField<K extends FormType>(field: K, value: FormData[K]) {
    this.formData[field] = value;
  }

  submit() {
    const { title, status, assignToId, priority, description, type } = this.formData;
    const reporter = this.store.user();

    if (!title || !reporter || !status) {
      alert('Please fill in all required fields.');
      return;
    }

    const assignedUser = this.store.users().find((u) => u.id == assignToId);
    if (!assignedUser) {
      alert('User not exists!');
      return;
    }

    this.modal.close();
    this.loaderService.show();
    const taskId = uuidV4();
    const ticketId = Math.floor(Math.random() * (9999 - 100 + 1)) + 100;
    const now = new Date().toString();

    this.formData.reportedById = reporter.id;
    this.formData.taskId = taskId;
    this.formData.ticketId = ticketId;

    const data: Ticket = {
      taskId,
      ticketId: ticketId.toString(),
      title,
      status,
      assignedUser,
      type,
      description,
      priority: priority.toString(),
      allowedMembers: [],
      aiSummary: [],
      createdAt: now,
      updatedAt: now,
      reportedUser: {
        id: reporter.id,
        username: reporter.username,
        avatar: reporter.avatar,
      },
    };

    this.store.tickets.update((prev) => [...prev, data]);
    this.store.aisles.update((prev) => ({
      ...prev,
      [status]: [...prev[status], data],
    }));

    this.api.addTask(this.formData).subscribe({
      next: () => {
        this.formData = this.defaultFormData();
        this.loaderService.hide();
      },
      error: (err) => {
        console.error('Error creating ticket', err);
        alert('Failed to create ticket. Please try again.');

        this.store.tickets.update((prev) => prev.filter((t) => t.taskId !== taskId));
        this.store.aisles.update((prev) => ({
          ...prev,
          [status]: prev[status].filter((t) => t.taskId !== taskId),
        }));

        this.loaderService.hide();
      },
    });
  }
}

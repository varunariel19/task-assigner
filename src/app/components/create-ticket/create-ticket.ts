import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Api } from '../../core/services/api';
import { GlobalStore } from '../../core/store/store';
import { ModalComponent } from '../modal/modal';
import { FormData, FormType, Ticket } from '../../interface';
import {  v4 as uuidV4 } from "uuid";

@Component({
  selector: 'app-create-ticket-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create-ticket.html',
})
export class CreateTicketFormComponent {
  @Output() submitForm = new EventEmitter<any>();

  constructor(
    private api: Api,
    public store: GlobalStore,
    public modal: ModalComponent,
  ) {}

  options = ['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE'];
  priority = [
    { value: 1, label: 'High' },
    { value: 2, label: 'Medium' },
    { value: 3, label: 'Low' },
  ];

  formData: FormData = {
    title: '',
    description: '',
    priority: 3,
    type: 'BUG',
    status: 'TODO',
    assignToId: '',
  };

  updateField<K extends FormType>(field: K, value: FormData[K]) {
    this.formData[field] = value;
  }
  submit() {
    this.modal.close();

    const { title, status, assignToId, priority, description, type } = this.formData;
    const reporter = this.store.user();

    if (!title || !reporter || !status) {
      alert('Please fill in all required fields.');
      return;
    }

    const assignedUser = this.store.users().find((user) => user.id == assignToId);
    if (!assignedUser) {
      alert('User not exists !');
      return;
    }
    const data: Ticket = {
      taskId: uuidV4(),
      ticketId: String(Math.floor(Math.random() * (9999 - 100 + 1)) + 100),
      title,
      status,
      assignedUser: assignedUser,
      type,
      description,
      priority: this.store.PRIORITY_MAP[priority],
      allowedMembers: [],
      aiSummary: [],
      createdAt: new Date(Date.now()).toString(),
      updatedAt: new Date(Date.now()).toString(),
      reportedUser: {
        id: reporter!.id,
        username: reporter.username,
        avatar: reporter.avatar,
      },
    };

    console.log('data', data);

    this.store.aisles.update((prev) => {
      prev[status].push(data);
      return prev;
    });

    this.api.addTask(this.formData).subscribe({
      next: (res: any) => {
        this.formData = {
          title: '',
          type: 'BUG',
          priority: 3,
          description: '',
          status: 'TODO',
          assignToId: '',
        };
      },
      error: (err) => {
        console.error('Error creating ticket', err);
        alert('Failed to create ticket. Please try again.');
      },
    });
  }
}

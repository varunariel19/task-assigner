import { ViewTicketComponent } from '../../components/view-ticket/view-ticket.component';
import { Component, signal, ViewChild, AfterViewInit } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ModalComponent } from '../../components/modal/modal';
import { GlobalStore } from '../../core/store/store';
import { AppIcons } from '../../constants/icons';
import { CommonModule } from '@angular/common';
import { Api } from '../../core/services/api';
import { DragDropModule, CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { TicketStatus } from '../../interface';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, FontAwesomeModule, ModalComponent, ViewTicketComponent, DragDropModule],
  standalone: true,
  templateUrl: './dashboard.html',
})
export class DashboardComponent implements AfterViewInit {
  appIcons = AppIcons;

  @ViewChild(ModalComponent, { static: false }) modal?: ModalComponent;
  @ViewChild(ViewTicketComponent, { static: false }) viewTicketModal?: ViewTicketComponent;
  appName = signal('T-Asssigner');

  constructor(
    private api: Api,
    public store: GlobalStore,
  ) {}

  ngAfterViewInit(): void {
    console.log('Modal initialized:', this.modal);
  }

  openModal() {
    if (!this.modal) {
      console.error('Modal not ready yet');
      return;
    }

    this.modal.open();
  }

  viewTicket(ticketId: string) {
    const ticket = this.store.tickets().find((ticket, index) => ticket.taskId == ticketId);
    if (!ticket) return;

    this.viewTicketModal?.toggleModal(ticket);
  }

  createTicket(data: any) {
    this.modal?.close();
  }

  isLoggedIn(): boolean {
    return this.store.loggedIn();
  }

  isAdmin(): boolean {
    return this.store.userRole() === 'ADMIN';
  }

  drop(event: CdkDragDrop<any[]>, newStatus: TicketStatus) {
    const current = this.store.aisles();

    const prevKey = event.previousContainer.id as TicketStatus;
    const currKey = event.container.id as TicketStatus;

    const prevList = [...current[prevKey]];
    const currList = prevKey === currKey ? prevList : [...current[currKey]];

    if (event.previousContainer === event.container) {
      moveItemInArray(currList, event.previousIndex, event.currentIndex);

      this.store.aisles.set({
        ...current,
        [currKey]: currList,
      });
    } else {
      const [movedTicket] = prevList.splice(event.previousIndex, 1);
      movedTicket.status = newStatus;
      currList.splice(event.currentIndex, 0, movedTicket);

      this.store.aisles.set({
        ...current,
        [prevKey]: prevList,
        [currKey]: currList,
      });

      this.handleUpdateTicket(movedTicket.taskId, { status: movedTicket.status });
    }
  }

  handleUpdateTicket(ticketId: string, updates: any) {
    this.api.updateTicket(ticketId, updates).subscribe({
      next: () => {
        console.log('updated');
      },
      error: () => {
        console.log('failed to update !!');
      },
    });
  }

  trackByTicket(index: number, ticket: any) {
    return ticket.id;
  }

  filteredTicket(event: Event) {
    const userId = (event.target as HTMLSelectElement).value;
    console.log('Filtering by user:', userId);
    if (userId === 'ALL') {
      this.store.filterByUser.set(null);
      return;
    }

    this.store.filterByUser.set(userId);
  }
}

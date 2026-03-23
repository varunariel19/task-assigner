import { Priority, Ticket, TicketStatus, User } from '../../interface';
import { AuthService } from '../../services/auth.service';
import { NavigationEnd, Router } from '@angular/router';
import { Injectable, signal } from '@angular/core';
import { firstValueFrom, filter } from 'rxjs';
import { Api } from '../services/api';

@Injectable({ providedIn: 'root' })
export class GlobalStore {
  user = signal<User | null>(null);
  users = signal<any[]>([]);
  tickets = signal<Ticket[]>([]);
  loading = signal(false);
  loggedIn = signal<boolean>(false);
  userRole = signal<string>('USER');

  aisles = signal<Record<TicketStatus, Ticket[]>>({
    TODO: [],
    IN_PROGRESS: [],
    REVIEW: [],
    DONE: [],
  });

  columns = [
    { key: 'TODO' as const, label: 'Todo' },
    { key: 'IN_PROGRESS' as const, label: 'In Progress' },
    { key: 'REVIEW' as const, label: 'Review' },
    { key: 'DONE' as const, label: 'Done' },
  ];

  connectedLists = this.columns.map((c) => c.key);

  PRIORITY_MAP: Record<string, Priority> = {
    1: 'High',
    2: 'Medium',
    3: 'Low',
  };
  publicRoutes = ['/', '/login', '/register'];

  constructor(
    private api: Api,
    private router: Router,
    private authService: AuthService,
  ) {
    this.waitForRouterThenInit();
  }

  async waitForRouterThenInit() {
    await firstValueFrom(
      this.router.events.pipe(filter((event) => event instanceof NavigationEnd)),
    );

    this.initApp();
  }

  async initApp() {
    this.checkLoggedIn();
    await this.fetchInitialData();
  }

  async fetchInitialData() {
    try {
      this.loading.set(true);

      const usersRes: any = await firstValueFrom(this.api.getAllUsers());
      const ticketsRes: any = await firstValueFrom(this.api.getAllTickets());

      const tickets: Ticket[] = ticketsRes.tickets;

      this.users.set(usersRes.users);
      this.tickets.set(tickets);
      this.aisles.set(this.groupTicketsByStatus(tickets));
    } catch (error: any) {
      console.error('Init error:', error.message);
    } finally {
      this.loading.set(false);
    }
  }

  checkLoggedIn() {
    const parsedToken = this.authService.getParsedToken();
    const visitedUrl = this.router.url;
    console.log('parsed token ', parsedToken, visitedUrl);

    if (!parsedToken && !this.publicRoutes.includes(visitedUrl)) {
      this.router.navigate(['/']);
      return;
    }

    this.api.validateToken(parsedToken).subscribe({
      next: (res: any) => {
        const validation = res.validation;
        if (validation.ok) {
          const user = validation.user;
          this.loggedIn.set(true);
          this.user.set(user);
          this.userRole.set(user.role);
          this.router.navigate(['/dashboard']);
        }
      },
      error: (err: any) => {
        console.log('Validation error', err.message);
        this.loggedIn.set(false);
        this.user.set(null);
        if (!this.publicRoutes.includes(visitedUrl)) {
          this.router.navigate(['/']);
        }
      },
    });
  }

  handleLogout() {
    this.user.set(null);
    this.loggedIn.set(false);
    this.authService.clearToken();
    this.router.navigate(['/']);
    return;
  }

  checkAdmin() {
    return this.userRole() == 'ADMIN';
  }

  private groupTicketsByStatus(tickets: Ticket[]): Record<TicketStatus, Ticket[]> {
    const grouped: Record<TicketStatus, Ticket[]> = {
      TODO: [],
      IN_PROGRESS: [],
      REVIEW: [],
      DONE: [],
    };

    for (const ticket of tickets) {
      grouped[ticket.status].push(ticket);
    }

    return grouped;
  }

  getPriorityClasses(priority: string) {
    const map: any = {
      1: 'bg-red-100 text-red-600',
      2: 'bg-yellow-100 text-yellow-700',
      3: 'bg-green-100 text-green-700',
    };
    return map[priority] ?? 'bg-gray-100 text-gray-600';
  }
}

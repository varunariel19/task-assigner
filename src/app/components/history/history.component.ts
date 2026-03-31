import { AfterViewInit, Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export type ChangeType =
  | 'status'
  | 'priority'
  | 'type'
  | 'assignee'
  | 'description'
  | 'title'
  | 'ai_summary'
  | 'comment'
  | 'bulk';

export interface FieldChange {
  field: string;
  from: string;
  to: string;
}

export interface ActivityLog {
  id: string;
  ticketNo: string;
  changeType: ChangeType;
  action: string;
  user: {
    name: string;
    avatar: string;
    initials: string;
    color: string;
    isAdmin: boolean;
  };
  timestamp: Date;
  changes: FieldChange[];
  comment?: string;
  isReverted?: boolean;
  showDiff?: boolean;
}

@Component({
  selector: 'history',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './history.component.html',
  styleUrl: './history.component.css',
})
export class HistoryComponent implements AfterViewInit, OnInit {
  @Input() isOpen: boolean = false;
  @Input() ticketNo: string = '1234';
  @Input() isAdmin: boolean = true;

  filterType: string = 'all';
  searchQuery: string = '';
  expandedDiffs: Set<string> = new Set();
  revertedLogs: Set<string> = new Set();

  logs: ActivityLog[] = [
    {
      id: '1',
      ticketNo: '1234',
      changeType: 'bulk',
      action: 'Title & Description updated',
      user: { name: 'Harry', avatar: '', initials: 'HA', color: '#6366f1', isAdmin: true },
      timestamp: new Date(Date.now() - 2 * 60 * 1000),
      changes: [
        { field: 'Title', from: 'Fix login bug', to: 'Fix OAuth login redirect bug on Safari' },
        {
          field: 'Description',
          from: 'Login fails sometimes.',
          to: 'OAuth login redirect fails on Safari 16+ due to SameSite cookie policy changes. Affects all SSO flows.',
        },
      ],
    },
    {
      id: '2',
      ticketNo: '1234',
      changeType: 'status',
      action: 'Status changed from TODO → IN_PROGRESS',
      user: { name: 'Varun', avatar: '', initials: 'VA', color: '#f59e0b', isAdmin: false },
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      changes: [{ field: 'Status', from: 'TODO', to: 'IN_PROGRESS' }],
    },
    {
      id: '3',
      ticketNo: '1234',
      changeType: 'ai_summary',
      action: 'AI Summary updated',
      user: { name: 'AI Bot', avatar: '', initials: 'AI', color: '#8b5cf6', isAdmin: false },
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      changes: [
        {
          field: 'AI Summary',
          from: 'A bug affecting login functionality.',
          to: 'Critical authentication issue impacting Safari users on SSO flows. Root cause: SameSite=None cookie policy enforcement in Safari 16+. Estimated fix: Update cookie attributes and test cross-browser SSO flows.',
        },
      ],
    },
    {
      id: '4',
      ticketNo: '1234',
      changeType: 'priority',
      action: 'Priority changed from Low → High',
      user: { name: 'Sarah', avatar: '', initials: 'SA', color: '#ef4444', isAdmin: true },
      timestamp: new Date(Date.now() - 45 * 60 * 1000),
      changes: [{ field: 'Priority', from: 'Low', to: 'High' }],
    },
    {
      id: '5',
      ticketNo: '1234',
      changeType: 'comment',
      action: 'Added a comment',
      user: { name: 'Varun', avatar: '', initials: 'VA', color: '#f59e0b', isAdmin: false },
      timestamp: new Date(Date.now() - 60 * 60 * 1000),
      changes: [],
      comment:
        'Reproduced on Safari 16.4. The issue is definitely SameSite cookie related. Need to coordinate with backend team for the fix.',
    },
    {
      id: '6',
      ticketNo: '1234',
      changeType: 'assignee',
      action: 'Assignee changed from Varun → Harry',
      user: { name: 'Sarah', avatar: '', initials: 'SA', color: '#ef4444', isAdmin: true },
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      changes: [{ field: 'Assignee', from: 'Varun', to: 'Harry' }],
    },
    {
      id: '7',
      ticketNo: '1234',
      changeType: 'type',
      action: 'Type changed from Bug → Feature',
      user: { name: 'Harry', avatar: '', initials: 'HA', color: '#6366f1', isAdmin: true },
      timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
      changes: [{ field: 'Type', from: 'Bug', to: 'Feature' }],
    },
    {
      id: '8',
      ticketNo: '1234',
      changeType: 'comment',
      action: 'Added a comment',
      user: { name: 'Harry', avatar: '', initials: 'HA', color: '#6366f1', isAdmin: true },
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
      changes: [],
      comment: 'Escalating this. Multiple enterprise clients affected.',
    },
  ];

  get filteredLogs(): ActivityLog[] {
    return this.logs.filter((log) => {
      const matchesFilter = this.filterType === 'all' || log.changeType === this.filterType;
      const matchesSearch =
        !this.searchQuery ||
        log.action.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        log.user.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        log.comment?.toLowerCase().includes(this.searchQuery.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }

  ngOnInit(): void {}

  ngAfterViewInit(): void {}

  toggleDiff(logId: string): void {
    if (this.expandedDiffs.has(logId)) {
      this.expandedDiffs.delete(logId);
    } else {
      this.expandedDiffs.add(logId);
    }
  }

  isDiffExpanded(logId: string): boolean {
    return this.expandedDiffs.has(logId);
  }

  revertChange(log: ActivityLog): void {
    if (!this.isAdmin) return;
    this.revertedLogs.add(log.id);
    // Emit revert event to parent here via @Output if needed
    console.log('Reverting change:', log);
  }

  isReverted(logId: string): boolean {
    return this.revertedLogs.has(logId);
  }

  getChangeTypeIcon(type: ChangeType): string {
    const icons: Record<ChangeType, string> = {
      status: '⟳',
      priority: '↑',
      type: '◈',
      assignee: '👤',
      description: '✎',
      title: '✎',
      ai_summary: '✦',
      comment: '💬',
      bulk: '⊞',
    };
    return icons[type] || '•';
  }

  getChangeTypeBadgeClass(type: ChangeType): string {
    const classes: Record<ChangeType, string> = {
      status: 'badge-status',
      priority: 'badge-priority',
      type: 'badge-type',
      assignee: 'badge-assignee',
      description: 'badge-description',
      title: 'badge-title',
      ai_summary: 'badge-ai',
      comment: 'badge-comment',
      bulk: 'badge-bulk',
    };
    return classes[type] || '';
  }

  formatTime(date: Date): string {
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return date.toLocaleDateString();
  }

  hasTextDiff(log: ActivityLog): boolean {
    return (
      ['description', 'title', 'ai_summary', 'bulk'].includes(log.changeType) &&
      log.changes.some((c) => c.from.length > 40 || c.to.length > 40)
    );
  }

  close(): void {
    this.isOpen = false;
  }
}

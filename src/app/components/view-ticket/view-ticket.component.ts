import {
  Component,
  Output,
  signal,
  EventEmitter,
  effect,
  ViewChild,
  AfterViewInit,
} from '@angular/core';
import { GlobalStore } from '../../core/store/store';
import { CommonModule } from '@angular/common';
import { Api } from '../../core/services/api';
import { Comment, Priority, Ticket } from '../../interface';
import { v4 as uuidv4 } from 'uuid';
import { formatTime12h } from '../../utils';
import { GoogleAiService } from '../../core/services/ai-modal';
import { TicketEditorComponent } from '../editor/ticket-editor.component';
@Component({
  selector: 'view-ticket-modal',
  standalone: true,
  imports: [CommonModule, TicketEditorComponent],
  templateUrl: './view-ticket.component.html',
  styleUrl: './view-ticket.style.css',
})
export class ViewTicketComponent implements AfterViewInit {
  @ViewChild(TicketEditorComponent, { static: false }) modal!: TicketEditorComponent;
  isOpen = signal<boolean>(false);
  isEditing = signal(false);
  ticketInfo = signal<Ticket | null>(null);

  dateFormatter = formatTime12h;

  comment = signal<string>('');
  comments = signal<Comment[] | null>(null);

  editingCommentId = signal<string | null>(null);

  allChatList = signal<string[]>([]);
  editingText = signal<string>('');

  isGeneratingSummary = signal(false);

  isMessageGenerating = signal(false);

  isTitleGen = signal(false);

  isDescGen = signal(false);

  summaryPoints = signal<string[]>([]);

  @Output() closed = new EventEmitter<void>();

  private previousTicketId: string | null = null;

  ticketStatusTypes = ['TODO', 'IN_PROGRESS', 'DONE'];
  priorityOptions: { key: string; value: Priority }[] = [];
  typeOptions = ['BUG', 'FEATURE', 'TASK'];

  constructor(
    private ai: GoogleAiService,
    private api: Api,
    public store: GlobalStore,
  ) {
    this.priorityOptions = Object.entries(this.store.PRIORITY_MAP).map(([key, value]) => ({
      key: String(key),
      value: value,
    }));

    effect(() => {
      const ticket = this.ticketInfo();

      if (!ticket?.taskId) return;

      if (this.previousTicketId !== ticket.taskId) {
        this.previousTicketId = ticket.taskId;
        this.resetFields();
        this.fetchComments(ticket.taskId);
      }
    });
  }
  ngAfterViewInit(): void {}

  handleUpdateTicket() {
    let updatedTicket = this.ticketInfo();
    if (this.modal!.htmlContent) {
      updatedTicket!.description = this.modal!.htmlContent;
    }

    const now = String(new Date(Date.now()));
    updatedTicket!.updatedAt = now;
    this.ticketInfo.set(updatedTicket);

    if (!updatedTicket) return;

    this.store.tickets.update((prev) =>
      prev.map((ticket) => (ticket.taskId === updatedTicket.taskId ? updatedTicket : ticket)),
    );

    this.store.aisles.update((prev) => {
      const updatedArray = prev[updatedTicket.status].map((each) =>
        each.taskId === updatedTicket.taskId ? updatedTicket : each,
      );
      return { ...prev, [updatedTicket.status]: [...updatedArray] };
    });

    this.isEditing.set(false);
    const updates = { title: updatedTicket.title, description: updatedTicket.description };
    this.api.updateTicket(updatedTicket.taskId, updates).subscribe({
      next: (res: any) => {
        console.log(res.message);
      },
      error: (err) => {
        console.log(err);
      },
    });
  }

  handleOnChange(key: string, event: Event) {
    let input = null;
    let value = null;
    switch (key) {
      case 'title': {
        input = event.target as HTMLInputElement;
        value = input.value;
        break;
      }

      case 'description': {
        input = event.target as HTMLTextAreaElement;
        value = input.value;
        break;
      }
    }

    if (!input || !value) return;

    this.ticketInfo.update((prev) => {
      if (!prev) return prev;
      return { ...prev, [key]: value };
    });
  }

  toggleModal(ticket: Ticket | null) {
    this.isOpen.update((prev) => !prev);
    this.ticketInfo.set(ticket);
    if (!ticket) return;
    this.summaryPoints.set([...(ticket.aiSummary ?? [])]);
  }

  startEditing() {
    this.isEditing.set(true);
  }
  //  COMMENT

  commentOnChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const value = input.value;
    this.comment.set(value);
  }

  addComment() {
    const user = this.store.user();
    const ticket = this.ticketInfo();
    const content = this.comment();

    if (!user || !ticket?.taskId || !content.trim()) return;

    const now = new Date(Date.now());
    const comment: Comment = {
      id: uuidv4(),
      content,
      edited: false,
      ticketId: ticket.taskId,
      user: {
        id: user.id,
        avatar: user.avatar,
        username: user.username,
      },
      createdAt: String(now),
      updatedAt: String(now),
    };

    this.comment.set('');

    this.comments.update((prev) => {
      if (!prev) return [comment];
      return [...prev, comment];
    });

    this.api
      .handleAddComment({
        id: comment.id,
        taskId: ticket.taskId,
        comment: comment.content,
        commentedBy: user.id,
      })
      .subscribe({
        next: (res: any) => {
          console.log('comment ', res.message);
        },
        error: (err: any) => {
          console.log('Err ', err);
        },
      });
  }

  fetchComments(ticketId: string) {
    this.api.handleGetAllComments(ticketId).subscribe({
      next: (res: any) => {
        this.comments.set(res.comments);
      },
      error: (err: any) => {
        console.log(err);
      },
    });
  }

  handleEditingComment(event: Event) {
    const input = event.target as HTMLTextAreaElement;
    const value = input.value;
    this.editingText.set(value);
  }

  startEdit(comment: Comment) {
    this.editingCommentId.set(comment.id);
    this.editingText.set(comment.content);
  }

  cancelEdit() {
    this.editingCommentId.set(null);
    this.editingText.set('');
  }

  saveEdit(commentId: string) {
    const updatedContent = this.editingText().trim();
    if (!updatedContent) return;

    this.comments.update((prev) => {
      if (!prev) return prev;

      return prev.map((comment) =>
        comment.id === commentId
          ? {
              ...comment,
              content: updatedContent,
              edited: true,
              updatedAt: String(new Date(Date.now())),
            }
          : comment,
      );
    });

    this.cancelEdit();

    // TODO : api call to update the comment !!
    this.api.handleUpdateComment({ editedComment: updatedContent, commentId }).subscribe({
      next: (res: any) => {
        console.log('comment changed !!');
      },
      error: (err: any) => {
        console.error('err', err);
      },
    });
  }

  checkComments() {
    return this.comments.length > 0;
  }

  async generateSummary() {
    try {
      if (this.summaryPoints.length > 0) return;
      this.isGeneratingSummary.set(true);

      if (!this.comments()) return;

      const payload = `
                    Description : ${this.ticketInfo()?.description}
                    Title : ${this.ticketInfo()?.title}
                    
                    All initated chat : 
                    ${this.comments()}
                    
        `;
      const response = await this.ai.AiGeneratedResponse('CHAT_SUMMARY', payload);
      const parsedReponse = this.parseSummaryToPoints(response);
      this.isGeneratingSummary.set(false);
      await this.typePointsEffect(parsedReponse, 10);
      let updatedTicket = this.ticketInfo();
      updatedTicket!.aiSummary = parsedReponse;
      this.ticketInfo.set(updatedTicket);
      this.store.tickets.update((prev) => {
        return prev.map((ticket) =>
          ticket.taskId == updatedTicket?.taskId ? updatedTicket : ticket,
        );
      });

      this.api.updateTicket(this.ticketInfo()!.taskId, { aiSummary: parsedReponse }).subscribe({
        next: (res: any) => {
          console.log('chat summary updated !!');
        },
      });
    } catch (error) {
      console.log('failed to generate : ', error);
    } finally {
      this.isGeneratingSummary.set(false);
    }
  }

  async generateChatSuggestion(value: string) {
    try {
      if (!this.comments()) return;

      this.isMessageGenerating.set(true);

      const payload = `
                    Description : ${this.ticketInfo()?.description}
                    Title : ${this.ticketInfo()?.title}
                    
                    All initated chat : 
                    ${this.comments()}

                    Suggest Message using this -> ${value}
                    
        `;

      const response = await this.ai.AiGeneratedResponse('CHAT_SUGGESTION', payload);
      await this.typeWriterEffect('COMMENT', response, 10);
    } catch (error) {
      console.log('error', error);
    } finally {
      this.isMessageGenerating.set(false);
    }
  }

  async generateTitle() {
    const title = this.ticketInfo()?.title.trim();
    if (!title) {
      alert('title is empty !!');
      return;
    }

    try {
      this.isTitleGen.set(true);
      const response = await this.ai.AiGeneratedResponse('TICKET_TITLE', title);
      await this.typeWriterEffect('TITLE', response, 10);
      this.ticketInfo.update((prev) => (prev ? { ...prev, title: response } : prev));
    } catch {
      console.log('failed to generate title !');
    } finally {
      this.isTitleGen.set(false);
    }
  }

  async generateDesc() {
    const title = this.ticketInfo()?.title.trim();
    if (!title) {
      alert('title is empty !!');
      return;
    }

    const payload = `
     
     TITLE : ${title},
     DESCRIPTION : ${this.ticketInfo()?.description ?? 'No description available suggest new one !'}

     `;

    try {
      this.isDescGen.set(true);
      const response = await this.ai.AiGeneratedResponse('TICKET_DESCRIPTION', payload);
      await this.typeWriterEffect('DESC', response, 10);
      this.ticketInfo.update((prev) => (prev ? { ...prev, description: response } : prev));
    } catch {
      console.log('failed to generate title !');
    } finally {
      this.isDescGen.set(false);
    }
  }

  private parseSummaryToPoints(text: string): string[] {
    if (!text) return [];

    return text
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length)
      .map((line) =>
        line
          .replace(/^[-•*]\s*/, '')
          .replace(/^\d+\.\s*/, '')
          .trim(),
      );
  }

  private typeWriterEffect(
    whereToType: 'COMMENT' | 'TITLE' | 'DESC',
    text: string,
    speed = 12,
  ): Promise<void> {
    return new Promise((resolve) => {
      if (!text.length) {
        resolve();
        return;
      }

      let i = 0;

      const interval = setInterval(() => {
        i++;

        switch (whereToType) {
          case 'COMMENT':
            this.comment.set(text.slice(0, i));
            break;

          case 'DESC':
            this.ticketInfo.update((prev) => {
              if (!prev) return prev;
              return { ...prev, description: text.slice(0, i) };
            });
            break;

          case 'TITLE':
            this.ticketInfo.update((prev) => {
              if (!prev) return prev;
              return { ...prev, title: text.slice(0, i) };
            });
            break;

          default:
            clearInterval(interval);
            resolve();
            return;
        }

        if (i >= text.length) {
          clearInterval(interval);
          resolve();
        }
      }, speed);
    });
  }

  private async typePointsEffect(points: string[], speed = 12): Promise<void> {
    this.summaryPoints.set([]);

    for (const point of points) {
      this.summaryPoints.update((prev) => [...prev, '']);

      await this.typeSingleLine(point, speed);

      await new Promise((res) => setTimeout(res, 250));
    }
  }

  private typeSingleLine(text: string, speed = 12): Promise<void> {
    return new Promise((resolve) => {
      let index = 0;

      const interval = setInterval(() => {
        const current = this.summaryPoints();

        const updated = [...current];
        const lastLineIndex = updated.length - 1;

        updated[lastLineIndex] = (updated[lastLineIndex] || '') + text.charAt(index);

        this.summaryPoints.set(updated);

        index++;

        if (index >= text.length) {
          clearInterval(interval);
          resolve();
        }
      }, speed);
    });
  }

  private resetFields() {
    this.isGeneratingSummary.set(false);
    this.isMessageGenerating.set(false);
    this.comments.set([]);
    this.comment.set('');
  }

  CanEditTicket() {
    const userId = this.store.user()?.id;
    return this.store.checkAdmin() || this.ticketInfo()?.allowedMembers.includes(userId ?? '');
  }

  onStatusChange(event: Event) {
    const val = (event.target as HTMLSelectElement).value as 'TODO' | 'IN_PROGRESS' | 'DONE';
    this.ticketInfo.update((prev: Ticket | null) => {
      if (!prev) return null;
      return { ...prev, status: val };
    });
  }

  onAssignedUserChange(event: Event) {
    const userId = (event.target as HTMLSelectElement).value;
    const selectedUser = this.store.users().find((u) => u.id === userId);
    this.ticketInfo.set({ ...this.ticketInfo()!, assignedUser: selectedUser });
  }

  onPriorityChange(event: Event) {
    const value = (event.target as HTMLSelectElement).value;
    this.ticketInfo.set({ ...this.ticketInfo()!, priority: value });
  }

  onTypeChange(event: Event) {
    const value = (event.target as HTMLSelectElement).value;
    this.ticketInfo.set({ ...this.ticketInfo()!, type: value });
  }
}

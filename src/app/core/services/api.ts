import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { apiEndPoints } from '../../constants';

@Injectable({
  providedIn: 'root',
})

export class Api {

  constructor(private http: HttpClient) { }

  addTask(task: any) {
    return this.http.post(apiEndPoints.uploadTicket, task);
  }

  getAllUsers() {
    return this.http.get(apiEndPoints.allUsers);
  }

  getAllTickets() {
    return this.http.get(apiEndPoints.allTasks);
  }

  login(credentials: any) {
    return this.http.post(apiEndPoints.login, credentials);
  }

  register(credentials: any) {
    return this.http.post(apiEndPoints.register, credentials);
  }

  validateToken(token: string) {
    return this.http.post(apiEndPoints.tokenValidation, { token: token });
  }

  updateTicket(ticketId: string, updates: any) {
    return this.http.post(apiEndPoints.updateticket, { taskId: ticketId, updates })
  }

  //  comment


  handleAddComment(comment: any) {
    return this.http.post(`${apiEndPoints.addComment}/${comment.taskId}`, { comment });
  }

  handleGetAllComments(taskId: string) {
    return this.http.get(`${apiEndPoints.allComments}/${taskId}`);
  }

  handleUpdateComment(updates: any) {
   return this.http.post(apiEndPoints.editComment, updates);
  }

}

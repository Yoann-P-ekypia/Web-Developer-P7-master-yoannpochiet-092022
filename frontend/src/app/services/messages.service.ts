import { Injectable } from '@angular/core';
import { catchError, mapTo, of, Subject, tap, throwError } from 'rxjs';
import { Message } from '../models/Message.model';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class MessagesService {

  messages$ = new Subject<Message[]>();

  constructor(private http: HttpClient,
              private auth: AuthService) {}

  getMessages() {
    this.http.get<Message[]>('http://localhost:3000/api/messages').pipe(
      tap(messages => this.messages$.next(messages)),
      catchError(error => {
        console.error(error.error.message);
        return of([]);
      })
    ).subscribe();
  }

  getMessageById(id: string) {
    return this.http.get<Message>('http://localhost:3000/api/messages/' + id).pipe(
      catchError(error => throwError(error.error.message))
    );
  }

  likeMessage(id: string, like: boolean) {
    return this.http.post<{ message: string }>(
      'http://localhost:3000/api/messages/' + id + '/like',
      { userId: this.auth.getUserId(), like: like ? 1 : 0 }
    ).pipe(
      mapTo(like),
      catchError(error => throwError(error.error.message))
    );
  }

  dislikeMessage(id: string, dislike: boolean) {
    return this.http.post<{ message: string }>(
      'http://localhost:3000/api/messages/' + id + '/like',
      { userId: this.auth.getUserId(), like: dislike ? -1 : 0 }
    ).pipe(
      mapTo(dislike),
      catchError(error => throwError(error.error.message))
    );
  }

  createMessage(message: Message, image: File) {
    const formData = new FormData();
    formData.append('message', JSON.stringify(message));
    formData.append('image', image);
    return this.http.post<{ message: string }>('http://localhost:3000/api/messages', formData).pipe(
      catchError(error => throwError(error.error.message))
    );
  }

  modifyMessage(id: string, message: Message, image: string | File) {
    if (typeof image === 'string') {
      return this.http.put<{ message: string }>('http://localhost:3000/api/messages/' + id, message).pipe(
        catchError(error => throwError(error.error.message))
      );
    } else {
      const formData = new FormData();
      formData.append('message', JSON.stringify(message));
      formData.append('image', image);
      return this.http.put<{ message: string }>('http://localhost:3000/api/messages/' + id, formData).pipe(
        catchError(error => throwError(error.error.message))
      );
    }
  }

  deleteMessage(id: string) {
    return this.http.delete<{ message: string }>('http://localhost:3000/api/messages/' + id).pipe(
      catchError(error => throwError(error.error.message))
    );
  }
}

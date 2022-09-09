import { Component, OnInit } from '@angular/core';
import { MessagesService } from '../services/messages.service';
import { catchError, Observable, of, tap } from 'rxjs';
import { Message } from '../models/Message.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-message-list',
  templateUrl: './message-list.component.html',
  styleUrls: ['./message-list.component.scss']
})
export class MessageListComponent implements OnInit {

  messages$!: Observable<Message[]>;
  loading!: boolean;
  errorMsg!: string;

  constructor(private message: MessagesService,
              private router: Router) { }

  ngOnInit() {
    this.loading = true;
    this.messages$ = this.message.messages$.pipe(
      tap(() => {
        this.loading = false;
        this.errorMsg = '';
      }),
      catchError(error => {
        this.errorMsg = JSON.stringify(error);
        this.loading = false;
        return of([]);
      })
    );
    this.message.getMessages();
  }

  onClickMessage(id: string) {
    this.router.navigate(['message', id]);
  }

}

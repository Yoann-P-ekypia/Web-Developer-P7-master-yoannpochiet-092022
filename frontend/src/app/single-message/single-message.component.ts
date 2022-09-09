import { Component, OnInit } from '@angular/core';
import { Message } from '../models/Message.model';
import { MessagesService } from '../services/messages.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { catchError, EMPTY, map, Observable, of, switchMap, take, tap } from 'rxjs';

@Component({
  selector: 'app-single-message',
  templateUrl: './single-message.component.html',
  styleUrls: ['./single-message.component.scss']
})
export class SingleMessageComponent implements OnInit {

  loading!: boolean;
  message$!: Observable<Message>;
  userId!: string;
  likePending!: boolean;
  liked!: boolean;
  disliked!: boolean;
  errorMessage!: string;

  constructor(private messages: MessagesService,
    private route: ActivatedRoute,
    private auth: AuthService,
    private router: Router) { }

  ngOnInit() {
    this.userId = this.auth.getUserId();
    this.loading = true;
    this.userId = this.auth.getUserId();
    this.message$ = this.route.params.pipe(
      map(params => params['id']),
      switchMap(id => this.messages.getMessageById(id)),
      tap(message => {
        this.loading = false;
        if (message.usersLiked.find(user => user === this.userId)) {
          this.liked = true;
        } else if (message.usersDisliked.find(user => user === this.userId)) {
          this.disliked = true;
        }
      })
    );
  }

  onLike() {
    if (this.disliked) {
      return;
    }
    this.likePending = true;
    this.message$.pipe(
      take(1),
      switchMap((message: Message) => this.messages.likeMessage(message._id, !this.liked).pipe(
        tap(liked => {
          this.likePending = false;
          this.liked = liked;
        }),
        map(liked => ({ ...message, likes: liked ? message.likes + 1 : message.likes - 1 })),
        tap(message => this.message$ = of(message))
      )),
    ).subscribe();
  }

  onDislike() {
    if (this.liked) {
      return;
    }
    this.likePending = true;
    this.message$.pipe(
      take(1),
      switchMap((message: Message) => this.messages.dislikeMessage(message._id, !this.disliked).pipe(
        tap(disliked => {
          this.likePending = false;
          this.disliked = disliked;
        }),
        map(disliked => ({ ...message, dislikes: disliked ? message.dislikes + 1 : message.dislikes - 1 })),
        tap(message => this.message$ = of(message))
      )),
    ).subscribe();
  }

  onBack() {
    this.router.navigate(['/messages']);
  }

  onModify() {
    this.message$.pipe(
      take(1),
      tap(message => this.router.navigate(['/modify-message', message._id]))
    ).subscribe();
  }

  onDelete() {
    this.loading = true;
    this.message$.pipe(
      take(1),
      switchMap(message => this.messages.deleteMessage(message._id)),
      tap(message => {
        console.log(message);
        this.loading = false;
        this.router.navigate(['/messages']);
      }),
      catchError(error => {
        this.loading = false;
        this.errorMessage = error.message;
        console.error(error);
        return EMPTY;
      })
    ).subscribe();
  }
}

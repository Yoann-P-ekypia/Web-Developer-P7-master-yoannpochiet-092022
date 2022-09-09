import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MessagesService } from '../services/messages.service';
import { Message } from '../models/Message.model';
import { AuthService } from '../services/auth.service';
import { catchError, EMPTY, switchMap, tap } from 'rxjs';

@Component({
  selector: 'app-message-form',
  templateUrl: './message-form.component.html',
  styleUrls: ['./message-form.component.scss']
})
export class MessageFormComponent implements OnInit {

  messageForm!: FormGroup;
  mode!: string;
  loading!: boolean;
  message!: Message;
  errorMsg!: string;
  imagePreview!: string;

  constructor(private formBuilder: FormBuilder,
              private route: ActivatedRoute,
              private router: Router,
              private messages: MessagesService,
              private auth: AuthService) { }

  ngOnInit() {
    this.loading = true;
    this.route.params.pipe(
      switchMap(params => {
        if (!params['id']) {
          this.mode = 'new';
          this.initEmptyForm();
          this.loading = false;
          return EMPTY;
        } else {
          this.mode = 'edit';
          return this.messages.getMessageById(params['id'])
        }
      }),
      tap(message => {
        if (message) {
          this.message = message;
          this.initModifyForm(message);
          this.loading = false;
        }
      }),
      catchError(error => this.errorMsg = JSON.stringify(error))
    ).subscribe();
  }

  initEmptyForm() {
    this.messageForm = this.formBuilder.group({
      name: [null, Validators.required],
      manufacturer: [null, Validators.required],
      description: [null, Validators.required],
      image: [null, Validators.required],
      mainPepper: [null, Validators.required],
      heat: [1, Validators.required],
      heatValue: [{value: 1, disabled: true}]
    });
    this.messageForm.get('heat')!.valueChanges.subscribe(
      (value) => {
        this.messageForm.get('heatValue')!.setValue(value);
      }
    );
  }

  initModifyForm(message: Message) {
    this.messageForm = this.formBuilder.group({
      name: [message.name, Validators.required],
      manufacturer: [message.manufacturer, Validators.required],
      description: [message.description, Validators.required],
      image: [message.imageUrl, Validators.required],
      mainPepper: [message.mainPepper, Validators.required],
      heat: [message.heat, Validators.required],
      heatValue: [{value: message.heat, disabled: true}]
    });
    this.messageForm.get('heat')!.valueChanges.subscribe(
      (value) => {
        this.messageForm.get('heatValue')!.setValue(value);
      }
    );
    this.imagePreview = this.message.imageUrl;
  }

  onSubmit() {
    this.loading = true;
    const newMessage = new Message();
    newMessage.name = this.messageForm.get('name')!.value;
    newMessage.manufacturer = this.messageForm.get('manufacturer')!.value;
    newMessage.description = this.messageForm.get('description')!.value;
    newMessage.mainPepper = this.messageForm.get('mainPepper')!.value;
    newMessage.heat = this.messageForm.get('heat')!.value;
    newMessage.userId = this.auth.getUserId();
    if (this.mode === 'new') {
      this.messages.createMessage(newMessage, this.messageForm.get('image')!.value).pipe(
        tap(({ message }) => {
          console.log(message);
          this.loading = false;
          this.router.navigate(['/messages']);
        }),
        catchError(error => {
          console.error(error);
          this.loading = false;
          this.errorMsg = error.message;
          return EMPTY;
        })
      ).subscribe();
    } else if (this.mode === 'edit') {
      this.messages.modifyMessage(this.message._id, newMessage, this.messageForm.get('image')!.value).pipe(
        tap(({ message }) => {
          console.log(message);
          this.loading = false;
          this.router.navigate(['/messages']);
        }),
        catchError(error => {
          console.error(error);
          this.loading = false;
          this.errorMsg = error.message;
          return EMPTY;
        })
      ).subscribe();
    }
  }

  onFileAdded(event: Event) {
    const file = (event.target as HTMLInputElement).files![0];
    this.messageForm.get('image')!.setValue(file);
    this.messageForm.updateValueAndValidity();
    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview = reader.result as string;
    };
    reader.readAsDataURL(file);
  }
}

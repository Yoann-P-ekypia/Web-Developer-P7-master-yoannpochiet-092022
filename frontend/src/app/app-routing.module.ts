import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MessageListComponent } from './message-list/message-list.component';
import { MessageFormComponent } from './message-form/message-form.component';
import { SingleMessageComponent } from './single-message/single-message.component';
import { SignupComponent } from './auth/signup/signup.component';
import { LoginComponent } from './auth/login/login.component';
import { AuthGuard } from './services/auth-guard.service';

const routes: Routes = [
  { path: 'signup', component: SignupComponent },
  { path: 'login', component: LoginComponent },
  { path: 'messages', component: MessageListComponent, canActivate: [AuthGuard] },
  { path: 'message/:id', component: SingleMessageComponent, canActivate: [AuthGuard] },
  { path: 'new-message', component: MessageFormComponent, canActivate: [AuthGuard] },
  { path: 'modify-message/:id', component: MessageFormComponent, canActivate: [AuthGuard] },
  { path: '', pathMatch: 'full', redirectTo: 'messages'},
  { path: '**', redirectTo: 'messages' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [AuthGuard]
})
export class AppRoutingModule { }

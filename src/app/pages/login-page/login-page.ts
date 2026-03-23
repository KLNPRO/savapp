// src/app/pages/login-page/login-page.ts
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-login-page',
  imports: [CommonModule, FormsModule],
  templateUrl: './login-page.html',
  styleUrl: './login-page.css',
})
export class LoginPage {
  public credentials = { identifier: '', password: '' };
  public errorMessage: string | null = null;

  constructor(private http: HttpClient, private router: Router) {}

  onSubmit(): void {
    this.errorMessage = null;
    this.http.post<any>('http://localhost:8080/auth/login', this.credentials).subscribe({
      next: (response) => {
        if (response.token) {
          localStorage.setItem('savapp_jwt_token', response.token);
        }
        this.router.navigate(['/recipe-manager']);
      },
      error: () => {
        this.errorMessage = 'Identifiants invalides ou serveur indisponible.';
      }
    });
  }
}

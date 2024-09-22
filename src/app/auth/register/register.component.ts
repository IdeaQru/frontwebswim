import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {

  // Properti untuk form
  name: string = '';
  username: string = '';
  role: string = '';
  password: string = '';
  successMessage: string='';
  errorMessage: string='';

  // Dependency injection untuk AuthService dan Router
  constructor(private authService: AuthService, private router: Router) {}

  // Fungsi untuk submit form register
  register() {
    const userData = {
      username: this.username,
      name: this.name,
      password: this.password,
      role: this.role || 'USER',
    };
    console.log('Data dikirim ke backend:', userData);
    this.authService.register(userData).subscribe(
      response => {
        console.log('Registration successful', response);
        this.successMessage = 'Registration successful!';
        this.errorMessage = ''; // Clear error message if any
        this.router.navigate(['/login']);  // Redirect ke login setelah sukses
      },
      error => {
        this.errorMessage = 'Registration failed! Please try again.';
        this.successMessage = ''; // Clear success message if any
        console.error('Error during registration', error);
      }
    );
  }
}

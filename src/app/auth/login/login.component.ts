import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
username: string = '';
password :string ='';
errorMessage: string = '';

constructor(private authService: AuthService, private router: Router) {}


login() {
  const userData = {
    username: this.username,
    password: this.password
  };

  this.authService.login(userData).subscribe(
    response => {
      console.log('Login successful', response);
      this.router.navigate(['/dashboard']);  // Redirect ke dashboard setelah sukses
    },
    error => {
      console.error('Error during login', error);
      this.errorMessage = 'Login failed! Please try again.';
    }
  );
}
}

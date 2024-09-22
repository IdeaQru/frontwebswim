import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  notifications: Notification[] = [];
  userName: string | null = '';

  constructor(private authService: AuthService, private router: Router) { }
  ngOnInit(): void {
    this.userName = this.authService.getUserName();
    this.isPluginVisible = false;
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
  callToggleSidenav() {
    // Panggil fungsi toggleSidenav dengan id "sidenav-main"
    toggleSidenav("sidenav-main");
  }
  togglePluginVisibility() {
    this.isPluginVisible = !this.isPluginVisible;
  }


  closeFixedPlugin() {
    this.isPluginVisible = false;
  }

  getIsPluginVisible(): boolean {
    return this.isPluginVisible;
  }

  isPluginVisible: boolean = false;



}
function toggleSidenav(arg0: string) {
  throw new Error('Function not implemented.');
}


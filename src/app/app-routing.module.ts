import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { MainlayoutComponent } from './mainlayout/mainlayout.component';
import { AuthGuard } from './auth.guard';
import { BukuAcaraComponent } from './pages/admincontrol/buku_acara/buku-acara.component';
import { AtletComponent } from './pages/usercontrol/atlet/atlet.component';
import { DashboardComponent } from './pages/usercontrol/dashboard/dashboard.component';
import { OfficialComponent } from './pages/usercontrol/official/official.component';
import { NomorperlombaanComponent } from './pages/admincontrol/nomorperlombaan/nomorperlombaan.component';
import { InputhasilComponent } from './pages/admincontrol/input_hasil/inputhasil.component';
import { AcaraperlombaanComponent } from './pages/usercontrol/acaraperlombaan/acaraperlombaan.component';
import { StartingListComponent } from './pages/usercontrol/startinglist/startinglist.component';
import { HasilperlombaanComponent } from './pages/admincontrol/hasilperlombaan/hasilperlombaan.component';

const routes: Routes = [
  {
    path:'login',
    component : LoginComponent,
    children : [
    {  path : '',component : LoginComponent}
    ]
  },
  {
    path : 'register',
    component : RegisterComponent,
    children : [
      {  path : '',component : RegisterComponent}
    ]
  },
  {
    path :'' ,
    component : MainlayoutComponent,
    canActivate : [AuthGuard],
    children : [
      // ADmin Control Routes
      { path: 'nomor-perlombaan', component: NomorperlombaanComponent },
      { path: 'buku-acara', component: BukuAcaraComponent },
      { path: 'input-hasil', component: InputhasilComponent },

      // User Control Routes
      { path: 'dashboard', component: DashboardComponent },
      { path: 'officials', component: OfficialComponent },
      { path: 'athletes', component: AtletComponent },
      { path: 'events', component: AcaraperlombaanComponent },
      { path: 'starting-list', component: StartingListComponent },
      { path: 'results', component: HasilperlombaanComponent },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },

    ]
  },
  {path: '**', redirectTo: 'login'}

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

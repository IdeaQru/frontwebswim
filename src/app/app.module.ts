import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SidebarComponent } from './layout/sidebar/sidebar.component';
import { NavbarComponent } from './layout/navbar/navbar.component';
import { FooterComponent } from './layout/footer/footer.component';
import { UiconfiguratorComponent } from './uiconfigurator/uiconfigurator.component';
import { DashboardComponent } from './pages/usercontrol/dashboard/dashboard.component';
import { OfficialComponent } from './pages/usercontrol/official/official.component';
import { AtletComponent } from './pages/usercontrol/atlet/atlet.component';
import { AcaraperlombaanComponent } from './pages/usercontrol/acaraperlombaan/acaraperlombaan.component';
import { StartinglistComponent } from './pages/usercontrol/startinglist/startinglist.component';
import { HasilperlombaanComponent } from './pages/usercontrol/hasilperlombaan/hasilperlombaan.component';
import { NomorperlombaanComponent } from './pages/admincontrol/nomorperlombaan/nomorperlombaan.component';
import { InputhasilComponent } from './pages/admincontrol/input_hasil/inputhasil.component';
import { BukuAcaraComponent } from './pages/admincontrol/buku_acara/buku-acara.component';

@NgModule({
  declarations: [
    AppComponent,
    SidebarComponent,
    NavbarComponent,
    FooterComponent,
    UiconfiguratorComponent,
    DashboardComponent,
    OfficialComponent,
    AtletComponent,
    AcaraperlombaanComponent,
    StartinglistComponent,
    HasilperlombaanComponent,
    NomorperlombaanComponent,
    InputhasilComponent,
    BukuAcaraComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

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
import { StartingListComponent } from './pages/usercontrol/startinglist/startinglist.component';
import { HasilperlombaanComponent } from './pages/admincontrol/hasilperlombaan/hasilperlombaan.component';
import { NomorperlombaanComponent } from './pages/admincontrol/nomorperlombaan/nomorperlombaan.component';
import { InputhasilComponent } from './pages/admincontrol/input_hasil/inputhasil.component';
import { BukuAcaraComponent } from './pages/admincontrol/buku_acara/buku-acara.component';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { MainlayoutComponent } from './mainlayout/mainlayout.component';
import { ReactiveFormsModule } from '@angular/forms'; // Tambahkan ini
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { SafeUrlPipe } from './safe-url.pipe';

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
    StartingListComponent,
    HasilperlombaanComponent,
    NomorperlombaanComponent,
    InputhasilComponent,
    BukuAcaraComponent,
    LoginComponent,
    RegisterComponent,
    MainlayoutComponent,
    SafeUrlPipe
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    NgxExtendedPdfViewerModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { MatCardModule } from '@angular/material/card';

import { AppComponent } from './app.component';
import {  FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { AgGridAngular } from 'ag-grid-angular';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { AuthComponent } from './auth/auth/auth.component';
import { HomeComponent } from './Home/home/home.component';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { LoginComponent } from './Login/login/login.component';
import { RoomsComponent } from './Rooms/rooms/rooms.component';
import { MatSelectModule } from '@angular/material/select';
import { AuthInterceptor } from './Interceptor/auth.interceptor';
import { OpenaiService } from './service/openai.service';

 const routes:Routes=[
  {path:'',component:HomeComponent},
  {path:'login',component:AuthComponent},
  {path:'Enter',component:LoginComponent},
  {path:'rooms',component:RoomsComponent}
]
@NgModule({
  declarations: [
    AppComponent,
    AuthComponent,
    HomeComponent,
    LoginComponent,
    RoomsComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forRoot(routes),
    AgGridAngular,
    HttpClientModule,
    MatCardModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule
  ],
  providers: [
    OpenaiService,
    provideAnimationsAsync(),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true  // This ensures that multiple interceptors can be used
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

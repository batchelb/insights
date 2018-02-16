import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatSliderModule,  MatInputModule, MatCardModule, MatAutocompleteModule, MatProgressBarModule, MatDialogModule, MatCheckboxModule, MatRadioModule, MatSelectModule, MatButtonModule } from '@angular/material';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { Interceptor } from './interceptors/interceptor';
import { CoreService } from './core.service';
import { AuthService } from './auth.service';
import { LoginComponent } from './login/login.component';
import { RouterModule, Routes } from '@angular/router';
import { CreateInsightComponent } from './create-insight/create-insight.component';
import { AuthGuard } from './auth-guard';
import { ReactiveFormsModule } from '@angular/forms';
import { Ng2DragDropModule } from 'ng2-drag-drop';
import { QuillModule } from 'ngx-quill';
import { ViewInsightsComponent } from './view-insights/view-insights.component';
import { CapitalizePipe } from './capitalize.pipe';
import { ViewDetailsComponent } from './view-insights/view-details/view-details.component';

const appRoutes: Routes = [
  { path: 'create', component: CreateInsightComponent, canActivate: [AuthGuard]},
  { path: 'view', component: ViewInsightsComponent, canActivate: [AuthGuard]},
  { path: 'login', component: LoginComponent },
  { path: '**', component: CreateInsightComponent, canActivate: [AuthGuard]}
];
@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    CreateInsightComponent,
    ViewInsightsComponent,
    CapitalizePipe,
    ViewDetailsComponent
  ],
  imports: [
    BrowserModule,
    Ng2DragDropModule.forRoot(),
    FormsModule,
    MatCardModule,
    ReactiveFormsModule,
    MatSliderModule,
    MatInputModule,
    MatAutocompleteModule,
    MatProgressBarModule,
    MatDialogModule,
    MatCheckboxModule,
    MatRadioModule,
    MatSelectModule,
    MatButtonModule,
    BrowserAnimationsModule,
    HttpClientModule,
    RouterModule.forRoot(appRoutes, { useHash: true }),
    QuillModule
  ],
  providers: [{ provide: HTTP_INTERCEPTORS, useClass: Interceptor, multi: true }, CoreService, AuthService, AuthGuard],
  bootstrap: [AppComponent],
  entryComponents:[ViewDetailsComponent]
})
export class AppModule { }

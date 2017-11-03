import { BrowserModule } from '@angular/platform-browser';
import { LOCALE_ID, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';


/// COMPONENTI
import { AppComponent } from './app.component';
import { MainComponent } from './views/main/main.component';
import { RouteDetailComponent } from './views/main/routeDetail/routeDetail.component';
import { HeaderComponent } from './views/header/header.component';

/// PIPES
import { MinutesToHoursPipe } from '@shared/minutes.pipe';
import { CapitalizePipe } from '@shared/capitalize.pipe';

/// SERVIZI
import { RouteService } from '@shared/route.service';
import { UtilityService } from '@shared/utility.service';


/// DIPENDENZE ESTERNE
import { DataTableModule,
  MultiSelectModule,
  SliderModule,
  SharedModule,
  CalendarModule } from 'primeng/primeng';

import * as $ from 'jquery';

@NgModule({
  declarations: [
    AppComponent,
    MainComponent,
    RouteDetailComponent,
    HeaderComponent,
    MinutesToHoursPipe,
    CapitalizePipe
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    DataTableModule,
    SharedModule,
    SliderModule,
    MultiSelectModule,
    CalendarModule,
    BrowserAnimationsModule
  ],
  providers: [
    RouteService,
    UtilityService,
    { provide: LOCALE_ID, useValue: 'it' }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

/// COMPONENTI
import { AppComponent } from './app.component';
import { ToolbarComponent } from './views/toolbar/toolbar.component';
import { MainComponent } from './views/main/main.component';
import { HeaderComponent } from './views/header/header.component';

/// PIPES
import { MinutesToHoursPipe } from './shared/minutes.pipe';

/// SERVIZI
import { RouteService } from './shared/route.service';
import { UtilityService } from './shared/utility.service';

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
    ToolbarComponent,
    MainComponent,
    HeaderComponent,
    MinutesToHoursPipe
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
    UtilityService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

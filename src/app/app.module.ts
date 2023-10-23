import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {AppComponent} from './app.component';
import {MatCardModule} from "@angular/material/card";
import {MatButtonModule} from "@angular/material/button";
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {NodeViewComponent} from "./node-view/node-view.component";
import {NodeCompositeComponent} from "./node-composite/node-composite.component";
import {HttpClientModule} from "@angular/common/http";

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    MatCardModule,
    MatButtonModule,
    BrowserAnimationsModule,
    NodeViewComponent,
    NodeCompositeComponent,
    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {
}

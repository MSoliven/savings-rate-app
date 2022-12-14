import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { NgChartsModule } from 'ng2-charts';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CompoundInterestComponent } from './calculators/compound-interest/compound-interest.component';
import { KeyPipe } from './key.pipe';
import { CurrencyPipe } from '@angular/common';
import { ChooseQuantityComponent } from './form-controls/choose-quantity/choose-quantity.component';


@NgModule({
  declarations: [
    AppComponent,
    CompoundInterestComponent,
    KeyPipe,
    ChooseQuantityComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    NgChartsModule
  ],
  providers: [CurrencyPipe],
  bootstrap: [AppComponent]
})
export class AppModule { }

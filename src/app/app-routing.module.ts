import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SavingsRateComponent } from './calculators/savings-rate/savings-rate.component';

const routes: Routes = [
  { path: '', component: SavingsRateComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

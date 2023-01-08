import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CompoundInterestComponent } from './calculators/compound-interest/compound-interest.component';
import { MillionaireNextDoorComponent } from './calculators/millionaire-next-door/millionaire-next-door.component';

const routes: Routes = [
  { path: '', component: CompoundInterestComponent },
  { path: 'compoundInterest', component: CompoundInterestComponent },
  { path: 'millionaireNextDoor', component: MillionaireNextDoorComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';
import { Validators } from '@angular/forms';

import { CurrencyPipe } from '@angular/common';
import { FormatUtil } from '../../formatutil';
import { BaseComponent } from 'src/app/base/base.component';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-savings-rate',
  templateUrl: './savings-rate.component.html',
  styleUrls: ['./savings-rate.component.scss']
})

export class SavingsRateComponent extends BaseComponent implements OnInit {

  inputForm: any = {};

  public savingsRateStr: string = "";
  public resultsAvailable: boolean = false;

  
  constructor(public override router: Router, public override route: ActivatedRoute, private fb: FormBuilder) {
    super(router, route);
  }

  override ngOnInit(): void {
    super.ngOnInit();

    this.inputForm = this.fb.group({
      preTaxSavings: ["$0"],
      afterTaxSavings: ["$0"],
      takeHomePay: ["$0"],
      savingsRate: [""]
    });
  }

  calcSavingsRate(preTaxSavings: number, afterTaxSavings: number, takeHomePay: number) : number {
    return (preTaxSavings + afterTaxSavings) / (takeHomePay + preTaxSavings) * 100;
  }

  onSubmit() {

    // TODO: Use EventEmitter with form value
    console.warn(this.inputForm.value);

    if (!this.resultsAvailable) {
      let input = this.inputForm.value;
      let preTaxSavings = FormatUtil.parseToNumber(input.preTaxSavings);
      let afterTaxSavings = FormatUtil.parseToNumber(input.afterTaxSavings);
      let takeHomePay = FormatUtil.parseToNumber(input.takeHomePay);

      var savingsRate = Math.round(this.calcSavingsRate(preTaxSavings, afterTaxSavings, takeHomePay));
      if (isNaN(savingsRate)) savingsRate = 0;

      this.savingsRateStr = FormatUtil.formatPercentage(savingsRate, 0);

      this.inputForm.get("preTaxSavings").disable();
      this.inputForm.get("afterTaxSavings").disable();
      this.inputForm.get("takeHomePay").disable();
    }
    else {
      this.ngOnInit();
    }

    this.resultsAvailable = !this.resultsAvailable;
  }

  formatCurrency(e: any) {
    e.target.value = FormatUtil.formatNumber(FormatUtil.parseToNumber(e.target.value), 0); 
  } 

}

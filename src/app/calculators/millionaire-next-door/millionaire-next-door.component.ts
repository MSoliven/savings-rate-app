
import { Component, Inject, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Validators } from '@angular/forms';

import { Chart, ChartConfiguration, ChartData, ChartEvent, ChartType } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import DataLabelsPlugin from 'chartjs-plugin-datalabels';
import { CurrencyPipe } from '@angular/common';
import { trigger } from '@angular/animations';
import { FormatUtil } from '../../formatutil';

@Component({
  selector: 'app-millionaire-next-door',
  templateUrl: './millionaire-next-door.component.html',
  styleUrls: ['./millionaire-next-door.component.scss']
})

export class MillionaireNextDoorComponent {

  inputForm: any = {};

  public barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    // We use these empty structures as placeholders for dynamic theming.
    scales: {
      x: {
        stacked: true
      },
      y: {
        min: 10
      }
    },
    plugins: {
      legend: {
        display: true,
      },
      datalabels: {
        // anchor: 'end',
        // align: 'end',
        display: false
      }
    },
    maintainAspectRatio: false
  };
  public barChartType: ChartType = 'bar';
  public barChartPlugins = [
    DataLabelsPlugin
  ];

  public barChartData: ChartData<'bar'> = {
    labels: [],
    datasets: [
      { data: [], label: 'Growth' }
    ]
  };

  public formattedAmount: string = "";
  public expectedNetWorth: number = 0;
  public uawNetWorthCeiling: number = 0;
  public aawNetWorthCeiling: number = 0;
  
  constructor(private currencyPipe: CurrencyPipe, private fb: FormBuilder) { }

  calcExpectedNetWorth(age: number, income: number, inheritance: number): number {
    return (age * income / 10) - inheritance;
  }

  onSubmit() {
    // TODO: Use EventEmitter with form value
    console.warn(this.inputForm.value);
    let input = this.inputForm.value;
    let age = FormatUtil.parseToNumber(input.age);
    let grossIncome = FormatUtil.parseToNumber(input.grossIncome);
    let otherIncome = FormatUtil.parseToNumber(input.otherIncome);
    let inheritance = FormatUtil.parseToNumber(input.inheritance);
    let freq = FormatUtil.parseToNumber(input.compoundFreq);

    this.expectedNetWorth = this.calcExpectedNetWorth(age, grossIncome+otherIncome, inheritance);

    //this.barChartData.labels = this.calcLabels(input.yearsToGrow as number);
    this.barChartData.datasets = this.calcResultsets(this.expectedNetWorth); 
    //years, rate, freq);

    //this.chart?.update();
  }

  calcResultsets(expectedNetWorth: number): any {

      const calcGrowth = (balance: number, compoundRate: number): number => {
        return balance * compoundRate;
      };

      return [{}];
  }

}

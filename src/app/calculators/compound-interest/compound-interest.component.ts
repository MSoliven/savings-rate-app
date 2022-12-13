import { Component, Inject, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Validators } from '@angular/forms';
import { NavigationEnd, Router, ActivatedRoute } from '@angular/router';

import { Chart, ChartConfiguration, ChartData, ChartEvent, ChartType } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import DataLabelsPlugin from 'chartjs-plugin-datalabels';
import { CurrencyPipe } from '@angular/common';

class TableDataRow {
  public year: string;
  public balance: string;
  public contributions: string;

  public constructor(y: string, b: string, c: string) {
    this.year = y;
    this.balance = b;
    this.contributions = c;
  }
}

@Component({
  selector: 'app-compound-interest',
  templateUrl: './compound-interest.component.html',
  styleUrls: ['./compound-interest.component.scss']
})
export class CompoundInterestComponent {
  @ViewChild(BaseChartDirective) chart: BaseChartDirective | undefined;

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

  public tableDataRows: any[] = [];
  
  compoundFreqList = [
    { id: 1, name: "Annually" },
    { id: 2, name: "Semiannually" },
    { id: 4, name: "Quarterly" },
    { id: 6, name: "Bimonthly" },
    { id: 12, name: "Monthly" },
    { id: 360, name: "Daily" }
  ];

  public futureBalance: string = "$0.00";
  public formattedAmount: string = "";

  constructor(private router: Router, private route: ActivatedRoute, private currencyPipe: CurrencyPipe, private fb: FormBuilder) { }

  ngOnInit(): void {

    this.router.events.subscribe(
      (event: any) => {
        if (event instanceof NavigationEnd) {
          this.route.queryParamMap
            .subscribe((paramsMap: any) => {

              let initial = Number(paramsMap.params["initial"]);
              let monthly = Number(paramsMap.params["monthly"]);
              let years = Number(paramsMap.params["years"]);
              let rate = Number(paramsMap.params["rate"]);
              let freq = Number(paramsMap.params["freq"]);

              const getValue = (num: number, def: Number) => {
                if (isNaN(num)) return def;
                return num;
              };

              this.inputForm = this.fb.group({
                initialPrincipal: [getValue(initial, 0), Validators.required],
                monthlyContribution: [getValue(monthly, 1000)],
                yearsToGrow: [getValue(years, 10)],
                interestRate: [getValue(rate, 8)],
                compoundFreq: [getValue(freq, 360)]
              });

              this.onChange()
            }
        );
        }
      }
    );


  }

  onChange() {
    // TODO: Use EventEmitter with form value
    console.warn(this.inputForm.value);
    let input = this.inputForm.value;

    this.barChartData.labels = this.calcLabels(input.yearsToGrow as number);
    this.barChartData.datasets = this.calcResultsets(input.initialPrincipal!, input.monthlyContribution!, 
      input.yearsToGrow!, input.interestRate!, input.compoundFreq!);
  
    this.generateTableData();
    this.chart?.update();
  }

  calcLabels(yearsToGrow: number) : string[] {
    let labels: string[] = [];

    for(let i=0; i <= yearsToGrow; i++) {
      labels.push("Year " + i);
    }

    return labels;
  }

  formatNumber(num: number): string {
    return "$" + num.toLocaleString("en-US", {minimumFractionDigits: 2, maximumFractionDigits: 2});
  }

  transformAmount(element: any){
    this.formattedAmount = this.currencyPipe.transform(this.formattedAmount, '$') as string;
    element.target.value = this.formattedAmount;
  }

  calcResultsets(initialPrincipal: number, monthlyContribution: number, yearsToGrow: number, 
    interestRate: number, compoundFreq: number): any {

      let balances: number[] = [];
      let contributions: number[] = [];
      let rate = interestRate / 100;
      let compoundRate = rate / compoundFreq;
      let balance: number = initialPrincipal;
      let months = (yearsToGrow * 12); //10 years of monthly contributions
      let totalContribs: number = initialPrincipal;
      let growth: number;
      let contribs: number = 0;

      const calcGrowth = (balance: number, compoundRate: number): number => {
        return balance * compoundRate;
      };

      const calcGrowth2 = (p: number, t: number, r: number, n: number) => {
        const amount = p * (Math.pow((1 + (r / n)), (n * t)));
        const interest = amount - p;
        return interest;
     };

      for (let i = 0; i <= months; i++) {
        if (i == 0) {
          balances.push(balance);
          contributions.push(totalContribs);
        }
        else {
          contribs += monthlyContribution;
          switch(compoundFreq) {
            case 360:
              growth = calcGrowth2(balance, (1/12), rate, 360);
              balance += growth + contribs;
              totalContribs += contribs;
              contribs = 0;
              break;
            case 12:
                growth = calcGrowth(balance, compoundRate);
                balance += growth + contribs;
                totalContribs += contribs;
                contribs = 0;
              break;
            case 6:
              if (i % 2 === 0) {
                growth = calcGrowth(balance, compoundRate);
                balance += growth + contribs; 
                totalContribs += contribs;
                contribs = 0;
              }
              break;
            case 4:
              if (i % 3 === 0) {
                growth = calcGrowth(balance, compoundRate);
                balance += growth + contribs; 
                totalContribs += contribs;
                contribs = 0;
              }
              break;
            case 2:
              if (i % 6 === 0) {
                growth = calcGrowth(balance, compoundRate);
                balance += growth + contribs; 
                totalContribs += contribs;
                contribs = 0;
              }
              break;
            case 1:
              if (i % 12 === 0) {
                growth = calcGrowth(balance, compoundRate);
                balance += growth + contribs;    
                totalContribs += contribs; 
                contribs = 0;        
              }
              break;
          }
          if (i == 0 || i % 12 === 0) {
            balances.push(balance);
            contributions.push(totalContribs);
          }

        }
      }

      this.futureBalance = this.formatNumber(balance);

      return [{
        data: balances,
        label: "Balance"
      },{
        data: contributions,
        label: "Contributions"
      }];
  }

  generateTableData() {
    
    this.tableDataRows = [];



    for(let i=0; i < this.barChartData.labels!.length; i++) {
      this.tableDataRows.push(new TableDataRow(
        this.barChartData.labels![i] as string,
        this.formatNumber(this.barChartData.datasets[0].data[i] as number),
        this.formatNumber(this.barChartData.datasets[1].data[i] as number)
      ))
    }
  }

}

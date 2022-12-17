import { Component, Inject, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Validators } from '@angular/forms';
import { NavigationEnd, Router, ActivatedRoute } from '@angular/router';

import { Chart, ChartConfiguration, ChartData, ChartEvent, ChartType } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import DataLabelsPlugin from 'chartjs-plugin-datalabels';
import { CurrencyPipe } from '@angular/common';
import { trigger } from '@angular/animations';

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
  public showTable: boolean = false;
  public disableTable: boolean = true;

  public readOnly: boolean = false;
  

  compoundFreqList = [
    { id: "1", name: "Annually" },
    { id: "2", name: "Semiannually" },
    { id: "4", name: "Quarterly" },
    { id: "6", name: "Bimonthly" },
    { id: "12", name: "Monthly" },
    { id: "360", name: "Daily" }
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

              let initial = paramsMap.params["initial"];
              let monthly = paramsMap.params["monthly"];
              let years = paramsMap.params["years"];
              let rate = paramsMap.params["rate"];
              let freq = paramsMap.params["freq"];
       
              const getValue = (val: string, def: any) => {
                if (!val) return def;
                return val;
              };

              this.inputForm = this.fb.group({
                initialPrincipal: [getValue(initial, "$1,000.00"), Validators.required],
                monthlyContribution: [getValue(monthly, "$500.00")],
                yearsToGrow: [getValue(years, "30")],
                interestRate: [getValue(rate, "9.9769102")],
                compoundFreq: [getValue(freq, "1")]
              });

              this.onChange();

              let viewmode = getValue(paramsMap.params["viewmode"], "default") as string;

              switch(viewmode.toLowerCase()) {
                case "readonly":
                  this.readOnly = true;
                  this.disableTable = false;
                  break;
                case "readonlychart":
                  this.readOnly = true;
                  this.disableTable = true;
                  break;
                default:
                  this.readOnly = false;
                  this.disableTable = false;
              }
            }
        );
        }
      }
    );


  }

  parseToNumber(quantityStr: string): number {
    var num = Number(quantityStr.replace(/[^0-9.-]+/g,""));
    return num;
  }

  onChange() {
    // TODO: Use EventEmitter with form value
    console.warn(this.inputForm.value);
    let input = this.inputForm.value;
    let principal = this.parseToNumber(input.initialPrincipal);
    let monthly = this.parseToNumber(input.monthlyContribution);
    let years = this.parseToNumber(input.yearsToGrow);
    let rate = this.parseToNumber(input.interestRate);
    let freq = this.parseToNumber(input.compoundFreq);

    this.barChartData.labels = this.calcLabels(input.yearsToGrow as number);
    this.barChartData.datasets = this.calcResultsets(principal, monthly, 
      years, rate, freq);
  
    this.chart?.update();
    this.showTable = false;
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

  getCompoundFreqDesc(id: any): string {
    for (let i=0; i < this.compoundFreqList.length; i++) {
      if (this.compoundFreqList[i].id == id) 
        return this.compoundFreqList[i].name;
    }
    return "";
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

  generateAndShowTable() {
    
    this.tableDataRows = [];

    for(let i=0; i < this.barChartData.labels!.length; i++) {
      this.tableDataRows.push(new TableDataRow(
        this.barChartData.labels![i] as string,
        this.formatNumber(this.barChartData.datasets[0].data[i] as number),
        this.formatNumber(this.barChartData.datasets[1].data[i] as number)
      ))
    }

    this.showTable = true;
  }
}

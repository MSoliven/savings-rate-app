import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Validators } from '@angular/forms';
import { NavigationEnd, Router, ActivatedRoute } from '@angular/router';

import { Chart, ChartConfiguration, ChartData, ChartEvent, ChartType } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import DataLabelsPlugin from 'chartjs-plugin-datalabels';
import { FormatUtil } from '../../formatutil';
import { BaseComponent } from 'src/app/base/base.component';

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
export class CompoundInterestComponent extends BaseComponent implements OnInit {
  @ViewChild(BaseChartDirective) chart: BaseChartDirective | undefined;

  inputForm: any = {};

  public barChartOptions(minY: number): ChartConfiguration['options'] {
    return {
      responsive: true,
      // We use these empty structures as placeholders for dynamic theming.
      scales: {
          x: {
            stacked: true
          },
          y: {
            min: minY
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
  }

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
  public disableTable: boolean = false;
  public showCompoundFreq: boolean = true;

  public daysMode: boolean = false;

  public periodLabel: string = "Year";
  public periodContribLabel: string = "Monthly";
  public viewMode:string = "";
  public minY: number = 0;
  public contribStart: number = 1;
  public contribEnd: number = 999;

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
  
  constructor(public override router: Router, public override route: ActivatedRoute, private fb: FormBuilder) { 
    super(router, route);
  }

  override ngOnInit(): void {

    this.route.queryParams
      .subscribe(params => {
        let initial = params["initial"] as string;
        let monthly = params["monthly"] as string;
        let years = params["years"] as string;
        let rate = params["rate"] as string;
        let freq = params["freq"] as string;
        let view = params["view"] as string;
        
        this.onInitForm(initial, monthly, years, rate, freq, view);
        this.onChange(true);
      }
    );


  }

 onInitForm(initial: string, monthly: string, years: string, 
    rate: string, freq: string, view: string) {

    const getValue = (val: string, def: any) => {
      if (!val) return def;
      return val;
    };

    if (view) {
      switch(view.toLowerCase()) {
        case "readonly":
          this.readOnly = true;
          this.disableTable = false;
          this.compact = true;
          break;
        case "readonlychart":
          this.readOnly = true;
          this.disableTable = true;
          this.compact = true;
          break;
        case "compact":
          this.readOnly = false;
          this.disableTable = false;
          this.compact = true;
          break;
        case "compactchart":
          this.readOnly = false;
          this.disableTable = true;
          this.compact = true;
          break;
        case "doubledpenny":
          this.readOnly = true;
          this.compact = true;
          this.periodLabel = "Day";
          this.periodContribLabel = "Daily";
          this.showCompoundFreq = false;
          this.disableTable = true;
          initial = "$0.01";
          monthly = "$0";
          freq = "1";
          rate = "100%";
          break;
        case "hundredgrandaday":
          this.readOnly = true;
          this.compact = true;
          this.periodLabel = "Day";
          this.periodContribLabel = "Daily";
          this.showCompoundFreq = false;
          this.disableTable = true;
          initial = "$0.00";
          monthly = "$100,000"; // daily
          freq = "1";
          rate = "0%";
          break;
        case "jane":
          this.readOnly = true;
          this.compact = true;
          this.showCompoundFreq = false;
          this.disableTable = true;
          this.contribStart = 1;
          this.contribEnd = 120;
          initial = "$0.00";
          monthly = "$500.00";
          freq = "1";
          rate = "8%";
          years = "40";
          break;
        case "joe":
          this.readOnly = true;
          this.compact = true;
          this.showCompoundFreq = false;
          this.disableTable = true;
          this.contribStart = 120;
          this.contribEnd = 999;
          initial = "$0.00";
          monthly = "$500.00";
          freq = "1";
          rate = "8%";
          years = "40";
          break;
        default:
          this.readOnly = false;
          this.disableTable = false;
      }
      this.viewMode = view;
    }

    this.inputForm = this.fb.group({
      initialPrincipal: [getValue(initial, "$1,000.00"), Validators.required],
      monthlyContribution: [getValue(monthly, "$500.00")],
      yearsToGrow: [getValue(years, "30")],
      interestRate: [getValue(rate, "9.9769102")],
      compoundFreq: [getValue(freq, "1")],
      viewMode: [getValue(view, "")]
    });
  }

  onChange(init?: boolean) {
    // TODO: Use EventEmitter with form value
    console.warn(this.inputForm.value);
    let input = this.inputForm.value;

    if (!init && input.viewMode) {
      this.onInitForm(input.initialPrincipal, input.monthlyContribution, input.yearsToGrow,
        input.interestRate, input.compoundFreq, input.viewMode);
      input = this.inputForm.value;
    }
    
    let principal = FormatUtil.parseToNumber(input.initialPrincipal);
    let monthly = FormatUtil.parseToNumber(input.monthlyContribution);
    let years = FormatUtil.parseToNumber(input.yearsToGrow);
    let rate = FormatUtil.parseToNumber(input.interestRate);
    let freq = FormatUtil.parseToNumber(input.compoundFreq);


    this.barChartData.labels = this.calcLabels(input.yearsToGrow as number);
    this.barChartData.datasets = this.calcResultsets(principal, monthly, 
      years, rate, freq, input.viewMode);
    
    this.chart?.update();

    this.showTable = false;
  }

  calcLabels(yearsToGrow: number) : string[] {
    let labels: string[] = [];

    for(let i=0; i <= yearsToGrow; i++) {
      labels.push(this.periodLabel + " " + i);
    }

    return labels;
  }

  getCompoundFreqDesc(id: any): string {
    for (let i=0; i < this.compoundFreqList.length; i++) {
      if (this.compoundFreqList[i].id == id) 
        return this.compoundFreqList[i].name;
    }
    return "";
  }

  calcResultsets(initialPrincipal: number, regularContribs: number, numberOfPeriods: number, 
    interestRate: number, compoundFreq: number, viewmode?: string): any {

      let balances: number[] = [];
      let contributions: number[] = [];
      let rate = interestRate / 100;
      let compoundRate = rate / compoundFreq;
      let balance: number = initialPrincipal;
      let totalContribs: number = initialPrincipal;
      let growth: number;
      let contribs: number = 0;
      let dailyPeriod: boolean = (viewmode === "doubledpenny" || viewmode === "hundredgrandaday");
      let actualPeriods = !dailyPeriod ? (numberOfPeriods * 12) : numberOfPeriods; // monthly or daily
      let start: number = this.contribStart;
      let end: number = this.contribEnd;


      const calcGrowth = (balance: number, compoundRate: number): number => {
        return balance * compoundRate;
      };

      const calcGrowth2 = (p: number, t: number, r: number, n: number) => {
        const amount = p * (Math.pow((1 + (r / n)), (n * t)));
        const interest = amount - p;
        return interest;
     };

      for (let i = 0; i <= actualPeriods; i++) {
        if (i == 0) {
          balances.push(balance);
          contributions.push(totalContribs);
        }
        else {
          if (start <= i && i <= end) 
            contribs += regularContribs;
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
              if (dailyPeriod || i % 12 === 0) {
                growth = calcGrowth(balance, compoundRate);
                balance += growth + contribs;    
                totalContribs += contribs; 
                contribs = 0;        
              }
              break;
          }
          if (dailyPeriod || (i == 0 || i % 12 === 0)) {
            balances.push(balance);
            contributions.push(totalContribs);
          }
        }
      }

      this.futureBalance = FormatUtil.formatNumber(balance);

      if (balance < 0 || initialPrincipal < 0) {
        this.minY = balance < initialPrincipal ? balance : initialPrincipal;
      }
      else {
        this.minY = 0;
      }

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
    this.showTable = !this.showTable ;
    if (this.showTable) {
      for(let i=0; i < this.barChartData.labels!.length; i++) {
        this.tableDataRows.push(new TableDataRow(
          this.barChartData.labels![i] as string,
          FormatUtil.formatNumber(this.barChartData.datasets[0].data[i] as number),
          FormatUtil.formatNumber(this.barChartData.datasets[1].data[i] as number)
        ))
      }
    }
  }
}

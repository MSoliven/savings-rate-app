import { Component, Input } from '@angular/core';
import { AbstractControl, ControlValueAccessor, Validators, Validator, ValidationErrors, NG_VALIDATORS, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'choose-quantity',
  templateUrl:"./choose-quantity.component.html",
  styleUrls: ["./choose-quantity.component.scss"],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi:true,
      useExisting: ChooseQuantityComponent
    },
    {
      provide: NG_VALIDATORS,
      multi: true,
      useExisting: ChooseQuantityComponent
    }
  ]
})

export class ChooseQuantityComponent implements ControlValueAccessor, Validator {

  quantityStr: string = "$";

  @Input()
  increment: string = "1";

  @Input()
  decimals: string = "1";

  @Input()
  currency: string = "";

  changeInput(e: any) {
    if (this.currency) {
      this.quantityStr = this.currency + e.target.value; 
    }
    else {
      this.quantityStr = e.target.value; 
    }
  } 

  onChange = (quantityStr: string) => {
    this.quantityStr = quantityStr;
  };

  onTouched = () => {};

  touched = false;

  disabled = false;

  onAdd() {
    this.markAsTouched();
    if (!this.disabled) {
      var num = Number(this.quantityStr.replace(/[^0-9.-]+/g,""));
      num += Number(this.increment);
      this.quantityStr = this.formatNumber(num, Number(this.decimals));
      this.onChange(this.quantityStr);
    }
  }

  onRemove() {
    this.markAsTouched();
    if (!this.disabled) {
      var num = Number(this.quantityStr.replace(/[^0-9.-]+/g,""));
      num -= Number(this.increment);
      this.quantityStr = this.formatNumber(num, Number(this.decimals));
      this.onChange(this.quantityStr);
    }
  }

  writeValue(quantityStr: string) {
    this.quantityStr = quantityStr;
  }

  registerOnChange(onChange: any) {
    this.onChange = onChange;
  }

  registerOnTouched(onTouched: any) {
    this.onTouched = onTouched;
  }

  markAsTouched() {
    if (!this.touched) {
      this.onTouched();
      this.touched = true;
    }
  }

  setDisabledState(disabled: boolean) {
    this.disabled = disabled;
  }

  parseToNumber(quantityStr: string): number {
    var num = Number(quantityStr.replace(/[^0-9.-]+/g,""));
    return num;
  }

  formatNumber(num: number, dec: number): string {
    return this.currency + num.toLocaleString("en-US", {minimumFractionDigits: dec, maximumFractionDigits: dec});
  }

  validate(control: AbstractControl): ValidationErrors | null {
    const num = this.parseToNumber(control.value);
    if (num <= 0) {
      return {
        mustBePositive: {
          num
        }
      };
    }
    return null;
  }
}
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { AppUpdateService } from './services/update.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  blueForm: FormGroup = new FormGroup({
    clp: new FormControl(''),
    usd: new FormControl(''),
    ars: new FormControl(''),
  });
  title = 'Blue Chile';
  blueRate: string = '';
  clpRate: string = '';
  lastUpdate: Date = new Date();
  clpFormatter!: Intl.NumberFormat;
  arsFormatter!: Intl.NumberFormat;
  usdFormatter!: Intl.NumberFormat;

  constructor(protected updateService: AppUpdateService) {}

  async ngOnInit(): Promise<void> {
    this.setFormatters();
    await this.getRates();
  }

  async getRates() {
    try {
      const blueResponse = await (
        await fetch('https://api.bluelytics.com.ar/v2/latest')
      ).json();
      this.blueRate = blueResponse?.blue?.value_sell;
      localStorage.setItem('blueRate', this.blueRate.toString());

      const clpRespnse = await (
        await fetch('https://mindicador.cl/api/dolar')
      ).json();
      this.clpRate = clpRespnse?.serie[0]?.valor;
      localStorage.setItem('clpRate', this.clpRate);
      this.lastUpdate = new Date();
    } catch (error) {
      const saveBlueRate = localStorage.getItem('blueRate');
      if (saveBlueRate) {
        this.blueRate = saveBlueRate;
      }
      const savedClpRate = localStorage.getItem('clpRate');
      if (savedClpRate) {
        this.clpRate = savedClpRate;
      }
    }
  }

  convert(e: any) {
    let targetId = '';
    if (!e) {
      if (
        this.blueForm.get('clp')?.value &&
        this.blueForm.get('clp')?.value > 0
      ) {
        targetId = 'clp';
      } else if (
        this.blueForm.get('usd')?.value &&
        this.blueForm.get('usd')?.value > 0
      ) {
        targetId = 'usd';
      } else if (
        this.blueForm.get('ars')?.value &&
        this.blueForm.get('ars')?.value > 0
      ) {
        targetId = 'ars';
      }
    } else {
      targetId = e.target.id;
    }
    if (e && !e.target.value.endsWith(',')) {
      switch (targetId) {
        case 'clp':
          let clpValue = this.blueForm.get('clp')?.value;
          clpValue = clpValue.replace(/\./g, '');
          clpValue = clpValue.replace(',', '.');
          if (clpValue.indexOf('CLP') > -1) {
            clpValue = clpValue.substring(4);
          }
          this.blueForm.patchValue({
            usd: this.usdFormatter.format(clpValue / +this.clpRate),
            ars: this.arsFormatter.format(
              (clpValue / +this.clpRate) *
              +this.blueRate
            ),
            clp: this.clpFormatter.format(clpValue.replace(',', '.')),
          });
          break;
        case 'usd':
          let usdValue = this.blueForm.get('usd')?.value;
          usdValue = usdValue.replace(/\./g, '');
          usdValue = usdValue.replace(',', '.');
          if (usdValue.indexOf('US$') > -1) {
            usdValue = usdValue.substring(4);
          }
          this.blueForm.patchValue({
            clp: this.clpFormatter.format(usdValue * +this.clpRate),
            ars: this.arsFormatter.format(usdValue * +this.blueRate),
            usd: this.usdFormatter.format(usdValue.replace(',', '.')),
          });
          break;
        case 'ars':
          let arsValue = this.blueForm.get('ars')?.value;
          arsValue = arsValue.replace(/\./g, '');
          arsValue = arsValue.replace(',', '.');
          if (arsValue.indexOf('$') > -1) {
            arsValue = arsValue.substring(2);
          }
          this.blueForm.patchValue({
            clp: this.clpFormatter.format(
              (arsValue / +this.blueRate) *
              +this.clpRate
            ),
            usd: this.usdFormatter.format(arsValue / +this.blueRate),
            ars: this.arsFormatter.format(arsValue.replace(',', '.')),
          });
          break;
        default:
          this.blueForm.reset();
          break;
      }
    }
  }

  restrictChars(e: any) {
    const charCode = (e.which) ? e.which : e.keyCode;
    if (charCode == 46 || charCode === 188 || charCode === 190) {
      if (e.target.value.indexOf('.') === -1) {
        return true;
      } else {
        return false;
      }
    } else {
      if (charCode > 31 &&
        (charCode < 48 || charCode > 57) &&
        charCode !== 96 && charCode !== 97 && charCode !== 98 &&
        charCode !== 99 && charCode !== 100 && charCode !== 101 &&
        charCode !== 102 && charCode !== 103 && charCode !== 104 &&
        charCode !== 105)
        return false;
    }
    return true;
  }

  setFormatters() {
    this.clpFormatter = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'CLP', maximumSignificantDigits: 10});
    this.arsFormatter = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumSignificantDigits: 10});
    this.usdFormatter = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'USD', maximumSignificantDigits: 10});
  }
}

import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

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
  
  async ngOnInit(): Promise<void> {
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
      if (this.blueForm.get('clp')?.value && this.blueForm.get('clp')?.value > 0) {
        targetId = 'clp';
      } else if (this.blueForm.get('usd')?.value && this.blueForm.get('usd')?.value > 0) {
        targetId = 'usd';
      } else if (this.blueForm.get('ars')?.value && this.blueForm.get('ars')?.value > 0) {
        targetId = 'ars';
      }
    }
    else {
      targetId = e.target.id;
    }
    switch(targetId) {
      case 'clp':
        this.blueForm.patchValue({ 
          usd: (this.blueForm.get('clp')?.value / +this.clpRate).toFixed(2),
          ars: ((this.blueForm.get('clp')?.value / +this.clpRate) * +this.blueRate).toFixed(2),
        });
        break;
      case 'usd':
        this.blueForm.patchValue({ 
          clp: (this.blueForm.get('usd')?.value * +this.clpRate).toFixed(2),
          ars: (this.blueForm.get('usd')?.value * +this.blueRate).toFixed(2),
        });
        break;
      case 'ars':
        this.blueForm.patchValue({ 
          clp: ((this.blueForm.get('ars')?.value / +this.blueRate) * +this.clpRate).toFixed(2),
          usd: (this.blueForm.get('ars')?.value / +this.blueRate).toFixed(2),
        });
        break;
      default:
        this.blueForm.reset();
        break;
    }
  }
}

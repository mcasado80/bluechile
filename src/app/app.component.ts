import { Component, OnInit, ViewChild } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  @ViewChild('clp')
  clp!: HTMLInputElement;
  @ViewChild('usd')
  usd!: HTMLInputElement;
  @ViewChild('ars')
  ars!: HTMLInputElement;
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
    this.usd.innerHTML = (+e.target.value * +this.clpRate).toString();
  }
}

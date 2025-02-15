import {
  Component, ChangeDetectionStrategy, input,
  computed,
  signal,
  effect,
} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ChartData } from 'chart.js';
import { LoadingState } from 'app/helpers/operators/to-loading-state.helper';
import { ChartReleaseStats } from 'app/interfaces/app.interface';
import { ThemeService } from 'app/services/theme/theme.service';

@Component({
  selector: 'ix-app-network-info',
  templateUrl: './app-network-info.component.html',
  styleUrls: ['./app-network-info.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppNetworkInfoComponent {
  stats = input.required<LoadingState<ChartReleaseStats>>();

  protected readonly initialNetworkStats = Array.from({ length: 60 }, () => ([0, 0]));
  cachedNetworkStats = signal<number[][]>([]);

  networkStats = computed(() => {
    const cachedStats = this.cachedNetworkStats();
    return [...this.initialNetworkStats, ...cachedStats].slice(-60);
  });

  protected networkChartData = computed<ChartData<'line'>>(() => {
    const currentTheme = this.theme.currentTheme();
    const data = this.networkStats();
    const labels: number[] = data.map((_, index) => (0 + index) * 1000);

    return {
      datasets: [
        {
          label: this.translate.instant('In'),
          data: data.map((item, index) => ({ x: labels[index], y: item[0] })),
          borderColor: currentTheme.blue,
          backgroundColor: currentTheme.blue,
          pointBackgroundColor: currentTheme.blue,
          pointRadius: 0,
          tension: 0.2,
          fill: true,
        },
        {
          label: this.translate.instant('Out'),
          data: data.map((item, index) => ({ x: labels[index], y: -item[1] })),
          borderColor: currentTheme.orange,
          backgroundColor: currentTheme.orange,
          pointBackgroundColor: currentTheme.orange,
          pointRadius: 0,
          tension: 0.2,
          fill: true,
        },
      ],
    };
  });

  constructor(
    private theme: ThemeService,
    private translate: TranslateService,
  ) {
    effect(() => {
      const networkStats = this.stats()?.value?.network;
      if (networkStats) {
        this.cachedNetworkStats.update((cachedStats) => {
          return [...cachedStats, Object.values(networkStats)].slice(-60);
        });
      }
    }, { allowSignalWrites: true });
  }
}

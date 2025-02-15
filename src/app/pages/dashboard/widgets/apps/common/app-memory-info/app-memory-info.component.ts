import {
  Component, ChangeDetectionStrategy, input, computed,
} from '@angular/core';
import { normalizeFileSize } from 'app/helpers/file-size.utils';
import { LoadingState } from 'app/helpers/operators/to-loading-state.helper';
import { ChartReleaseStats } from 'app/interfaces/app.interface';
import { mapLoadedValue } from 'app/modules/loader/directives/with-loading-state/map-loaded-value.utils';

@Component({
  selector: 'ix-app-memory-info',
  templateUrl: './app-memory-info.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppMemoryInfoComponent {
  stats = input.required<LoadingState<ChartReleaseStats>>();

  protected memory = computed(() => {
    return mapLoadedValue(this.stats(), (value) => normalizeFileSize(value.memory));
  });
}

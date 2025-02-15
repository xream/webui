import {
  ChangeDetectionStrategy, Component, computed, input,
} from '@angular/core';
import { DatasetType } from 'app/enums/dataset.enum';
import { DatasetDetails } from 'app/interfaces/dataset.interface';
import { isRootDataset } from 'app/pages/datasets/utils/dataset.utils';

@Component({
  selector: 'ix-dataset-icon',
  templateUrl: './dataset-icon.component.html',
  styleUrls: ['./dataset-icon.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DatasetIconComponent {
  readonly dataset = input.required<DatasetDetails>();

  protected isRoot = computed(() => isRootDataset(this.dataset()));

  protected isZvol = computed(() => this.dataset().type === DatasetType.Volume);

  protected iconName = computed(() => {
    if (this.isRoot()) {
      return 'ix:dataset_root';
    }
    if (this.isZvol()) {
      return 'mdi-database';
    }

    return 'ix:dataset';
  });
}

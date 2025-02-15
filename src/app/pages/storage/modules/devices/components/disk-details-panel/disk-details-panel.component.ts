import {
  ChangeDetectionStrategy,
  Component,
  Input, output,
} from '@angular/core';
import { VdevType } from 'app/enums/v-dev-type.enum';
import { Disk } from 'app/interfaces/disk.interface';
import { isTopologyDisk, TopologyItem } from 'app/interfaces/storage.interface';

@Component({
  selector: 'ix-disk-details-panel',
  templateUrl: './disk-details-panel.component.html',
  styleUrls: ['./disk-details-panel.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DiskDetailsPanelComponent {
  @Input() topologyItem: TopologyItem;
  @Input() topologyParentItem: TopologyItem;
  @Input() disk: Disk;
  @Input() poolId: number;
  @Input() topologyCategory: VdevType;
  @Input() hasTopLevelRaidz: boolean;
  @Input() disksWithSmartTestSupport: string[];

  readonly closeMobileDetails = output();

  get title(): string {
    if (isTopologyDisk(this.topologyItem)) {
      return this.topologyItem.disk || this.topologyItem.guid;
    }

    return this.topologyItem.type;
  }

  get isTopologyDisk(): boolean {
    return isTopologyDisk(this.topologyItem);
  }

  get hasTopologyItemDisk(): boolean {
    if (isTopologyDisk(this.topologyItem)) {
      return this.topologyItem.disk !== null;
    }

    return false;
  }

  get hasSmartTestSupport(): boolean {
    return this.disksWithSmartTestSupport.includes(this.disk.devname);
  }

  onCloseMobileDetails(): void {
    this.closeMobileDetails.emit();
  }
}

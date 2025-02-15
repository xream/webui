import {
  ChangeDetectionStrategy, Component, input,
} from '@angular/core';
import { LicenseInfoInSupport } from 'app/pages/system/general-settings/support/license-info-in-support.interface';
import { SystemInfoInSupport } from 'app/pages/system/general-settings/support/system-info-in-support.interface';

@Component({
  selector: 'ix-sys-info',
  templateUrl: './sys-info.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SysInfoComponent {
  readonly hasLicense = input<boolean>();
  readonly licenseInfo = input<LicenseInfoInSupport>();
  readonly systemInfo = input<SystemInfoInSupport>();
}

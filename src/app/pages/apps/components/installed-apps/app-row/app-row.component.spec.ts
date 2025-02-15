import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { createComponentFactory, Spectator } from '@ngneat/spectator/jest';
import { MockComponents } from 'ng-mocks';
import { ImgFallbackModule } from 'ngx-img-fallback';
import { mockAuth } from 'app/core/testing/utils/mock-auth.utils';
import { CatalogAppState } from 'app/enums/catalog-app-state.enum';
import { App } from 'app/interfaces/app.interface';
import { IxIconHarness } from 'app/modules/ix-icon/ix-icon.harness';
import { FileSizePipe } from 'app/modules/pipes/file-size/file-size.pipe';
import { NetworkSpeedPipe } from 'app/modules/pipes/network-speed/network-speed.pipe';
import { AppRowComponent } from 'app/pages/apps/components/installed-apps/app-row/app-row.component';
import { AppStatusCellComponent } from 'app/pages/apps/components/installed-apps/app-status-cell/app-status-cell.component';
import { AppUpdateCellComponent } from 'app/pages/apps/components/installed-apps/app-update-cell/app-update-cell.component';
import { AppStatus } from 'app/pages/apps/enum/app-status.enum';

describe('AppRowComponent', () => {
  let spectator: Spectator<AppRowComponent>;
  let loader: HarnessLoader;
  const app = {
    name: 'app_name',
    state: CatalogAppState.Running,
    metadata: { icon: 'https://image/' },
  } as App;

  const status = AppStatus.Running;

  const createComponent = createComponentFactory({
    component: AppRowComponent,
    imports: [
      ImgFallbackModule,
      FileSizePipe,
      NetworkSpeedPipe,
    ],
    declarations: [
      MockComponents(AppStatusCellComponent, AppUpdateCellComponent),
    ],
    providers: [
      mockAuth(),
    ],
  });

  beforeEach(() => {
    spectator = createComponent({
      props: {
        app,
        status,
        selected: false,
      },
    });

    loader = TestbedHarnessEnvironment.loader(spectator.fixture);
  });

  it('shows app name, logo and catalog', () => {
    expect(spectator.query('.app-logo img')).toHaveAttribute('src', 'https://image/');
    expect(spectator.query('.app-name')).toHaveText('app_name');
  });

  it('shows app status', () => {
    const statusCell = spectator.query(AppStatusCellComponent);
    expect(statusCell).toBeTruthy();
  });

  it('shows app updates', () => {
    const updateCell = spectator.query(AppUpdateCellComponent);
    expect(updateCell).toBeTruthy();
    expect(updateCell.hasUpdate).toBeFalsy();
  });

  // TODO: https://ixsystems.atlassian.net/browse/NAS-130471
  it.skip('shows app usages statistics', () => {
    expect(spectator.query('.cell-cpu')).toHaveText('50%');
    expect(spectator.query('.cell-ram')).toHaveText('19.07 MiB');
    expect(spectator.query('.cell-network')).toHaveText('50 Mb/s - 55.5 Mb/s');
  });

  describe('actions', () => {
    it('shows Stop button when app status is not Stopped', async () => {
      spectator.setInput('status', AppStatus.Running);

      const stopIcon = await loader.getHarness(IxIconHarness.with({ name: 'mdi-stop' }));
      const startIcon = await loader.getHarnessOrNull(IxIconHarness.with({ name: 'mdi-play' }));

      expect(stopIcon).toExist();
      expect(startIcon).not.toExist();
    });

    it('shows Start button when app status is Stopped', async () => {
      spectator.setInput('status', AppStatus.Stopped);

      const stopIcon = await loader.getHarnessOrNull(IxIconHarness.with({ name: 'mdi-stop' }));
      const startIcon = await loader.getHarness(IxIconHarness.with({ name: 'mdi-play' }));

      expect(stopIcon).not.toExist();
      expect(startIcon).toExist();
    });
  });
});

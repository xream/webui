import {
  Component, ChangeDetectionStrategy,
} from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { untilDestroyed, UntilDestroy } from '@ngneat/until-destroy';
import { Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { ApiJobMethod, ApiJobResponse } from 'app/interfaces/api/api-job-directory.interface';
import { Job } from 'app/interfaces/job.interface';
import { DialogService } from 'app/modules/dialog/dialog.service';
import { abortJobPressed, jobPanelClosed } from 'app/modules/jobs/store/job.actions';
import {
  JobSlice,
  selectJobState,
  selectRunningJobsCount,
  selectWaitingJobsCount,
  selectFailedJobsCount,
  selectJobsPanelSlice,
  selectJob,
} from 'app/modules/jobs/store/job.selectors';
import { ErrorHandlerService } from 'app/services/error-handler.service';

@UntilDestroy()
@Component({
  selector: 'ix-jobs-panel',
  templateUrl: './jobs-panel.component.html',
  styleUrls: ['./jobs-panel.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JobsPanelComponent {
  isLoading$ = this.store$.select(selectJobState).pipe(map((state) => state.isLoading));
  error$ = this.store$.select(selectJobState).pipe(map((state) => state.error));
  runningJobsCount$ = this.store$.select(selectRunningJobsCount);
  waitingJobsCount$ = this.store$.select(selectWaitingJobsCount);
  failedJobsCount$ = this.store$.select(selectFailedJobsCount);
  availableJobs$ = this.store$.select(selectJobsPanelSlice);

  constructor(
    private router: Router,
    private store$: Store<JobSlice>,
    private dialogRef: MatDialogRef<JobsPanelComponent>,
    private translate: TranslateService,
    private dialog: DialogService,
    private errorHandler: ErrorHandlerService,
  ) {}

  onAbort(job: Job): void {
    this.dialog
      .confirm({
        title: this.translate.instant('Abort'),
        message: this.translate.instant('Are you sure you want to abort the <b>{task}</b> task?', { task: job.method }),
        hideCheckbox: true,
        buttonText: this.translate.instant('Abort'),
        cancelText: this.translate.instant('Cancel'),
        disableClose: true,
      })
      .pipe(filter(Boolean), untilDestroyed(this))
      .subscribe(() => {
        this.store$.dispatch(abortJobPressed({ job }));
      });
  }

  openJobDialog(job: Job): void {
    this.dialogRef.close();
    if (job.error) {
      this.errorHandler.showErrorModal(job);
      return;
    }

    const title = job.description ? job.description : job.method;

    this.dialog.jobDialog(
      this.store$.select(selectJob(job.id)) as Observable<Job<ApiJobResponse<ApiJobMethod>>>,
      {
        title,
        canMinimize: true,
      },
    )
      .afterClosed()
      .pipe(
        this.errorHandler.catchError(),
        untilDestroyed(this),
      )
      .subscribe();
  }

  goToJobs(): void {
    this.dialogRef.close();
    this.store$.dispatch(jobPanelClosed());
    this.router.navigate(['/jobs']);
  }
}

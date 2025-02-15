import { Injectable } from '@angular/core';
import { ComponentStore } from '@ngrx/component-store';
import { tapResponse } from '@ngrx/operators';
import _ from 'lodash';
import {
  combineLatest, filter, switchMap, tap,
} from 'rxjs';
import { map } from 'rxjs/operators';
import { Pool, PoolTopology } from 'app/interfaces/pool.interface';
import { DialogService } from 'app/modules/dialog/dialog.service';
import { DiskStore } from 'app/pages/storage/modules/pool-manager/store/disk.store';
import { ErrorHandlerService } from 'app/services/error-handler.service';
import { WebSocketService } from 'app/services/ws.service';

export interface AddVdevsState {
  pool: Pool;
  topology: PoolTopology;
  isLoading: boolean;
}

const initialState: AddVdevsState = {
  pool: null,
  topology: null,
  isLoading: false,
};

@Injectable()
export class AddVdevsStore extends ComponentStore<AddVdevsState> {
  readonly isLoading$ = this.select((state) => state.isLoading);
  readonly pool$ = this.select((state) => state.pool);
  readonly poolDisks$ = combineLatest([
    this.pool$.pipe(filter(Boolean)),
    this.diskStore.usedDisks$,
  ]).pipe(
    map(([pool, usedDisks]) => {
      return usedDisks.filter((disk) => disk.imported_zpool === pool.name);
    }),
  );

  constructor(
    private diskStore: DiskStore,
    private ws: WebSocketService,
    private dialogService: DialogService,
    private errorHandler: ErrorHandlerService,
  ) {
    super(initialState);
  }

  resetStoreToInitialState(): void {
    this.setState({ ...initialState });
  }

  initialize = this.effect((trigger$) => {
    return trigger$.pipe(
      tap(() => this.setState(() => ({ ...initialState }))),
    );
  });

  loadPoolData = this.effect<number>((triggers$) => {
    return triggers$.pipe(
      tap(() => this.patchState({ isLoading: true })),
      switchMap((poolId) => {
        return this.ws.call('pool.query', [[['id', '=', +poolId]]]);
      }),
      tapResponse(
        (pools) => {
          this.patchState({
            pool: _.cloneDeep(pools[0]),
            isLoading: false,
          });
        },
        (error: unknown) => {
          this.patchState({
            isLoading: false,
          });
          this.dialogService.error(this.errorHandler.parseError(error));
        },
      ),
      filter((pools) => !!pools),
    );
  });
}

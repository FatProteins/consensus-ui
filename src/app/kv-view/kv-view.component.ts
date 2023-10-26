import {Component, EventEmitter, inject, Input, numberAttribute, OnDestroy, OnInit, Output} from '@angular/core';
import {MatCardModule} from "@angular/material/card";
import {MatButtonModule} from "@angular/material/button";
import {MatTableModule} from "@angular/material/table";
import {MatInputModule} from "@angular/material/input";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatRadioModule} from "@angular/material/radio";
import {MatSelectModule} from "@angular/material/select";
import {KeyValueService} from "../service/keyvalue.service";
import {finalize, Subscription} from "rxjs";
import {MatSnackBar, MatSnackBarModule} from "@angular/material/snack-bar";
import {webSocket, WebSocketSubject} from "rxjs/webSocket";
import {KeyValueGet, KeyValuePair} from "../model/keyvalue";
import {MatIconModule} from "@angular/material/icon";
import {MatProgressSpinnerModule} from "@angular/material/progress-spinner";
import {NgIf} from "@angular/common";

@Component({
  selector: 'kv-view',
  templateUrl: './kv-view.component.html',
  styleUrls: ['./kv-view.component.css'],
  standalone: true,
  imports: [
    MatCardModule,
    MatButtonModule,
    MatTableModule,
    MatInputModule,
    MatFormFieldModule,
    FormsModule,
    MatRadioModule,
    MatSelectModule,
    ReactiveFormsModule,
    MatSnackBarModule,
    MatIconModule,
    MatProgressSpinnerModule,
    NgIf,
  ]
})
export class KvViewComponent implements OnInit, OnDestroy {
  @Input({transform: numberAttribute})
  nodeIndex = 1;

  @Output()
  clientWatchEvents = new EventEmitter<string[]>();

  isDeleteLoading = false;

  displayedColumns: string[] = ['key', 'value', 'deleteButton'];
  dataSource: KeyValuePair[] = [];

  keyValueService = inject(KeyValueService);
  snackBar = inject(MatSnackBar);
  wsSubject: WebSocketSubject<KeyValueGet>;
  wsSubscription: Subscription;

  ngOnInit() {
    this.subscribeKV();
  }

  ngOnDestroy() {
    this.wsSubject.complete();
    this.wsSubject.unsubscribe();
    this.wsSubscription.unsubscribe();
  }

  subscribeKV() {
    this.wsSubject = webSocket<KeyValueGet>('ws://localhost:8080/education/get-kv');
    this.wsSubscription = this.wsSubject.subscribe({
      next: msg => {
        this.dataSource = msg.pairs;
        if (!!msg.changeLog) {
          this.clientWatchEvents.emit(msg.changeLog);
        }
      },
      error: err => {
        this.snackBar.open('An error occurred in KV Store connection.', 'OK', {
          panelClass: ['mat-toolbar', 'mat-warn'],
          duration: 5000,
        });
        console.error(err);
      },
      complete: () => {
        this.snackBar.open('KV Store connection was closed.', 'OK', {
          panelClass: ['mat-toolbar', 'mat-primary'],
          duration: 5000,
        });
      }
    });
  }

  deleteKV(key: string) {
    this.isDeleteLoading = true;
    this.keyValueService.deleteKeyValue(this.nodeIndex, key)
      .pipe(finalize(() => {
        this.isDeleteLoading = false;
      }))
      .subscribe({
        next: () => {
          this.snackBar.open(`Successful DELETE: ${key}.`, 'OK', {
            panelClass: ['mat-toolbar', 'mat-warn'],
            duration: 5000,
          });
        },
        error: err => {
          this.snackBar.open(`Failed DELETE.`, 'OK', {
            panelClass: ['mat-toolbar', 'mat-warn'],
            duration: 5000,
          });
          console.error(err);
        }
      });
  }
}

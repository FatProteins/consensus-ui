import {AfterViewInit, Component, inject, Input, numberAttribute, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {MatCardModule} from "@angular/material/card";
import {MatButtonModule} from "@angular/material/button";
import {MatTableDataSource, MatTableModule} from "@angular/material/table";
import {MatInputModule} from "@angular/material/input";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatRadioModule} from "@angular/material/radio";
import {MatSelectModule} from "@angular/material/select";
import {KeyValueService} from "../service/keyvalue.service";
import {finalize, Subscription} from "rxjs";
import {MatSnackBar, MatSnackBarModule} from "@angular/material/snack-bar";
import {KeyValueGet, KeyValuePair} from "../model/keyvalue";
import {MatIconModule} from "@angular/material/icon";
import {MatProgressSpinnerModule} from "@angular/material/progress-spinner";
import {NgIf} from "@angular/common";
import {MatPaginator, MatPaginatorModule} from "@angular/material/paginator";

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
    MatPaginatorModule,
  ]
})
export class KvViewComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input({transform: numberAttribute})
  nodeIndex = 1;

  isDeleteLoading = false;

  displayedColumns: string[] = ['key', 'value', 'deleteButton'];
  dataSource = new MatTableDataSource<KeyValuePair>();

  @ViewChild(MatPaginator)
  paginator: MatPaginator;

  keyValueService = inject(KeyValueService);
  snackBar = inject(MatSnackBar);

  keyValueSubscription: Subscription;

  ngOnInit() {
    this.keyValueSubscription = this.keyValueService.keyValueSubject.subscribe((msg) => this.handleGetKv(msg));
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  ngOnDestroy() {
    this.keyValueSubscription.unsubscribe();
  }

  handleGetKv(msg: KeyValueGet) {
    this.dataSource.data = msg.pairs;
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

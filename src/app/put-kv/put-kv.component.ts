import {Component, inject, Input, numberAttribute} from '@angular/core';
import {MatCardModule} from "@angular/material/card";
import {MatButtonModule} from "@angular/material/button";
import {MatTableModule} from "@angular/material/table";
import {MatInputModule} from "@angular/material/input";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatRadioModule} from "@angular/material/radio";
import {MatSelectModule} from "@angular/material/select";
import {KeyValueService} from "../service/keyvalue.service";
import {finalize} from "rxjs";
import {MatSnackBar, MatSnackBarModule} from "@angular/material/snack-bar";
import {MatIconModule} from "@angular/material/icon";
import {MatProgressSpinnerModule} from "@angular/material/progress-spinner";
import {NgIf} from "@angular/common";

@Component({
  selector: 'put-kv',
  templateUrl: './put-kv.component.html',
  styleUrls: ['./put-kv.component.css'],
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
export class PutKvComponent {
  @Input({transform: numberAttribute})
  nodeIndex: number;

  isPutLoading = false;

  keyValueService = inject(KeyValueService);
  snackBar = inject(MatSnackBar);

  putKV(key: string, value: string) {
    if (!this.nodeIndex) {
      this.snackBar.open('Please select Node to send PUT to.', 'OK', {
        panelClass: ['mat-toolbar', 'mat-primary'],
        duration: 5000,
      });
      return;
    }

    this.isPutLoading = true;
    this.keyValueService.putKeyValue(this.nodeIndex, key, value)
      .pipe(finalize(() => {
        this.isPutLoading = false;
      }))
      .subscribe({
        next: () => {
          this.snackBar.open(`Successful PUT: \<${key}, ${value}\>.`, 'OK', {
            panelClass: ['mat-toolbar', 'mat-warn'],
            duration: 5000,
          });
        },
        error: err => {
          this.snackBar.open(`Failed PUT.`, 'OK', {
            panelClass: ['mat-toolbar', 'mat-warn'],
            duration: 5000,
          });
          console.error(err);
        }
      });
  }
}

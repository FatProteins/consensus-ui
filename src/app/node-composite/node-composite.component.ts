import {Component, inject} from '@angular/core';
import {NodeViewComponent} from "../node-view/node-view.component";
import {KvViewComponent} from "../kv-view/kv-view.component";
import {MatButtonModule} from "@angular/material/button";
import {MatIconModule} from "@angular/material/icon";
import {NgIf} from "@angular/common";
import {finalize} from "rxjs";
import {NodeService} from "../service/node.service";
import {MatSnackBar, MatSnackBarModule} from "@angular/material/snack-bar";
import {FontAwesomeModule} from "@fortawesome/angular-fontawesome";
import {faPlay} from "@fortawesome/free-solid-svg-icons";

@Component({
  selector: 'node-composite',
  templateUrl: './node-composite.component.html',
  styleUrls: ['./node-composite.component.css'],
  standalone: true,
  imports: [
    NodeViewComponent,
    KvViewComponent,
    MatButtonModule,
    MatIconModule,
    NgIf,
    MatSnackBarModule,
    FontAwesomeModule
  ]
})
export class NodeCompositeComponent {
  isStepByStep = false;
  isLoading = false;

  nodeService = inject(NodeService);
  snackBar = inject(MatSnackBar);

  toggleStepByStep() {
    this.isLoading = true;
    const newMode = !this.isStepByStep;
    for (let nodeIndex = 1; nodeIndex < 4; nodeIndex++) {
      this.nodeService.toggleStepByStep(nodeIndex, newMode)
        .pipe(finalize(() => {
          this.isLoading = false;
        }))
        .subscribe({
          next: () => {
            this.snackBar.open(`Successfully set Step-By-Step to ${newMode}.`, 'OK', {
              panelClass: ['mat-toolbar', 'mat-warn'],
              duration: 5000,
            });
            this.isStepByStep = newMode;
          },
          error: err => {
            this.snackBar.open(`Failed to set Step-By-Step to ${newMode}`, 'OK', {
              panelClass: ['mat-toolbar', 'mat-warn'],
              duration: 5000,
            });
            console.error(err);
          }
        });
    }
  }

  doNextStep() {
    if (!this.isStepByStep) {
      this.snackBar.open('Step-By-Step is not enabled.', 'OK', {
        panelClass: ['mat-toolbar', 'mat-warn'],
        duration: 5000,
      })
    }
    this.isLoading = true;
    for (let nodeIndex = 1; nodeIndex < 4; nodeIndex++) {
      this.nodeService.doNextStep(nodeIndex)
        .pipe(finalize(() => {
          this.isLoading = false;
        }))
        .subscribe({
          next: () => {
          },
          error: err => {
            this.snackBar.open(`Failed to do next step on Node ${nodeIndex}.`, 'OK', {
              panelClass: ['mat-toolbar', 'mat-warn'],
              duration: 5000,
            });
            console.error(err);
          }
        });
    }
  }

  protected readonly faPlay = faPlay;
}

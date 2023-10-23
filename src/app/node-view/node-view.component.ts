import {Component, inject, Input, numberAttribute} from '@angular/core';
import {MatCardModule} from "@angular/material/card";
import {MatButtonModule} from "@angular/material/button";
import {NodeService} from "../service/node.service";
import {MatSnackBar, MatSnackBarModule} from "@angular/material/snack-bar";
import {ActionType} from "../model/node";
import {CommonModule, NgIf} from "@angular/common";
import {finalize} from "rxjs";

@Component({
  selector: 'node-view',
  templateUrl: './node-view.component.html',
  styleUrls: ['./node-view.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatSnackBarModule,
    NgIf
  ]
})
export class NodeViewComponent {
  @Input({transform: numberAttribute})
  nodeIndex: number;

  isStopped = false;
  isPaused = false;

  isLoading = false;

  nodeService = inject(NodeService);
  snackBar = inject(MatSnackBar);

  stopNode() {
    this.isLoading = true;
    this.nodeService.executeAction(this.nodeIndex, ActionType.STOP)
      .pipe(finalize(() => {
        this.isLoading = false;
      }))
      .subscribe({
        next: () => {
          this.snackBar.open(`Successfully stopped Node ${this.nodeIndex}.`, 'OK', {
            panelClass: ['mat-toolbar', 'mat-warn']
          });
          this.isStopped = true;
        },
        error: err => {
          this.snackBar.open(`Failed to stop Node ${this.nodeIndex}`, 'OK', {
            panelClass: ['mat-toolbar', 'mat-warn']
          });
          console.error(err);
        }
      });
  }

  restartNode() {
    this.isLoading = true;
    this.nodeService.executeAction(this.nodeIndex, ActionType.RESTART)
      .pipe(finalize(() => {
        this.isLoading = false;
      }))
      .subscribe({
        next: () => {
          this.snackBar.open(`Successfully restarted Node ${this.nodeIndex}.`, 'OK', {
            panelClass: ['mat-toolbar', 'mat-warn']
          });
          this.isStopped = false;
        },
        error: err => {
          this.snackBar.open(`Failed to restart Node ${this.nodeIndex}`, 'OK', {
            panelClass: ['mat-toolbar', 'mat-warn']
          });
          console.error(err);
        }
      });
  }

  pauseNode() {
    this.isLoading = true;
    this.nodeService.executeAction(this.nodeIndex, ActionType.PAUSE)
      .pipe(finalize(() => {
        this.isLoading = false;
      }))
      .subscribe({
        next: () => {
          this.snackBar.open(`Successfully paused Node ${this.nodeIndex}.`, 'OK', {
            panelClass: ['mat-toolbar', 'mat-warn']
          });
          this.isPaused = true;
        },
        error: err => {
          this.snackBar.open(`Failed to pause Node ${this.nodeIndex}`, 'OK', {
            panelClass: ['mat-toolbar', 'mat-warn']
          });
          console.error(err);
        }
      });
  }

  unpauseNode() {
    this.isLoading = true;
    this.nodeService.executeAction(this.nodeIndex, ActionType.CONTINUE)
      .pipe(finalize(() => {
        this.isLoading = false;
      }))
      .subscribe({
        next: () => {
          this.snackBar.open(`Successfully unpaused Node ${this.nodeIndex}.`, 'OK', {
            panelClass: ['mat-toolbar', 'mat-warn']
          });
          this.isPaused = false;
        },
        error: err => {
          this.snackBar.open(`Failed to unpause Node ${this.nodeIndex}`, 'OK', {
            panelClass: ['mat-toolbar', 'mat-warn']
          });
          console.error(err);
        }
      });
  }
}

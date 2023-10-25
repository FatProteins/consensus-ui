import {Component, inject, Input, numberAttribute, OnDestroy, OnInit} from '@angular/core';
import {MatCardModule} from "@angular/material/card";
import {MatButtonModule} from "@angular/material/button";
import {NodeService} from "../service/node.service";
import {MatSnackBar, MatSnackBarModule} from "@angular/material/snack-bar";
import {ActionType} from "../model/node";
import {CommonModule, NgIf} from "@angular/common";
import {finalize, Subscription} from "rxjs";
import {CdkVirtualForOf, CdkVirtualScrollViewport, ScrollingModule} from "@angular/cdk/scrolling";
import {ScrollingModule as ExperimentalScrollingModule} from '@angular/cdk-experimental/scrolling'
import {webSocket, WebSocketSubject} from "rxjs/webSocket";
import {MatSlideToggleModule} from "@angular/material/slide-toggle";
import {FormsModule} from "@angular/forms";
import {MatIconModule} from "@angular/material/icon";

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
    NgIf,
    CdkVirtualScrollViewport,
    CdkVirtualForOf,
    ScrollingModule,
    ExperimentalScrollingModule,
    MatSlideToggleModule,
    FormsModule,
    MatIconModule
  ]
})
export class NodeViewComponent implements OnInit, OnDestroy {
  @Input({transform: numberAttribute})
  nodeIndex: number;

  logText: string = "Log Start";
  lockLogToBottom = true;
  showHeartbeatMessages = false;

  isStopped = false;
  isPaused = false;

  isLoading = false;

  nodeService = inject(NodeService);
  snackBar = inject(MatSnackBar);

  wsSubject: WebSocketSubject<any>;
  wsSubscription: Subscription;

  ngOnInit() {
    this.subscribeToLog();
  }

  ngOnDestroy() {
    this.wsSubject.complete();
    this.wsSubject.unsubscribe();
    this.wsSubscription.unsubscribe();
  }

  subscribeToLog() {
    const nodePort = 8080 + this.nodeIndex - 1;
    this.wsSubject = webSocket<string>({
      url: `ws://localhost:${nodePort}/education/subscribe-log`,
      deserializer: e => e.data
    });
    this.wsSubscription = this.wsSubject.subscribe({
      next: (msg: string) => {
        if (!msg || !this.showHeartbeatMessages && msg.includes('MsgHeartbeat')) {
          return;
        }

        if (this.logText.length > 10 ** 6) {
          this.logText = this.logText.substring(10 ** 5);
          const newStartIdx = this.logText.indexOf('\n', 10 ** 5);
          this.logText.substring(newStartIdx);
        }

        this.logText += '\n' + msg;
      },
      error: err => {
        this.snackBar.open(`An error occurred in log connection.`, 'OK', {
          panelClass: ['mat-toolbar', 'mat-warn'],
          duration: 5000,
        });
        console.error(err);
      },
      complete: () => {
        this.snackBar.open('Log connection was closed.', 'OK', {
          panelClass: ['mat-toolbar', 'mat-primary'],
          duration: 5000,
        });
      }
    });
  }

  stopNode() {
    this.isLoading = true;
    this.nodeService.executeAction(this.nodeIndex, ActionType.STOP)
      .pipe(finalize(() => {
        this.isLoading = false;
      }))
      .subscribe({
        next: () => {
          this.snackBar.open(`Successfully stopped Node ${this.nodeIndex}.`, 'OK', {
            panelClass: ['mat-toolbar', 'mat-warn'],
            duration: 5000,
          });
          this.isStopped = true;
        },
        error: err => {
          this.snackBar.open(`Failed to stop Node ${this.nodeIndex}`, 'OK', {
            panelClass: ['mat-toolbar', 'mat-warn'],
            duration: 5000,
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
            panelClass: ['mat-toolbar', 'mat-warn'],
            duration: 5000,
          });
          this.isStopped = false;
        },
        error: err => {
          this.snackBar.open(`Failed to restart Node ${this.nodeIndex}`, 'OK', {
            panelClass: ['mat-toolbar', 'mat-warn'],
            duration: 5000,
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
            panelClass: ['mat-toolbar', 'mat-warn'],
            duration: 5000,
          });
          this.isPaused = true;
        },
        error: err => {
          this.snackBar.open(`Failed to pause Node ${this.nodeIndex}`, 'OK', {
            panelClass: ['mat-toolbar', 'mat-warn'],
            duration: 5000,
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
            panelClass: ['mat-toolbar', 'mat-warn'],
            duration: 5000,
          });
          this.isPaused = false;
        },
        error: err => {
          this.snackBar.open(`Failed to unpause Node ${this.nodeIndex}`, 'OK', {
            panelClass: ['mat-toolbar', 'mat-warn'],
            duration: 5000,
          });
          console.error(err);
        }
      });
  }
}

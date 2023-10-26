import {booleanAttribute, Component, inject, Input, numberAttribute, OnDestroy, OnInit} from '@angular/core';
import {MatCardModule} from "@angular/material/card";
import {MatButtonModule} from "@angular/material/button";
import {NodeService} from "../service/node.service";
import {MatSnackBar, MatSnackBarModule} from "@angular/material/snack-bar";
import {ActionType, GetStateResponse, NodeState, NodeStateResponse} from "../model/node";
import {CommonModule, NgIf} from "@angular/common";
import {finalize, Subscription} from "rxjs";
import {CdkVirtualForOf, CdkVirtualScrollViewport, ScrollingModule} from "@angular/cdk/scrolling";
import {ScrollingModule as ExperimentalScrollingModule} from '@angular/cdk-experimental/scrolling'
import {webSocket, WebSocketSubject} from "rxjs/webSocket";
import {MatSlideToggleModule} from "@angular/material/slide-toggle";
import {FormsModule} from "@angular/forms";
import {MatIconModule} from "@angular/material/icon";
import {KvViewComponent} from "../kv-view/kv-view.component";
import {PutKvComponent} from "../put-kv/put-kv.component";

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
    MatIconModule,
    KvViewComponent,
    PutKvComponent
  ]
})
export class NodeViewComponent implements OnInit, OnDestroy {
  @Input({transform: numberAttribute})
  nodeIndex: number;
  @Input({transform: booleanAttribute})
  isStepByStep: boolean;

  nodeId: string;
  memberState: string;
  term: number;
  index: number;
  appliedIndex: number;

  logText = "Log Start";
  watchText = "Client Watch";
  clientLogText = "Client Log";
  lockLogToBottom = true;
  showHeartbeatMessages = false;

  isStopped = false;
  isPaused = false;

  isLoading = false;

  nodeService = inject(NodeService);
  snackBar = inject(MatSnackBar);

  logSubject: WebSocketSubject<string>;
  logSubscription: Subscription;

  clientLogSubject: WebSocketSubject<string>;
  clientLogSubscription: Subscription;

  nodeStateSubject: WebSocketSubject<NodeStateResponse>;
  nodeStateSubscription: Subscription;

  ngOnInit() {
    this.getState().add(() => {
      this.subscribeToLog();
      this.subscribeToClientLog();
      this.subscribeToNodeState();
    });
  }

  ngOnDestroy() {
    this.logSubject.complete();
    this.logSubject.unsubscribe();
    this.logSubscription.unsubscribe();

    this.clientLogSubject.complete();
    this.clientLogSubject.unsubscribe();
    this.clientLogSubscription.unsubscribe();

    this.nodeStateSubject.complete();
    this.nodeStateSubject.unsubscribe();
    this.nodeStateSubscription.unsubscribe();
  }

  subscribeToLog() {
    const nodePort = 8080 + this.nodeIndex - 1;
    this.logSubject = webSocket<string>({
      url: `ws://localhost:${nodePort}/education/subscribe-log`,
      deserializer: e => e.data
    });
    this.logSubscription = this.logSubject.subscribe({
      next: (msg: string) => {
        if (!msg || !this.showHeartbeatMessages && msg.includes('MsgHeartbeat')) {
          return;
        }

        if (this.logText.length > 10 ** 6) {
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

  subscribeToClientLog() {
    const nodePort = 8080 + this.nodeIndex - 1;
    this.clientLogSubject = webSocket<string>({
      url: `ws://localhost:${nodePort}/education/subscribe-client-log`,
      deserializer: e => e.data
    });
    this.clientLogSubscription = this.clientLogSubject.subscribe({
      next: (msg: string) => {
        if (!msg) {
          return;
        }

        if (this.clientLogText.length > 10 ** 6) {
          const newStartIdx = this.clientLogText.indexOf('\n', 10 ** 5);
          this.clientLogText.substring(newStartIdx);
        }

        this.clientLogText += '\n' + msg;
      },
      error: err => {
        this.snackBar.open(`An error occurred in client log connection.`, 'OK', {
          panelClass: ['mat-toolbar', 'mat-warn'],
          duration: 5000,
        });
        console.error(err);
      },
      complete: () => {
        this.snackBar.open('Client log connection was closed.', 'OK', {
          panelClass: ['mat-toolbar', 'mat-primary'],
          duration: 5000,
        });
      }
    });
  }

  getState() {
    return this.nodeService.getState(this.nodeIndex)
      .pipe(finalize(() => {
        this.isLoading = false;
      }))
      .subscribe({
        next: (stateResponse: GetStateResponse) => {
          switch (stateResponse.currentState) {
            case NodeState.online:
              this.isPaused = false;
              this.isStopped = false;
              break;
            case NodeState.paused:
              this.isPaused = true;
              this.isStopped = false;
              this.memberState = 'PAUSED';
              break;
            case NodeState.stopped:
              this.isPaused = false;
              this.isStopped = true;
              this.memberState = 'STOPPED';
              break;
          }

          this.isStepByStep = stateResponse.stepByStepMode;
        },
        error: err => {
          this.snackBar.open(`Failed to get Node Status for Node ${this.nodeIndex}.`, 'OK', {
            panelClass: ['mat-toolbar', 'mat-warn'],
            duration: 5000,
          });
          console.error(err);
        }
      });
  }

  subscribeToNodeState() {
    const nodePort = 8080 + this.nodeIndex - 1;
    this.nodeStateSubject = webSocket<NodeStateResponse>({
      url: `ws://localhost:${nodePort}/education/subscribe-state`
    });
    this.nodeStateSubscription = this.nodeStateSubject.subscribe({
      next: (msg: NodeStateResponse) => {
        if (!msg) {
          return;
        }

        if (msg.statusError) {
          if (!this.isStopped && !this.isPaused && !this.isStepByStep) {
            this.memberState = 'UNKNOWN STATUS';
          }

          return;
        }

        this.memberState = msg.memberState;
        this.nodeId = msg.nodeId;
        this.term = msg.term;
        this.index = msg.index;
        this.appliedIndex = msg.appliedIndex;
      },
      error: err => {
        this.snackBar.open(`An error occurred in Node State connection.`, 'OK', {
          panelClass: ['mat-toolbar', 'mat-warn'],
          duration: 5000,
        });
        console.error(err);
      },
      complete: () => {
        this.snackBar.open('Node State connection was closed.', 'OK', {
          panelClass: ['mat-toolbar', 'mat-primary'],
          duration: 5000,
        });
      }
    });
  }

  addWatchEvents(events: string[]) {
    for (const event of events) {
      if (this.watchText.length > 10 ** 6) {
        const newStartIdx = this.watchText.indexOf('\n', 10 ** 5);
        this.watchText.substring(newStartIdx);
      }

      this.watchText += '\n' + event;
    }
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
          this.memberState = 'STOPPED';
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
          this.memberState = 'PAUSED';
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

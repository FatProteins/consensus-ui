import {
  booleanAttribute,
  Component,
  EventEmitter,
  inject,
  Input,
  numberAttribute,
  OnDestroy,
  OnInit,
  Output
} from '@angular/core';
import {MatCardModule} from "@angular/material/card";
import {MatButtonModule} from "@angular/material/button";
import {NodeService} from "../service/node.service";
import {MatSnackBar, MatSnackBarModule} from "@angular/material/snack-bar";
import {ActionType, GetStateResponse, LogUpdate, NodeState, NodeStateResponse, UpdateResponse} from "../model/node";
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
import {KeyValueGet, KeyValueWatch} from "../model/keyvalue";
import {KeyValueService} from "../service/keyvalue.service";

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

  isStepByStep: boolean;
  @Output()
  stepByStepEvent = new EventEmitter<boolean>;

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
  keyValueService = inject(KeyValueService);
  snackBar = inject(MatSnackBar);

  updateSubject: WebSocketSubject<UpdateResponse>;
  updateSubscription: Subscription;

  ngOnInit() {
    this.getState().add(() => {
      this.subscribeToUpdates();
    });
  }

  ngOnDestroy() {
    this.updateSubject.complete();
    this.updateSubject.unsubscribe();
    this.updateSubscription.unsubscribe();
  }

  subscribeToUpdates() {
    const nodePort = 8080 + this.nodeIndex - 1;
    this.updateSubject = webSocket<UpdateResponse>({
      url: `ws://localhost:${nodePort}/education/updates`,
    });
    this.updateSubscription = this.updateSubject.subscribe({
      next: (msg: UpdateResponse) => {
        switch (msg.updateType) {
          case 'state':
            this.handleNodeState(msg.updateObject as NodeStateResponse);
            break;
          case 'watch-kv':
            this.handleWatchEvents(msg.updateObject as KeyValueWatch);
            break;
          case 'get-kv':
            this.handleKvGet(msg.updateObject as KeyValueGet);
            break;
          case 'log':
            this.handleLogUpdate(msg.updateObject as LogUpdate);
            break;
          case 'client-log':
            this.handleClientLogUpdate(msg.updateObject as LogUpdate);
            break;
        }
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

  handleLogUpdate(msg: LogUpdate) {
    if (!this.showHeartbeatMessages && msg.logMessage.includes('MsgHeartbeat')) {
      return;
    }

    if (this.logText.length > 10 ** 6) {
      const newStartIdx = this.logText.indexOf('\n', 10 ** 5);
      this.logText.substring(newStartIdx);
    }

    this.logText += '\n' + msg.logMessage;
  }

  handleClientLogUpdate(msg: LogUpdate) {
    if (this.clientLogText.length > 10 ** 6) {
      const newStartIdx = this.clientLogText.indexOf('\n', 10 ** 5);
      this.clientLogText.substring(newStartIdx);
    }

    this.clientLogText += '\n' + msg.logMessage;
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
          this.stepByStepEvent.emit(this.isStepByStep);
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

  handleNodeState(msg: NodeStateResponse) {
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
  }

  handleWatchEvents(msg: KeyValueWatch) {
    if (!msg.changeLog) {
      return;
    }

    for (const event of msg.changeLog) {
      if (this.watchText.length > 10 ** 6) {
        const newStartIdx = this.watchText.indexOf('\n', 10 ** 5);
        this.watchText.substring(newStartIdx);
      }

      this.watchText += '\n' + event;
    }
  }

  handleKvGet(msg: KeyValueGet) {
    this.keyValueService.keyValueSubject.next(msg);
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

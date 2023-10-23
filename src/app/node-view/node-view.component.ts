import {Component, inject, Input, numberAttribute} from '@angular/core';
import {MatCardModule} from "@angular/material/card";
import {MatButtonModule} from "@angular/material/button";
import {NodeService} from "../service/node.service";
import {MatSnackBar, MatSnackBarModule} from "@angular/material/snack-bar";

@Component({
  selector: 'node-view',
  templateUrl: './node-view.component.html',
  styleUrls: ['./node-view.component.css'],
  standalone: true,
  imports: [
    MatCardModule,
    MatButtonModule,
    MatSnackBarModule
  ]
})
export class NodeViewComponent {
  @Input({transform: numberAttribute})
  nodeIndex: number;
  isOnline: boolean = true;

  nodeService = inject(NodeService);
  snackBar = inject(MatSnackBar);

  stopNode() {
    this.nodeService.stopNode(this.nodeIndex)
      .subscribe({
        next: () => {
          this.snackBar.open(`Successfully stopped Node ${this.nodeIndex}.`, undefined, {
            panelClass: ['mat-toolbar', 'mat-warn']
          })
          this.isOnline = false;
        },
        error: err => {
          this.snackBar.open(`Failed to stop Node ${this.nodeIndex}`, undefined, {
            panelClass: ['mat-toolbar', 'mat-warn']
          })
        }
      });
  }
}

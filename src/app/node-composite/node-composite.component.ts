import { Component } from '@angular/core';
import {NodeViewComponent} from "../node-view/node-view.component";
import {KvViewComponent} from "../kv-view/kv-view.component";

@Component({
  selector: 'node-composite',
  templateUrl: './node-composite.component.html',
  styleUrls: ['./node-composite.component.css'],
  standalone: true,
  imports: [
    NodeViewComponent,
    KvViewComponent
  ]
})
export class NodeCompositeComponent {

}

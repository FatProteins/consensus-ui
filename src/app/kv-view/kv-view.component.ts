import {Component} from '@angular/core';
import {MatCardModule} from "@angular/material/card";
import {MatButtonModule} from "@angular/material/button";
import {MatTableModule} from "@angular/material/table";

@Component({
  selector: 'kv-view',
  templateUrl: './kv-view.component.html',
  styleUrls: ['./kv-view.component.css'],
  standalone: true,
  imports: [
    MatCardModule,
    MatButtonModule,
    MatTableModule
  ]
})
export class KvViewComponent {
  displayedColumns: string[] = ['key', 'value'];
  dataSource: { key: string; value: string }[] = [
    {key: '1', value: 'abc'}
  ];
}

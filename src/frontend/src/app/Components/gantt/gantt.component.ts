import { HttpClient} from '@angular/common/http';
import { AfterViewInit, Component, HostBinding, OnInit, ViewChild } from '@angular/core';
import {
  GanttBarClickEvent,
  GanttBaselineItem,
  GanttDragEvent,
  GanttItem,
  GanttLineClickEvent,
  GanttLinkDragEvent,
  GanttSelectedEvent,
  GanttTableDragDroppedEvent,
  GanttTableDragEndedEvent,
  GanttTableDragEnterPredicateContext,
  GanttTableDragStartedEvent,
  GanttToolbarOptions,
  GanttView,
  GanttViewType,
  NgxGanttComponent,
  GanttGroup,
  GanttDate
} from '@worktile/gantt';
import { finalize, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { random, randomItems } from './helper';

@Component({
  selector: 'app-gantt',
  templateUrl: './gantt.component.html',
  styleUrl: './gantt.component.css'
})
export class GanttComponent implements OnInit{

  date = new GanttDate(1713125075).format("yyyy-mm-dd-hh-mm-ss");
  ngOnInit(): void {
    console.log(this.date);
  }
  constructor( private http: HttpClient ) { }

  views = [ { name: 'Hour', value: GanttViewType.hour }, { name: 'Day', value: GanttViewType.day }, { name: 'Week', value: GanttViewType.week },
            { name: 'Month',value: GanttViewType.month }, { name: 'Quarter', value: GanttViewType.quarter }, { name: 'Year', value: GanttViewType.year } ];
  
  viewType: GanttViewType = GanttViewType.month;
  selectedViewType: GanttViewType = GanttViewType.month;
  isBaselineChecked = false;
  isShowToolbarChecked = true;
  loading = false;

  items: GanttItem[] = [ //koristi unix time. moram da napravim neku konverziju kad ispisujem. ok GantDate ima koverziju
    { id: '000000', group_id: '000000', title: 'Task 0', start: 1711125075, end: 1715717075, expandable: true },
    { id: '000001', group_id: '000000', title: 'Task 1', start: 1713125075, end: 1715112275, links: ['000003', '000004', '000000'], expandable: true },
    { id: '000002', group_id: '000000', title: 'Task 2', start: 1713125075, end: 1714421075 },
    { id: '000003', group_id: '000001', title: 'Task 3', start: 1713125075, end: 1713729875, expandable: true, linkable: true }
  ];
  groups: GanttGroup[] = [
    { id: '000000', title: 'Group-0' },
    { id: '000001', title: 'Group-1' }
  ];
  
  

  dragEnded($event: GanttDragEvent) {
    // this.http.put(`/api/item/${$event.item.id}`, {
    //     start: $event.item.start,
    //     end: $event.item.end
    //   })
    //   .subscribe((items) => {});
  }
}

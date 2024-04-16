import { HttpClient} from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import {
  GanttDragEvent,
  GanttItem,
  GanttSelectedEvent,
  GanttTableDragDroppedEvent,
  GanttTableDragEndedEvent,
  GanttTableDragStartedEvent,
  GanttView,
  GanttViewType,
  NgxGanttComponent,
  GanttGroup,
  GanttDate
} from '@worktile/gantt';
// import { finalize, of } from 'rxjs';
// import { delay } from 'rxjs/operators';

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
  
  @ViewChild('gantt') ganttComponent!: NgxGanttComponent;
  viewType: GanttViewType = GanttViewType.month;
  selectedViewType: GanttViewType = GanttViewType.month;
  isBaselineChecked = false;
  isShowToolbarChecked = true;
  loading = false;

  toolbarOptions = {
    viewTypes: [GanttViewType.day, GanttViewType.week, GanttViewType.month]
  };


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
  
  viewOptions = {
    dateFormat: {
      year: `yyyy`,
      yearQuarter: `QQQ 'of' yyyy`,
      yearMonth: `LLLL yyyy'(week' w ')'`,
      month: 'LLLL',
      week : 'ww'
    }
  };

  goToToday() {
    this.ganttComponent.scrollToToday();
  }
  
  dragEnded($event: GanttDragEvent) { }

  linkDragEnded(event: any){
    console.log(event);
  }

  dragMoved(event: any) { }

  selectView(type: GanttViewType) {
    this.viewType = type;
    this.selectedViewType = type;
  }

  viewChange(event: GanttView) { //promena prikaza
      this.selectedViewType = event.viewType;
  }

  selectedChange(event: GanttSelectedEvent) {
    event.current && this.ganttComponent.scrollToDate(Number(event.current?.start));
    console.log('Selected item changed', event);
  }

  onDragDropped(event: GanttTableDragDroppedEvent) { }

  onDragStarted(event: GanttTableDragStartedEvent) { }

  onDragEnded(event: GanttTableDragEndedEvent) { }

  lineClick(event: any) {
    console.log('Clicked on line', event);
    this.openAddTaskToLinkDialog(event.source.id,event.target.id)
  }

  openAddTaskToLinkDialog(first_task : number,second_task : number): void { }

  barClick(event: any) { }
}

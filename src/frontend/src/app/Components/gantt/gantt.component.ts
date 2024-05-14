import { TaskDependency } from './../../Entities/TaskDependency';
import { MyProjectsService } from './../../_services/my-projects.service';
import { MyTasksComponent } from './../my-tasks/my-tasks.component';
import { HttpClient} from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
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
  GanttDate,
  GanttLink
} from '@worktile/gantt';
import { NgxSpinner, NgxSpinnerService } from 'ngx-spinner';
import { MyTasksService } from '../../_services/my-tasks.service';
import { ProjectSection } from '../../Entities/ProjectSection';
import { SharedService } from '../../_services/shared.service';

@Component({
  selector: 'app-gantt',
  templateUrl: './gantt.component.html',
  styleUrl: './gantt.component.css'
})
export class GanttComponent implements OnInit{

  date = new GanttDate(1713125075).format("yyyy-mm-dd-hh-mm-ss");
  currentProjectId: number | null = null;
  ngOnInit(): void {
    this.shared.taskUpdated.subscribe(() => { 
      this.loading = true;
      this.data_loaded = false;
      this.items=[];
      this.groups=[];
      this.loading = true;
      this.getGanttData();//kupimo sve podatke za trenutni projekat
      setTimeout(()=>
        {
        this.loading = false;
        this.data_loaded = true
      }, 100);
    });
    this.spinner.show();
    this.loading = true;
    this.items=[];
    this.groups=[];
    this.getGanttData();//kupimo sve podatke za trenutni projekat
    this.spinner.hide();
    setTimeout(()=>
    {
      this.loading = false;
      this.data_loaded = true
    }, 100);
    
    // emit kad se doda novi task
    this.shared.taskAdded$.subscribe(success => {
      if (success) {
        console.log("Dodat task na ganttu");
        this.loading = true;
        this.data_loaded = false;
        this.items=[];
        this.groups=[];
        this.loading = true;
        this.getGanttData();
        setTimeout(()=>
        {
          this.loading = false;
          this.data_loaded = true
        }, 100);
      }
    });

    // emit za novu sekciju
    this.shared.sectionUpdated.subscribe(() => {
      this.loading = true;
        this.data_loaded = false;
        this.items=[];
        this.groups=[];
        this.loading = true;
        this.getGanttData();
        setTimeout(()=>
        {
          this.loading = false;
          this.data_loaded = true
        }, 100);
    });
  }
  constructor(
    private http: HttpClient,
    private route:ActivatedRoute,
    private spinner:NgxSpinnerService,
    private myTasksService:MyTasksService,
    private myProjectsService:MyProjectsService,
    private shared:SharedService
    ) { }

  views = [{ name: 'Week', value: GanttViewType.day },{ name: 'Month',value: GanttViewType.month }, { name: 'Year', value: GanttViewType.quarter }];

  @ViewChild('gantt') ganttComponent!: NgxGanttComponent;
  viewType: GanttViewType = GanttViewType.month;
  selectedViewType: GanttViewType = GanttViewType.month;
  isBaselineChecked = false;
  isShowToolbarChecked = true;
  loading = false;
  data_loaded = false;
  toolbarOptions = {
    viewTypes: [GanttViewType.day, GanttViewType.week, GanttViewType.month]
  };


  items: GanttItem[] = [ //koristi unix time. moram da napravim neku konverziju kad ispisujem. ok GantDate ima koverziju
    // { id: '000000', group_id: '000000', title: 'Task 0', start: 1711125075, end: 1715717075, expandable: true },
    // { id: '000001', group_id: '000000', title: 'Task 1', start: 1713125075, end: 1715112275, links: ['000003', '000004', '000000'], expandable: true },
    // { id: '000002', group_id: '000000', title: 'Task 2', start: 1713125075, end: 1714421075 },
    // { id: '000003', group_id: '000001', title: 'Task 3', start: 1713125075, end: 1713729875, expandable: true, linkable: true }
  ];
  groups: GanttGroup[] = [
    // { id: '000000', title: 'Group-0' },
    // { id: '000001', title: 'Group-1' }
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

  private reloadGanttData() {
    this.getGanttData(); // Fetch data again
  }

  goToToday() {
    this.ganttComponent.scrollToToday();
  }

  dragEnded($event: GanttDragEvent) {
    if ($event?.item.start !== undefined && $event.item.end!==undefined) {

      const startdate: Date = new Date(this.convertToStandardTimeStamp($event.item.start));
      const enddate: Date = new Date(this.convertToStandardTimeStamp($event.item.end));

      this.myTasksService.UpdateTimeGantt(Number($event.item.id), startdate, enddate)
      .subscribe(() => {
        this.reloadGanttData();
      });
    }
  }

  linkDragEnded(event: any){
    let taskDependency:TaskDependency={
      taskId:Number(event.source.id),
      dependencyTaskId:Number(event.target.id)
    }
    let arr:TaskDependency[] = [taskDependency];
    this.myTasksService.addTaskDependencies(arr).subscribe((response)=>{});
  }

  dragMoved(event: any) {
    //ovde nikako nista, ovo cita svaki pokret elementa unutar gantta
  }

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

  onDragDropped(event: GanttTableDragDroppedEvent) {}

  onDragStarted(event: GanttTableDragStartedEvent) {}

  onDragEnded(event: GanttTableDragEndedEvent) {}

  lineClick(event: any) {
    console.log('Clicked on line', event);
    this.openAddTaskToLinkDialog(event.source.id,event.target.id)
  }

  openAddTaskToLinkDialog(first_task : number,second_task : number): void { }

  barClick(event: any) {}

  getGanttData(){
    const projectId = this.route.snapshot.paramMap.get('id');
    this.currentProjectId = projectId? +projectId:null;
    this.getProjectSections();
    this.getProjectTasks();
  }
  getProjectSections(){
    if(this.currentProjectId){
      this.myProjectsService.GetProjectSections(this.currentProjectId).subscribe((sections)=>{
        sections.forEach((section:any)=>{
          let group: GanttGroup = {
            id: String(section.id),
            title: section.sectionName
          };
          this.groups.push(group);
        })
      })
    }
    // default sekcija, ukoliko nema svoju
    this.groups.push({ id: 'no-section', title: 'No Section' });
  }
  getProjectTasks(){//ovo nzm dal moze drugacije jer moram da izvlacim zavisnosti kako bi crtalo one linije uopste..
    if(this.currentProjectId){
      this.myTasksService.GetTasksByProjectId(this.currentProjectId).subscribe((tasks) =>{
        tasks.forEach((t:any) =>{
          if (t.statusName !== 'Archived') { // Filter out archived tasks
            var dependencies:GanttLink[] = [];

            this.myTasksService.GetTaskDependencies(t.id).subscribe((depencency_array:TaskDependency[])=>{

              depencency_array.forEach((dep:TaskDependency) => {
                dependencies.push({
                  type: 1,
                  link: String(dep.dependencyTaskId)
                });
              });
            })
            let item:GanttItem={
              id: String(t.id),
              group_id :t.projectSectionId? String(t.projectSectionId):'no-section', // Assign 'no-section' if there is no section
              title:t.taskName,
              start: this.convertToUnixTimestamp(t.startDate),
              end: this.convertToUnixTimestamp(t.endDate),
              links: dependencies,
              expandable: true,
              linkable: true
            }
            this.items.push(item);
          }
        })
      })
    }
  }
  convertToUnixTimestamp(dateString: string): number {
    const date = new Date(dateString);
    return Math.floor(date.getTime() / 1000);
  }
  convertToStandardTimeStamp(unixTime:number) : string{
    const date = new Date(unixTime*1000);
    return date.toLocaleDateString();
  }

  onTaskClick(event: MouseEvent, taskId: number) {
    event.stopPropagation(); 
    this.shared.triggerPopup(event, taskId);
  }
}

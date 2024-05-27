import { TaskDependency } from './../../Entities/TaskDependency';
import { MyProjectsService } from './../../_services/my-projects.service';
import { MyTasksComponent } from './../my-tasks/my-tasks.component';
import { HttpClient} from '@angular/common/http';
import { Component, HostListener, OnInit, TemplateRef, ViewChild } from '@angular/core';
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
  GanttLink,
  LinkColors,
} from '@worktile/gantt';
import { NgxSpinnerService } from 'ngx-spinner';
import { MyTasksService } from '../../_services/my-tasks.service';
import { SharedService } from '../../_services/shared.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-gantt',
  templateUrl: './gantt.component.html',
  styleUrl: './gantt.component.css'
})
export class GanttComponent implements OnInit{
  removeModalRef?:BsModalRef;
  date = new GanttDate(1713125075).format("yyyy-mm-dd-hh-mm-ss");
  currentProjectId: number | null = null;
  userRole: number | null = null;

  ngOnInit(): void {

    const userId = localStorage.getItem("id");
    const projectId = this.route.snapshot.paramMap.get('id');  
    this.currentProjectId = projectId ? +projectId : null;
    if (projectId && userId) {
      this.getUsersProjectRole(+projectId, +userId);
    }

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
      }, 300);
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
    }, 250);

    // emit kad se doda novi task
    this.shared.taskAdded$.subscribe(success => {
      if (success) {
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
        }, 250);
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
        }, 250);
    });
  }
  constructor(
    private route:ActivatedRoute,
    private spinner:NgxSpinnerService,
    private myTasksService:MyTasksService,
    private myProjectsService:MyProjectsService,
    private shared:SharedService,
    private modalService:BsModalService
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


  items: GanttItem[] = [];
  groups: GanttGroup[] = [];

  viewOptions = {
    dateFormat: {
      year: `yyyy`,
      yearQuarter: `QQQ 'of' yyyy`,
      yearMonth: `LLLL yyyy' (week' w ')'`,
      month: 'LLLL',
      week : 'ww'
    }
  };

  getUsersProjectRole(projectId: number, userId: number) {
    this.myProjectsService.getUserProjectRole(projectId, userId).subscribe({
        next: (role) => {
            this.userRole = role;
        },
        error: (error) => {
            console.error('Failed to fetch user role', error);
        }
    });
  }

  private reloadGanttData() {//ovo zna da duplira podatke u ganttu ~maksim

    this.getGanttData(); // Fetch data again
  }

  goToToday() {
    this.ganttComponent.scrollToToday();
  }
  ElementwasDragged:boolean = false;
  dragEnded($event: GanttDragEvent) {
    if (this.userRole !== 4) { // Check if the user is not a guest
      if ($event?.item.start !== undefined && $event.item.end !== undefined) {
        const startdate: Date = new Date(this.convertToStandardTimeStamp($event.item.start));
        const enddate: Date = new Date(this.convertToStandardTimeStamp($event.item.end));
        // this.checkLinks($event?.item);
        this.myTasksService.UpdateTimeGantt(Number($event.item.id), startdate, enddate)
        .subscribe(() => {
          //  this.reloadGanttData();
        });
        
      }
    }
    this.ElementwasDragged = true; // Set the flag indicating that a drag event has occurred
    setTimeout(() => { this.ElementwasDragged = false; }, 200); // Reset the flag after a delay
  }

  // ovo smo testirali i menjali
  linkDragEnded(event: any){
    let taskDependency: TaskDependency = {
        taskId: Number(event.target.id), // Now the target is the dependent task
        dependencyTaskId: Number(event.source.id) // And the source is the task it depends on
    }
    let arr: TaskDependency[] = [taskDependency];
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
  }

  dependency:TaskDependency = {
     taskId:0,
     dependencyTaskId:0
  };
  lineClick(event: any,modal:TemplateRef<void>):void{
    this.openAddTaskToLinkDialog(event.source.id,event.target.id,modal);
  }

  openAddTaskToLinkDialog(first_task : number,second_task : number,modal:TemplateRef<void>): void {
    this.dependency.taskId = Number(first_task);
    this.dependency.dependencyTaskId = Number(second_task);
    this.removeModalRef = this.modalService.show(
      modal,
      {
        class:'modal-face modal-sm modal-dialog-centered',
      }
    )
  }

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
  getProjectTasks(){
    if(this.currentProjectId){
      this.myTasksService.GetTasksByProjectId(this.currentProjectId).subscribe((tasks) =>{
        tasks.forEach((t:any) =>{
          if (t.statusName !== 'Archived') { // Filter out archived tasks
            var dependencies:GanttLink[] = [];
            this.myTasksService.GetTaskDependencies(t.id).subscribe((depencency_array:TaskDependency[])=>{
              depencency_array.forEach((dep:TaskDependency) => {
                dependencies.push({
                  type: 4,
                  link: String(dep.dependencyTaskId),
                },
              );
              });
            })
            let item:GanttItem={
              id: String(t.id),
              group_id :t.projectSectionId? String(t.projectSectionId):'no-section', // Assign 'no-section' if there is no section
              title:t.taskName,
              start: this.convertToUnixTimestamp(t.startDate),
              end: this.convertToUnixTimestamp(t.endDate),
              links: dependencies,
              expandable: false,
              linkable: false // link-ovanje elemenata na ganttu iskljuceno
            }
            this.items.push(item);
          }
        })
      })
    }
  }
  removeDependencyGantt(){
    if(this.dependency.dependencyTaskId!=0 && this.dependency.taskId!=0){
      this.myTasksService.deleteTaskDependency(this.dependency)
      .subscribe((response:any)=>{
        const index = this.items.findIndex(item => item.id === String(this.dependency.taskId));
        const linkIndex = this.items[index].links?.findIndex(link => link.link === String(this.dependency.dependencyTaskId));
        if (linkIndex !== -1 && linkIndex!=undefined) {
          this.items[index].links?.splice(linkIndex, 1);
        }
        this.items = [...this.items];
        this.dependency = {
          taskId: 0,
          dependencyTaskId: 0
        }
        this.removeModalRef?.hide();
      });
    }
  }
  

  convertToUnixTimestamp(dateString: string): number {
    const date = new Date(dateString);
    return date.getTime() / 1000;
  }
  convertToStandardTimeStamp(unixTime:number) : string{
    const date = new Date(unixTime*1000);
    return date.toDateString();
  }

  onTaskClick(event: MouseEvent, taskId: number) {
    if(!this.ElementwasDragged){
      if (this.shared.current_task_id != taskId) {
        this.shared.triggerPopup(event, taskId);
      } else {
        this.shared.current_task_id = null;
      }
    }
  }
}
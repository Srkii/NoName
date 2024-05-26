import { EventEmitter, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import { ProjectTask } from '../Entities/ProjectTask';
import { ChangeTaskInfo } from '../Entities/ChangeTaskInfo';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiUrl } from '../ApiUrl/ApiUrl';
import { TaskDependency } from '../Entities/TaskDependency';
import { DateTimeDto } from '../Entities/DateTimeDto';
import { Project } from '../Entities/Project';
import { sectionChangeDTO } from '../Entities/sectionChangeDTO';

@Injectable({
  providedIn: 'root',
})
export class MyTasksService {
  private apiUrl = environment.apiUrl;
  private baseUrl = `${this.apiUrl}/projectTask`;
  sectionDeleted = new EventEmitter<void>();
  private token: string;
  private httpHeader: HttpHeaders;

  constructor(private http: HttpClient) {
    this.token = localStorage.getItem('token') || '';
    this.httpHeader=new HttpHeaders({"Authorization": `Bearer ${this.token}`});
  }

  GetProjectTasks(): Observable<ProjectTask[]> {
    return this.http.get<ProjectTask[]>(this.baseUrl,{headers:this.httpHeader});
  }

  GetTasksByProjectId(
    projectId: number, 
    sortedColumn: string | null = null, 
    sortedOrder: number = 0, 
    searchText: string | null = null,
    taskStatus: string | null = null,
    startDate: string | null = null,
    endDate: string | null = null
  ): Observable<ProjectTask[]> {
    let params = new HttpParams()
      .set('sortedColumn', sortedColumn ? sortedColumn : '')
      .set('sortedOrder', sortedOrder.toString())
      .set('searchText', searchText ? searchText : '')
      .set('taskStatus', taskStatus ? taskStatus : '')
      .set('startDate', startDate ? startDate : '')
      .set('endDate', endDate ? endDate : '');
  
    return this.http.get<ProjectTask[]>(`${this.baseUrl}/ByProject/${projectId}`, { headers: this.httpHeader, params: params });
  }

  GetTasksByUserId(userId: any): Observable<ProjectTask[]> {
    return this.http.get<ProjectTask[]>(`${this.baseUrl}/user/${userId}`,{headers:this.httpHeader});
  }

  GetProjectTask(taskId: number, userId: any): Observable<ProjectTask> {
    return this.http.get<ProjectTask>(`${this.baseUrl}/${taskId}/${userId}`,{headers:this.httpHeader});
  }
  //tico: mirkov updateTaskStatus. Treba da se promeni
  updateTaskStatus1(id: number, statusName: string): Observable<ProjectTask> {
    return this.http.put<ProjectTask>(`${this.baseUrl}/updateStatus/${id}/${statusName}`,null,{headers:this.httpHeader});
  }

  // kada pomeram taskove iz archived saljem listu zbog boljih performansi
  UpdateArchTasksToCompleted(taskIds: number[]): Observable<any> {
    return this.http.put(`${this.baseUrl}/UpdateArchTasksToCompleted`,taskIds,{headers:this.httpHeader});
  }

  updateTicoTaskStatus(taskId: number, task: ProjectTask): Observable<ProjectTask> {
    return this.http.put<ProjectTask>(`${this.baseUrl}/updateTicoStatus/${taskId}`, task, {headers:this.httpHeader});
  }

  //tico kanban ; ne diraj!
  GetTaskStatuses(projectId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/statuses/${projectId}`, {headers:this.httpHeader});
  }
  // za kanban
  updateTaskStatusPositions(updatedStatuses: any[], projectId: number): Observable<any> {
    const payload = updatedStatuses.map(status => ({ ...status, projectId }));
    return this.http.put(`${this.baseUrl}/updateStatusPositions`, payload, {headers:this.httpHeader});
  }
  
  sortTasksByDueDate(userId:any,sortOrder: string): Observable<ProjectTask[]> {
    const url = `${this.baseUrl}/sortTasksByDueDate/${userId}?sortOrder=${sortOrder}`;
    return this.http.get<ProjectTask[]>(url,{headers:this.httpHeader});
  }
  // za addNewSection modal
  addTaskStatus(taskStatus: { statusName: string; projectId: number }): Observable<any> {
    return this.http.post(`${this.baseUrl}/addTaskStatus`, taskStatus, {headers:this.httpHeader});
  }
  // za addNewTask modal
  createTask(task: any): Observable<any> {
    return this.http.post(`${this.baseUrl}`, task, {headers:this.httpHeader});
  }
  // za deleteSection modal
  deleteTaskStatus(taskStatusId: number | null): Observable<any> {
    if (taskStatusId === null) {
      throw new Error('Task status ID is null');
    }
    return this.http.delete(`${this.baseUrl}/deleteTaskStatus/${taskStatusId}`, {headers:this.httpHeader});
  }

  GetNewTasksByUserId(userId: any, count: number,sortedColumn:string|null=null,sortedOrder:number=0): Observable<ProjectTask[]> {
    return this.http.get<ProjectTask[]>(`${this.baseUrl}/user/${userId}/count1/${count}?sortedColumn=${sortedColumn}&sortedOrder=${sortedOrder}`, {headers:this.httpHeader});
  }
  GetSoonTasksByUserId(userId: any, count: number,sortedColumn:string|null=null,sortedOrder:number=0): Observable<ProjectTask[]> {
    return this.http.get<ProjectTask[]>(`${this.baseUrl}/user/${userId}/count2/${count}?sortedColumn=${sortedColumn}&sortedOrder=${sortedOrder}`, {headers:this.httpHeader});
  }
  GetClosedTasksByUserId(userId: any, count: number,sortedColumn:string|null=null,sortedOrder:number=0): Observable<ProjectTask[]> {
    return this.http.get<ProjectTask[]>(`${this.baseUrl}/user/${userId}/count3/${count}?sortedColumn=${sortedColumn}&sortedOrder=${sortedOrder}`, {headers:this.httpHeader});
  }
  changeTaskInfo(dto: ChangeTaskInfo): Observable<ProjectTask> {
    return this.http.put<ProjectTask>(`${this.baseUrl}/changeTaskInfo`, dto, {headers:this.httpHeader});
  }

  addTaskDependencies(dtos: TaskDependency[]): Observable<any> {
    return this.http.post(`${this.baseUrl}/addTaskDependency`, dtos, {headers:this.httpHeader});
  }

  deleteTaskDependency(dto: TaskDependency): Observable<any> {
    return this.http.post(`${this.baseUrl}/deleteTaskDependency`, dto, {headers:this.httpHeader});
  }
  GetAllTasksDependencies():Observable<TaskDependency[]>{
    return this.http.get<TaskDependency[]>(`${this.baseUrl}/getAllTasksDependencies`, {headers:this.httpHeader});
  }

  deleteTask(taskId: number): Observable<any> {
    const url = `${this.baseUrl}/deleteTask/${taskId}`;
    return this.http.delete(url, {headers:this.httpHeader});
  }
  GetTaskDependencies(id:any):Observable<TaskDependency[]>{
    return this.http.get<TaskDependency[]>(`${this.baseUrl}/getTaskDependencies/${id}`, {headers:this.httpHeader});
  }
  UpdateTimeGantt(id:any,startDate:Date,endDate:Date){
    var newDatetime:DateTimeDto = {
      StartDate:startDate,
      EndDate:endDate,
    }
    return this.http.post<any>(`${this.baseUrl}/timeUpdateGantt/${id}`,newDatetime, {headers:this.httpHeader});
  }
  ChangeTaskSection(id_section:number,id_task:number):Observable<any>{
    var data : sectionChangeDTO = {
      sectionId:id_section,
      taskId:id_task
    }
    return this.http.post<any>(`${this.baseUrl}/changeSectionGantt/`,data, {headers:this.httpHeader});
  }
  TaskNameExists(taskName: string,projectID:number): Observable<ProjectTask> {
    return this.http.get<ProjectTask>(`${this.baseUrl}/getTaskByName/${taskName}/${projectID}`, {headers:this.httpHeader});
  }


}

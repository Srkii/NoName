import { TestBed } from '@angular/core/testing';

import { MyTasksService } from './my-tasks.service';

describe('MyTasksService', () => {
  let service: MyTasksService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MyTasksService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

import { TestBed } from '@angular/core/testing';

import { PageExistsGuardService } from './page-exists-guard.service';

describe('PageExistsGuardService', () => {
  let service: PageExistsGuardService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PageExistsGuardService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

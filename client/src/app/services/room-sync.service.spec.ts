import { TestBed } from '@angular/core/testing';

import { RoomSyncService } from './room-sync.service';

describe('RoomSyncService', () => {
  let service: RoomSyncService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RoomSyncService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

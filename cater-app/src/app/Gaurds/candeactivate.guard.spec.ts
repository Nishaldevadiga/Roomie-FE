import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { candeactivateGuard } from './candeactivate.guard';

describe('candeactivateGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => candeactivateGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});

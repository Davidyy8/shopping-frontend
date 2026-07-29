import { TestBed } from '@angular/core/testing';

import { Shopping } from './shopping';

describe('Shopping', () => {
  let service: Shopping;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Shopping);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

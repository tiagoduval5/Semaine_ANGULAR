import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Citation } from './citation';

describe('Citation', () => {
  let component: Citation;
  let fixture: ComponentFixture<Citation>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Citation],
    }).compileComponents();

    fixture = TestBed.createComponent(Citation);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

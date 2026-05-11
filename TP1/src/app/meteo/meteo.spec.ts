import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MeteoComponent } from './meteo';

describe('Meteo', () => {
  let component: MeteoComponent;
  let fixture: ComponentFixture<MeteoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MeteoComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MeteoComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

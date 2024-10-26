import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportClosedComponent } from './report-closed.component';

describe('ReportClosedComponent', () => {
  let component: ReportClosedComponent;
  let fixture: ComponentFixture<ReportClosedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportClosedComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReportClosedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

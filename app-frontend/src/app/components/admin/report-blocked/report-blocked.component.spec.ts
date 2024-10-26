import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportBlockedComponent } from './report-blocked.component';

describe('ReportBlockedComponent', () => {
  let component: ReportBlockedComponent;
  let fixture: ComponentFixture<ReportBlockedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportBlockedComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReportBlockedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

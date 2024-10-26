import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportTransComponent } from './report-trans.component';

describe('ReportTransComponent', () => {
  let component: ReportTransComponent;
  let fixture: ComponentFixture<ReportTransComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportTransComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReportTransComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

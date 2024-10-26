import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportAccountsComponent } from './report-accounts.component';

describe('ReportAccountsComponent', () => {
  let component: ReportAccountsComponent;
  let fixture: ComponentFixture<ReportAccountsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportAccountsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReportAccountsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

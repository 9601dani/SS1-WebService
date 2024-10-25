import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BalanceReductionComponent } from './balance-reduction.component';

describe('BalanceReductionComponent', () => {
  let component: BalanceReductionComponent;
  let fixture: ComponentFixture<BalanceReductionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BalanceReductionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BalanceReductionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

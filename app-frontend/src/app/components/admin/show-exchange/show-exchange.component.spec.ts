import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShowExchangeComponent } from './show-exchange.component';

describe('ShowExchangeComponent', () => {
  let component: ShowExchangeComponent;
  let fixture: ComponentFixture<ShowExchangeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShowExchangeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShowExchangeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistrarProductsComponent } from './registrar-products.component';

describe('RegistrarProductsComponent', () => {
  let component: RegistrarProductsComponent;
  let fixture: ComponentFixture<RegistrarProductsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RegistrarProductsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegistrarProductsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistrarCategoriesComponent } from './registrar-categories.component';

describe('RegistrarCategoriesComponent', () => {
  let component: RegistrarCategoriesComponent;
  let fixture: ComponentFixture<RegistrarCategoriesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RegistrarCategoriesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegistrarCategoriesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

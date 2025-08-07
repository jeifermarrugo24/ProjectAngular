import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistrarSubcategoriesComponent } from './registrar-subcategories.component';

describe('RegistrarSubcategoriesComponent', () => {
  let component: RegistrarSubcategoriesComponent;
  let fixture: ComponentFixture<RegistrarSubcategoriesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RegistrarSubcategoriesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegistrarSubcategoriesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

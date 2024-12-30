import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AddWidgetPage } from './add-widget.page';

describe('AddWidgetPage', () => {
  let component: AddWidgetPage;
  let fixture: ComponentFixture<AddWidgetPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AddWidgetPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

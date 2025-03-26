import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DeleteUsersPage } from './delete-users.page';

describe('DeleteUsersPage', () => {
  let component: DeleteUsersPage;
  let fixture: ComponentFixture<DeleteUsersPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(DeleteUsersPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

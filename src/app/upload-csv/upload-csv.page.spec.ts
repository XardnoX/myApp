import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UploadCsvPage } from './upload-csv.page';

describe('UploadCsvPage', () => {
  let component: UploadCsvPage;
  let fixture: ComponentFixture<UploadCsvPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(UploadCsvPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

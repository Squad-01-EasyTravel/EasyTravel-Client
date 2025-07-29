import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { PackageManagementComponent } from './package-management';

describe('PackageManagementComponent', () => {
  let component: PackageManagementComponent;
  let fixture: ComponentFixture<PackageManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PackageManagementComponent, FormsModule]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PackageManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load packages on init', () => {
    component.ngOnInit();
    expect(component.packages.length).toBeGreaterThan(0);
  });

  it('should open create modal', () => {
    component.openCreateModal();
    expect(component.isModalOpen).toBe(true);
    expect(component.isEditMode).toBe(false);
    expect(component.selectedPackage).toBeNull();
  });

  it('should open edit modal with package data', () => {
    const mockPackage = {
      id: 1,
      name: 'Test Package',
      destination: 'Test Destination',
      price: 100,
      duration: 3,
      description: 'Test Description',
      imageUrl: 'test.jpg',
      available: true,
      createdAt: new Date()
    };

    component.openEditModal(mockPackage);
    expect(component.isModalOpen).toBe(true);
    expect(component.isEditMode).toBe(true);
    expect(component.selectedPackage).toEqual(mockPackage);
  });

  it('should close modal and reset form', () => {
    component.isModalOpen = true;
    component.selectedPackage = {
      id: 1,
      name: 'Test',
      destination: 'Test',
      price: 100,
      duration: 3,
      description: 'Test',
      imageUrl: 'test.jpg',
      available: true,
      createdAt: new Date()
    };

    component.closeModal();
    expect(component.isModalOpen).toBe(false);
    expect(component.selectedPackage).toBeNull();
    expect(component.newPackage.name).toBe('');
  });

  it('should validate form correctly', () => {
    // Invalid form
    component.newPackage = {
      name: '',
      destination: '',
      price: 0,
      duration: 0,
      description: ''
    };
    expect(component.isFormValid()).toBe(false);

    // Valid form
    component.newPackage = {
      name: 'Test Package',
      destination: 'Test Destination',
      price: 100,
      duration: 3,
      description: 'Test Description'
    };
    expect(component.isFormValid()).toBe(true);
  });

  it('should add new package', () => {
    const initialLength = component.packages.length;
    component.newPackage = {
      name: 'New Package',
      destination: 'New Destination',
      price: 200,
      duration: 5,
      description: 'New Description',
      available: true
    };
    component.isEditMode = false;

    component.savePackage();
    expect(component.packages.length).toBe(initialLength + 1);
    expect(component.isModalOpen).toBe(false);
  });

  it('should delete package', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    const initialLength = component.packages.length;
    const packageId = component.packages[0].id;

    component.deletePackage(packageId);
    expect(component.packages.length).toBe(initialLength - 1);
    expect(component.packages.find(p => p.id === packageId)).toBeUndefined();
  });

  it('should toggle package availability', () => {
    const packageItem = component.packages[0];
    const initialAvailability = packageItem.available;

    component.toggleAvailability(packageItem);
    expect(packageItem.available).toBe(!initialAvailability);
  });
});

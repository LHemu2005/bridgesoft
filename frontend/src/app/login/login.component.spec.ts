import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, provideRouter } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { of } from 'rxjs';
import { By } from '@angular/platform-browser';


describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let navigateSpy: jasmine.Spy;

  beforeEach(async () => {
    const authSpy = jasmine.createSpyObj('AuthService', ['login']);
    await TestBed.configureTestingModule({
      imports: [LoginComponent, ReactiveFormsModule],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    
    // Grab the real router from provideRouter and spy on it, so RouterLink doesn't crash from missing Observables
    const realRouter = TestBed.inject(Router);
    navigateSpy = spyOn(realRouter, 'navigate');
    fixture.detectChanges();
  });

  it('Scenario 3.1: should limit API calls on bad data (Malformed Email)', () => {
    const emailInput = component.loginForm.controls['email'];
    emailInput.setValue('not-an-email');
    emailInput.markAsTouched();
    fixture.detectChanges();

    // Check form is invalid
    expect(component.loginForm.valid).toBeFalse();

    // Check button is disabled
    const submitButton = fixture.debugElement.query(By.css('button[type="submit"]')).nativeElement;
    expect(submitButton.disabled).toBeTrue();

    // Check specific validation text appears
    const errorMessages = fixture.debugElement.queryAll(By.css('.text-red-500'));
    const hasEmailError = errorMessages.some(el => el.nativeElement.textContent.includes('Please enter a valid email address'));
    expect(hasEmailError).toBeTrue();
  });

  it('Scenario 3.2: should route correctly on successful form submission', fakeAsync(() => {
    component.loginForm.controls['email'].setValue('admin@example.com');
    component.loginForm.controls['password'].setValue('password123');
    
    // Setup Spy
    authServiceSpy.login.and.returnValue(of({
      status: 'success',
      token: 'jwt_mock_token',
      user: { email: 'admin@example.com', role: 'ADMIN' }
    }));

    // Trigger Submission
    component.onSubmit();
    tick(); // Wait for observables to resolve

    expect(authServiceSpy.login).toHaveBeenCalledWith({email: 'admin@example.com', password: 'password123'});
    expect(navigateSpy).toHaveBeenCalledWith(['/admin']);
  }));
});

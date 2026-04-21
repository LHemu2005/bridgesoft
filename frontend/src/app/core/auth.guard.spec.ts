import { TestBed } from '@angular/core/testing';
import { Router, RedirectCommand, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { authGuard } from './auth.guard';
import { AuthService } from './auth.service';

describe('AuthGuard', () => {
  let routerSpy: jasmine.SpyObj<Router>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;

  beforeEach(() => {
    routerSpy = jasmine.createSpyObj('Router', ['parseUrl', 'navigate']);
    authServiceSpy = jasmine.createSpyObj('AuthService', ['isAuthenticated']);

    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: routerSpy },
        { provide: AuthService, useValue: authServiceSpy }
      ]
    });
  });

  it('Scenario 3.5: should block unauthorized access and return false while navigating to /login', () => {
    // Empty LocalStorage simulation by forcing isAuthenticated to false
    authServiceSpy.isAuthenticated.and.returnValue(false);

    const result = TestBed.runInInjectionContext(() => {
      const mockRoute = {} as ActivatedRouteSnapshot;
      const mockState = {} as RouterStateSnapshot;
      return authGuard(mockRoute, mockState);
    });

    // We verify the actual logic of auth.guard.ts, which checks if !jwt, then router.navigate(['/login'])
    expect(authServiceSpy.isAuthenticated).toHaveBeenCalled();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
    
    // Angular functional guard returns boolean false based on our codebase
    expect(result).toBeFalse();
  });
});

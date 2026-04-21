import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService]
    });
    service = TestBed.inject(AuthService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('Scenario 3.3: should propagate status 0 as "Unable to connect to the server"', () => {
    service.login({email: 'test@example.com', password: 'password'}).subscribe({
      next: () => fail('should have failed with the network error'),
      error: (error) => {
        expect(error.status).toBe(0);
        expect(error.statusText).toBe('Unknown Error');
      }
    });

    const req = httpTestingController.expectOne('http://localhost:8080/api/auth/login');
    expect(req.request.method).toEqual('POST');

    // Simulate network error status 0
    req.error(new ErrorEvent('Network error'), { status: 0, statusText: 'Unknown Error' });
  });
});

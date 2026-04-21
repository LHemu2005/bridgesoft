import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { jwtInterceptor } from './jwt.interceptor';

describe('JwtInterceptor', () => {
  let httpMock: HttpTestingController;
  let httpClient: HttpClient;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([jwtInterceptor])),
        provideHttpClientTesting()
      ]
    });

    httpMock = TestBed.inject(HttpTestingController);
    httpClient = TestBed.inject(HttpClient);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.removeItem('jwt');
  });

  it('Scenario 3.4: should add an Authorization header when a JWT is present', () => {
    const mockToken = 'mock_token_123';
    localStorage.setItem('jwt', mockToken);

    // Make an HTTP GET request
    httpClient.get('/api/test-endpoint').subscribe(response => {
      expect(response).toBeTruthy();
    });

    // Expect that a single request has been made which matches the given URL
    const httpRequest = httpMock.expectOne('/api/test-endpoint');

    // Assert that the request contains the Authorization header
    expect(httpRequest.request.headers.has('Authorization')).toBeTrue();
    expect(httpRequest.request.headers.get('Authorization')).toBe(`Bearer ${mockToken}`);

    // Flush mock response
    httpRequest.flush({});
  });
});

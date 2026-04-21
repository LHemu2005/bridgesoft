# Authentication MVP - Test Plan

## 1. Backend Unit Tests (Spring Boot)

### AuthService (Simulated within AuthController for MVP) logic
**Scenario 1.1: Valid Registration (Happy Path)**
- **Objective**: Ensure a new user is created and properly hashed.
- **Input/Mock Condition**: `LoginRequest` with unregistered email `new@example.com` and password `password123`.
- **Expected Output**: Mocked `userRepository.save()` is called once. The `PasswordEncoder` should return a BCRYPT hash. HTTP Status `200 OK`. 

**Scenario 1.2: Duplicate Email Registration**
- **Objective**: Verify the system blocks duplicate identities.
- **Input/Mock Condition**: Mock `userRepository.findByEmail()` to return an existing `User` entity.
- **Expected Output**: HTTP Status `400 Bad Request`. `userRepository.save()` is NEVER called. Error string "Email already registered" is returned.

**Scenario 1.3: Successful Login & BCRYPT Matching**
- **Objective**: Verify standard authentication validation works securely.
- **Input/Mock Condition**: Mock `authenticationManager.authenticate` to successfully process the `UsernamePasswordAuthenticationToken`.
- **Expected Output**: Mock `jwtService.generateToken()` must be called. Returns HTTP Status `200 OK` housing a valid response map containing the string `token`.

### JwtService Logic
**Scenario 1.4: Token Generation & Claims Integrity**
- **Objective**: Validate correctness of generated JWT payloads.
- **Input/Mock Condition**: Pass a mock `User` object with role `ADMIN`.
- **Expected Output**: Returns a Base64-encoded JWT. When decoded, the `sub` claim should match the email, the `role` claim must exactly equal `ADMIN`, and the `exp` claim must exactly be Issue Time + 24 Hours.

**Scenario 1.5: Tampered Token Signature Rejection**
- **Objective**: Ensure manipulated JWTs are strictly thrown out.
- **Input/Mock Condition**: Generate a valid token, artificially change the payload locally, and feed it into `jwtService.extractUsername()`.
- **Expected Output**: System throws `SignatureException`.

### AuthController (@WebMvcTest)
**Scenario 1.6: Malformed Login JSON Payload**
- **Objective**: Verify Jackson deserialization bounds.
- **Input/Mock Condition**: Send a POST to `/api/auth/login` completely missing the `email` field or using invalid data types.
- **Expected Output**: HTTP Status `400 Bad Request`.

---

## 2. Backend Security & Integration Tests

### JwtAuthenticationFilter 
**Scenario 2.1: Missing Authorization Header**
- **Objective**: Verify that unprotected requests without tokens are rejected.
- **Input/Mock Condition**: Send an HTTP GET to a secured endpoint (e.g., `/api/admin/data`) with no headers attached.
- **Expected Output**: Filter passes request down the chain neutrally. Spring Security throws an `AccessDeniedException`, yielding HTTP Status `403 Forbidden` (or `401 Unauthorized`).

**Scenario 2.2: Malformed / Expired Bearer Token**
- **Objective**: Validate resilient parsing algorithm.
- **Input/Mock Condition**: Send header `Authorization: Bearer my_fake_string` or a historically expired but correctly signed token.
- **Expected Output**: Filter throws an `ExpiredJwtException` or `MalformedJwtException`. Request resolves in an immediate `401 Unauthorized`.

### Role-Based Access Control (RBAC) Integrations
**Scenario 2.3: Lower-Tier Privilege Escalation Attempt**
- **Objective**: Test strict boundary isolation for Admin capabilities.
- **Input/Mock Condition**: Annotate a restricted endpoint with `@PreAuthorize("hasAuthority('ADMIN')")`. Inject a valid JWT token signed correctly but representing a `USER` role.
- **Expected Output**: Request is intercepted before hitting the controller. HTTP Status `403 Forbidden`.

---

## 3. Frontend Unit Tests (Angular / Jasmine)

### LoginComponent
**Scenario 3.1: Form State on Malformed Email**
- **Objective**: Verify UI limits unnecessary API calls on bad data.
- **Input/Mock Condition**: User types `not-an-email` in the email input and clicks away (touched).
- **Expected Output**: `loginForm.valid` must be `false`. The "Sign in" `<button>` parameter `disabled` must evaluate to `true`. UI specific validation message (`Please enter a valid email address.`) should be mapped inside a `toBeTruthy()` assertion.

**Scenario 3.2: Successful Form Submission routing**
- **Objective**: Ensure the sequence routes the user correctly based on Role.
- **Input/Mock Condition**: Spy on `authService.login()` to return `of({status: 'success', token: 'jwt', user: {role: 'ADMIN'}})`.
- **Expected Output**: Assert that `router.navigate(['/admin'])` is called exactly once.

### AuthService (Using HttpTestingController)
**Scenario 3.3: Network Exception (Status 0) handling**
- **Objective**: Verify UI resiliency when the backend crashes globally.
- **Input/Mock Condition**: Trigger `login()`. Use `httpTestingController` to force a client-side network error via `req.error(new ErrorEvent('Network error'))`.
- **Expected Output**: Ensure `err.status` equates to `0`, successfully passing the `"Unable to connect to the server"` string downstream.

### JwtInterceptor
**Scenario 3.4: Attachment of Bearer Token on Safe Outgoing Request**
- **Objective**: Guarantee that requests leave Angular holding state securely.
- **Input/Mock Condition**: Set localStorage key `jwt` to `mock_token_123`. Initiate any `HttpClient.get()` request. 
- **Expected Output**: Capture the request via `httpTestingController`. Assert that `req.request.headers.has('Authorization')` is `true`, and its value strictly matches `Bearer mock_token_123`.

### Functional Route Guards
**Scenario 3.5: Unauthorized Access Blocking via AuthGuard**
- **Objective**: Protect local routing rendering from users wiping their own LocalStorage.
- **Input/Mock Condition**: Assume LocalStorage is completely empty. The user attempts to navigate directly to `/dashboard` via the browser URL bar.
- **Expected Output**: The `authGuard` function returns a `RedirectCommand` returning the user to the `/login` route. Evaluates to `false` for component activation.

---

## 4. Execution Results & Status (April 2026)

### Phase 1: Backend Security (Spring Boot & JUnit 5)
| Scenario | Component | Objective | Status | Notes |
|----------|-----------|-----------|--------|-------|
| **1.1** | `AuthController` | Valid Registration (Happy Path) | ✅ PASS | Verified BCRYPT hashing and 200 OK. |
| **1.2** | `AuthController` | Duplicate Email Registration | ✅ PASS | Returns 400 Bad Request successfully. |
| **1.3** | `AuthController` | Successful Login & BCRYPT | ✅ PASS | Returns 200 OK with valid mock token. |
| **1.4** | `JwtService` | Token Generation & Claims | ✅ PASS | Upgraded to compliant 512-bit HS512 key for execution. |
| **1.5** | `JwtService` | Tampered Token Signature | ✅ PASS | Successfully rejected invalid signatures. |
| **1.6** | `AuthController` | Malformed Login JSON | ✅ PASS | 400 Bad Request validation operational. |
| **2.1** | `JwtAuthFilter` | Missing Authorization Header | ✅ PASS | Filter successfully bypassed allowing 403 downstream. |
| **2.2** | `JwtAuthFilter` | Malformed Bearer Token | ✅ PASS | Added robust `try-catch` to prevent 500 server crashes. |
| **2.3** | `SecurityConfig` | Privilege Escalation | ✅ PASS | RBAC boundaries hold against JWT role probing. |

### Phase 2: Frontend Logic (Angular & Jasmine)
| Scenario | Component | Objective | Status | Notes |
|----------|-----------|-----------|--------|-------|
| **3.1** | `LoginComponent`| Form State on Malformed Email | ✅ PASS | Form constraints bound strictly to UI invalid state correctly. |
| **3.2** | `LoginComponent`| Successful Form Submission | ✅ PASS | Verified router correctly parses `{role: 'ADMIN'}` payloads. |
| **3.3** | `AuthService` | Network Exception (Status 0) | ✅ PASS | Verified catch-block emits `HttpErrorResponse` robustly. |
| **3.4** | `JwtInterceptor`| Attachment of Bearer Token | ✅ PASS | Evaluated passing mock successfully for Angular v18 APIs. |
| **3.5** | `AuthGuard` | Unauthorized Access Blocking | ✅ PASS | Verifies strict boolean UI navigation fallback on un-auth. |

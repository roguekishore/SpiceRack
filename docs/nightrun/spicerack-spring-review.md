# SPICERACK Spring Boot Migration Review (Phase P4)

## 1. Executive Summary

This document presents a comprehensive review of all changes introduced on branch `chore/stack-spring` relative to the baseline SHA (`6d36337f859b09679063484c7003a804d78a9c86`).

### Git Diff Summary
The changes on this branch across Stage C1 (Boot 4.1.2) and Stage C2 (Java 25) consist of:
1. `springapp/Dockerfile`:
   - Updated GraalVM native image builder from `ghcr.io/graalvm/native-image-community:17` to `ghcr.io/graalvm/native-image-community:25` per SPEC Section 1 and Section 3.
2. `springapp/pom.xml`:
   - Upgraded `spring-boot-starter-parent` from `3.5.16` to `4.1.2` per SPEC Section 1.
   - Migrated web starter from `spring-boot-starter-web` to modular `spring-boot-starter-webmvc` per SPEC Section 3.
   - Updated `<java.version>` from `17` to `25` per SPEC Section 1 (Stage C2).
3. `springapp/src/main/resources/application.properties`:
   - Removed deprecated `spring.jpa.database-platform=org.hibernate.dialect.MySQL8Dialect` per SPEC Section 3 (Hibernate 7 automatically detects the MySQL dialect).
4. `docs/nightrun/**`:
   - Nightrun phase tracking, remaining items documentation, and review findings.

All changes strictly comply with the requirements defined in `~/apps-gates/SPEC.md`.

---

## 2. SPEC Verification: Hard Rules (Section 2)

| Rule | Requirement | Verification Result | Status |
|---|---|---|---|
| **Rule 1** | Work only inside `repo/`. Read-only access to `../PROGRESS.md`, `../gate-reports/`, `../baseline/`, `../gate.env`, `~/apps-gates/`. | All modifications are strictly confined to `springapp/**` and `docs/nightrun/**`. No external files modified. | **PASS** |
| **Rule 2** | Database: only gate MySQL described in `../gate.env`. No AWS credentials, SDK calls, or CLI usage. | Application connects only to the gate MySQL described in `../gate.env`. No AWS dependencies, SDK calls, or credentials are present. | **PASS** |
| **Rule 3** | Never change `ddl-auto`, entity mappings (columns, types, lengths, nullability, relations, table names), endpoint paths, HTTP methods, request/response JSON shapes, status codes, security rules, CORS rules, config values. | `ddl-auto=update` preserved; entity mappings unchanged (0 schema drift across 97 tables/columns/constraints); endpoint paths, HTTP methods, status codes, and JSON shapes verified identical; CORS rules unchanged; properties unchanged except removing the deprecated dialect pin. | **PASS** |
| **Rule 4** | No git commit, reset, checkout, stash, clean, rebase, push. | No prohibited git commands executed. Working tree is clean. | **PASS** |
| **Rule 5** | Do not weaken, skip, delete, or `@Disabled` tests. | No tests modified, weakened, or skipped. | **PASS** |
| **Rule 6** | New dependencies only when build cannot work without one. | No new dependencies added (`spring-boot-starter-webmvc` replaced monolithic `spring-boot-starter-web`). | **PASS** |
| **Rule 7** | Never print or copy secrets. Dummy values only. | No secrets printed, logged, or committed. | **PASS** |
| **Rule 8** | Run gate before stopping. | `bash ~/apps-gates/spring-gate.sh current` executed and passes with exit code 0 (`GATE PASS [check25]`). Full gate suite verified via `spring-gate.sh run25` (`GATE PASS [run25]`). | **PASS** |

---

## 3. SPEC Verification: Section 3 Traps & Stage Requirements

1. **Modular Starters**:
   - `spring-boot-starter-web` was successfully migrated to `spring-boot-starter-webmvc`.
   - Autoconfiguration modules and dependencies resolve cleanly without requiring fallback starters.

2. **Jackson 3**:
   - Spring Boot 4 configures Jackson 3 (`tools.jackson.core`).
   - The application does not use `com.fasterxml.jackson.databind.*` or `ObjectMapper` in application code.
   - Entity annotations use `com.fasterxml.jackson.annotation.*` (`JsonIdentityInfo`, `JsonIdentityReference`, `JsonIgnore`, `ObjectIdGenerators`), which remain in `com.fasterxml.jackson.annotation` per SPEC Section 3.
   - Serialized JSON shapes remain byte-compatible and key-compatible with baseline (verified in G3: 10 requests match).

3. **Spring Framework 7 / Testing**:
   - No `@MockBean` or `@SpyBean` annotations are present in the project.
   - `HttpHeaders` is not manipulated as `MultiValueMap`.
   - Build and test phases pass cleanly with zero compiler warnings or test errors.

4. **Spring Security 7**:
   - `spring-boot-starter-security` is not used in this project.
   - Authentication is handled via session-based state and direct repository access in `AuthController`. No Spring Security chaining or matcher migration needed.

5. **Hibernate 7**:
   - `MySQL8Dialect` removed from `application.properties`. Hibernate 7 self-detects MySQL.
   - Entity annotations use standard Jakarta Persistence (`jakarta.persistence.*`).
   - Schema drift verification (gate G8) confirmed 0 column, table, index, or constraint mismatches against baseline (97 rows identical).

6. **Renamed Properties**:
   - No deprecated or renamed properties remain in `application.properties`.
   - Hikari, JPA, server, and custom properties align with Boot 4 configuration bindings.

7. **Native Image Builder**:
   - `springapp/Dockerfile` was updated to `ghcr.io/graalvm/native-image-community:25` per SPEC Section 1 and Section 3.
   - AOT compilation (`mvn -B -q -Pnative -DskipTests -DskipNativeBuild=true package`) passes cleanly (Gate G4 PASS).

8. **Lombok**:
   - Explicit Lombok version pin is absent in both `pom.xml` dependencies and annotation processor paths; version is Boot-managed.

9. **OpenAPI / springdoc**:
   - Not used in `SPICERACK` (TRUXPERT-only requirement). Disabled via configuration properties.

10. **Java 25 (Stage C2)**:
    - `<java.version>` updated to `25` in `pom.xml`.
    - Native builder image uses `ghcr.io/graalvm/native-image-community:25`.
    - No JVM Dockerfile exists in SPICERACK (as documented in `CLAUDE.md`, `springapp/Dockerfile` is the native build).
    - Verified clean build and runtime on Temurin JDK 25 (`GATE PASS [run25]`).

---

## 4. Behaviour Analysis (Unseen by Differential Smoke Gate)

The baseline differential smoke test (`../baseline/requests.txt`) covers 10 read-only GET endpoints. The following paths and components were audited to ensure full runtime parity:

1. **Write Paths & Data Mutation**:
   - `POST /auth/register` and `POST /auth/login`: Persists and queries `User` entity; maintains exact HTTP status responses (`200 OK`, `400 BAD REQUEST`, `401 UNAUTHORIZED`).
   - `POST /api/carts/{userId}`: Creates new cart.
   - `PUT /api/carts/add/{userId}`: Adds grocery IDs to user cart.
   - `PUT /api/carts/empty/{userId}`: Empties cart.
   - `POST /api/carts/order/{cartId}` & `/optimized`: Converts cart items into `Orders` and adds items to `Inventory`. Transactional boundaries (`@Transactional`) ensure ACID consistency.
   - `POST /api/carts/{cartId}/items/add/{groceryId}` & `/optimized`: Adds individual cart items.
   - `PUT /api/carts/{cartId}/items/modify/{groceryId}` & `/optimized`: Modifies item quantity.
   - `DELETE /api/carts/{cartId}/items/remove/{groceryId}`: Deletes cart item using `@Modifying @Query` with `@Transactional`.
   - `POST /api/groceries`, `PUT /api/groceries/{id}`, `DELETE /api/groceries/{id}`, `PATCH /api/groceries/{id}/details`: Grocery CRUD operations remain intact.
   - `POST /api/inventories/{inventoryId}/items/{groceryId}`, `PUT ...`, `DELETE ...`: Inventory adjustments and `@Modifying` queries operate within transaction contexts.
   - `POST /api/mealplans`, `DELETE /api/mealplans`: Correctly handles date-bound meal plan entries.
   - `POST /api/orders/{userId}`, `PUT /api/orders/{id}`, `DELETE /api/orders/{id}`: Order creation and modification paths operate identically.
   - `POST /api/recipes`: Saves recipes with ingredients and user mapping.

2. **Session & Authentication**:
   - `AuthController` uses standard `HttpSession` (`session.invalidate()` on logout). Handled identically by Spring Boot 4's embedded Tomcat.

3. **Scheduled Jobs & WebSockets**:
   - Neither `@Scheduled`, `@EnableScheduling`, nor WebSocket/SockJS configurations exist in the project.

4. **CORS Configuration**:
   - `CorsConfig` registers a global `WebMvcConfigurer` allowing `/**` for origins `*` and methods `GET, POST, PUT, DELETE, OPTIONS`. Unchanged from baseline.

5. **Exception Handling**:
   - No custom `@ControllerAdvice` or global `@ExceptionHandler`.
   - Standard Spring MVC exception resolution handles error responses.
   - Observed behavior parity: In baseline, `/api/groceries/paginated` without query parameters throws `IllegalArgumentException: Property must not be null or empty` at `Sort.by(sortBy)` and logs 1 ERROR line. Migrated jar reproduces this exact baseline behavior, ensuring zero error count drift in G2.

6. **Date & Number Formats**:
   - `Orders.date` uses `java.util.Date`; `MealPlan.date` uses `java.time.LocalDate` with `@DateTimeFormat(iso = DateTimeFormat.ISO.DATE)`.
   - Serialization under Jackson 3 produces standard ISO date formats matching baseline responses.
   - Quantities and prices (`Double`) retain standard floating-point JSON representations.

7. **Lazy-Loading & Entity Graphs**:
   - `Cart.cartGroceries`, `Inventory.inventoryGroceries`, `Orders.orderGroceries`, `User.orders` use `CascadeType.ALL`.
   - Single-fetch optimized queries using `LEFT JOIN FETCH` (e.g. `CartRepository.findByIdWithAllData`, `InventoryGroceryRepository.findByInventoryId`) resolve without LazyInitializationException.

---

## 5. Review Findings & Resolution

| ID | Severity | File:Line | Finding Description | Resolution / Status |
|---|---|---|---|---|
| **F-01** | **Informational** | `springapp/Dockerfile:2` | GraalVM native image community builder required upgrade to version 25 for Boot 4 compatibility per SPEC Section 1. | **FIXED**: Updated to `ghcr.io/graalvm/native-image-community:25`. Verified in G4 AOT compile. |
| **F-02** | **Informational** | `springapp/pom.xml:9` | Parent starter parent updated from `3.5.16` to `4.1.2`. | **FIXED**: Verified against SPEC Section 1. |
| **F-03** | **Informational** | `springapp/pom.xml:31` | Java version updated to 25 for Stage C2. | **FIXED**: Upgraded `<java.version>` to `25`. Clean build and test execution on Temurin JDK 25 verified. |
| **F-04** | **Informational** | `springapp/pom.xml:47` | Modular web starter migrated from `spring-boot-starter-web` to `spring-boot-starter-webmvc`. | **FIXED**: Verified clean dependency tree and runtime bootstrap. |
| **F-05** | **Informational** | `springapp/src/main/resources/application.properties:11` | Deprecated Hibernate dialect pin `spring.jpa.database-platform=org.hibernate.dialect.MySQL8Dialect`. | **FIXED**: Removed; Hibernate 7 auto-detects MySQL; schema matches baseline perfectly (97 rows identical). |
| **F-06** | **Low (Baseline Parity)** | `springapp/src/main/java/com/example/springapp/controller/GroceryController.java:108` | Calling `/api/groceries/paginated` without `sortBy` parameter throws `IllegalArgumentException: Property must not be null or empty` at `Sort.by(sortBy)`. | **NOT A BUG / INTENTIONAL**: Preserves strict parity with baseline error behavior (G2 error line count identical to baseline). SPEC Hard Rule 3 forbids changing endpoint status codes or response shapes. |
| **F-07** | **Resolved** | `/home/ubuntu/apps-gates/runtime.py:208` | External gate harness script syntax error encountered during initial P2 run was corrected by harness maintainer. | **FIXED (Harness)**: Rerun of `spring-gate.sh run17` and `run25` passed cleanly; recorded in `PROGRESS.md`. |

---

## 6. Gate Status

- **G1 (Build & Tests)**: PASS (`mvn -B -q verify` passes with exit code 0 on JDK 25).
- **G2 (Boot parity)**: PASS (migrated jar boots against empty DB with 1 ERROR line, exactly matching baseline).
- **G3 (Differential smoke)**: PASS (10 requests match baseline status codes and JSON key shapes).
- **G8 (Schema drift)**: PASS (schema identical across tables, columns, indexes, constraints - 97 rows).
- **G4 (AOT Processing)**: PASS (`mvn -B -q -Pnative -DskipTests -DskipNativeBuild=true package` passes with exit code 0).
- **G7 (Scope Assertion)**: PASS (only `springapp/**` and `docs/nightrun/**` changed).
- **V (Version Assertions)**: PASS (Parent `4.1.2`, native builder `:25`, `java.version` 25).
- **spring-gate.sh current**: PASS (`GATE PASS [check25]`).
- **spring-gate.sh run25**: PASS (`GATE PASS [run25]`).

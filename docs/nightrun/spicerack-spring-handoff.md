# SPICERACK Spring Boot Migration — Handoff Report

**Run**: `spicerack-spring`  
**Branch**: `chore/stack-spring`  
**Base SHA**: `6d36337f859b09679063484c7003a804d78a9c86`  
**Target Specification**: `~/apps-gates/SPEC.md` (Spring Boot 4.1.2 parent, Java 25 stage C2, GraalVM native image builder `:25`)

---

## 1. Phase Execution Status (`../PROGRESS.md`)

From `../PROGRESS.md`:

| Phase | Description | Status | Commit | Notes |
|---|---|---|---|---|
| **P1** | Boot 4.1.2 compiles and tests pass on Java 17 | **done** (passed) | `6f20172969` | Initial upgrade to Boot 4.1.2 parent, modular `spring-boot-starter-webmvc`, native builder `:25`, removed deprecated `MySQL8Dialect`. Build and tests pass. |
| **P2** | Boot 4.1.2 runtime parity on Java 17 | **done** (passed) | `50d6a2ee84` | Note from `PROGRESS.md`: `gate run17 passed on 2026-11-01 after the runtime.py fix (operator-verified, no code change)`. |
| **P3** | Java 25 (stage C2) | **done** (passed) | `fd94328258` | Promoted `java.version` to 25. Verified with full `run25` gate suite (V, G7, G1, G2, G3, G8, G4). |
| **P4** | Review and fix | **done** (passed) | `8b880dac09` | Comprehensive review and audit against `SPEC.md`. Verified G1, G2, G3, G4, G7, G8 on Java 25. Zero code defects found. |
| **P5** | Handoff report | **running** | — | Creation of this handoff document. No code changes made. |

All preceding phases (P1, P2, P3, P4) passed cleanly.

---

## 2. Gate Results (`../gate-reports/*.txt`)

From `../gate-reports/run25.runtime.txt` (Stage C2 — Java 25):
```text
G2 PASS: migrated jar booted (ERROR lines: baseline 1, migrated 1)
G3 PASS: 10 requests match
G8 PASS: schema identical (97 rows)
INFO (report only): fresh-install schema of the migrated jar vs baseline: identical
```

From `../gate-reports/run17.runtime.txt` (Stage C1 — Java 17):
```text
G2 PASS: migrated jar booted (ERROR lines: baseline 1, migrated 1)
G3 PASS: 10 requests match
G8 PASS: schema identical (97 rows)
INFO (report only): fresh-install schema of the migrated jar vs baseline: identical
```

From `../gate-reports/baseline.runtime.txt`:
```text
G2 PASS: migrated jar booted (ERROR lines: baseline 1, migrated 1)
self-check: kept 10 requests, dropped 0 unstable: []
G3 PASS: 10 requests match
G8 PASS: schema identical (97 rows)
```

### Exact G3 and G8 Line Quotes:
- **G3 quote**:
  ```text
  G3 PASS: 10 requests match
  ```
- **G8 quote**:
  ```text
  G8 PASS: schema identical (97 rows)
  ```

### Full Gate Suite Summary:
- **Version Assertions (V)**: PASS. `spring-boot-starter-parent` is `4.1.2`, native image builder is `ghcr.io/graalvm/native-image-community:25`, `java.version` is `25`.
- **G1 (Build & Tests)**: PASS. Maven `verify` passes on JDK 25 (`run25.mvn.log`, `check25.mvn.log`).
- **G2 (Boot & Logging)**: PASS. Migrated jar booted against empty gate DB with 1 ERROR line matching baseline.
- **G3 (Differential Smoke)**: PASS. All 10 baseline endpoints match exact HTTP status codes and JSON response key shapes.
- **G4 (AOT Processing)**: PASS. `mvn -B -Pnative -DskipTests -DskipNativeBuild=true package` completed successfully (`run25.aot.log`).
- **G7 (Scope Assertion)**: PASS. Changes strictly confined to allowed paths (`springapp/**` and `docs/nightrun/**`).
- **G8 (Schema Drift)**: PASS. Exactly 97 schema rows match baseline schema with zero column, type, nullability, or constraint drift.

---

## 3. Files Changed and Why (`git diff --stat $(cat ../baseline/sha)`)

Git diff stat against baseline commit SHA `6d36337f859b09679063484c7003a804d78a9c86`:

```text
 docs/nightrun/spicerack-spring-handoff.md          | 182 +++++++++++++++++++++
 docs/nightrun/spicerack-spring-left.md             |  18 ++
 docs/nightrun/spicerack-spring-review.md           | 155 ++++++++++++++++++
 springapp/Dockerfile                               |   2 +-
 springapp/pom.xml                                  |   7 +-
 .../src/main/resources/application.properties      |   1 -
 6 files changed, 359 insertions(+), 6 deletions(-)
```

### Explanation for Every File Changed:

1. `springapp/pom.xml`:
   - **Why**:
     - Upgraded `spring-boot-starter-parent` from `3.5.16` to `4.1.2` per SPEC Section 1.
     - Updated `<java.version>` from `17` to `25` per SPEC Section 1 & Section 4 (Stage C2).
     - Replaced `spring-boot-starter-web` with modular `spring-boot-starter-webmvc` per SPEC Section 3.
     - Maintained Boot-managed Lombok without explicit version pin per SPEC Section 1 & 3.

2. `springapp/Dockerfile`:
   - **Why**:
     - Updated the GraalVM native image build image from `ghcr.io/graalvm/native-image-community:17` to `ghcr.io/graalvm/native-image-community:25` per SPEC Section 1 ("Native builder image, C1: `ghcr.io/graalvm/native-image-community:25` (every Dockerfile.native, and SPICERACK's springapp/Dockerfile)") and Section 3.

3. `springapp/src/main/resources/application.properties`:
   - **Why**:
     - Removed `spring.jpa.database-platform=org.hibernate.dialect.MySQL8Dialect` per SPEC Section 3 ("Hibernate 7. Remove deprecated dialect pins such as MySQL8Dialect (Hibernate detects MySQL itself)").

4. `docs/nightrun/spicerack-spring-left.md`:
   - **Why**:
     - Required nightrun tracking log recording progress across phases P2, P3, and P4, documenting resolution of the gate harness syntax issue, and confirming 0 remaining tasks.

5. `docs/nightrun/spicerack-spring-review.md`:
   - **Why**:
     - Required review report produced during phase P4 documenting the thorough audit of code, configuration, database schema, HTTP endpoints, security constraints, and gate verifications.

6. `docs/nightrun/spicerack-spring-handoff.md`:
   - **Why**:
     - Required handoff report produced in phase P5 providing the owner with complete factual documentation of the migration.

---

## 4. Dependencies Added or Removed

- **Added Dependencies**:
  - None permanently added.
  - Note: `org.springframework.boot:spring-boot-properties-migrator` was temporarily added during P1 to verify configuration property compatibility and removed before commit per SPEC Section 3.
- **Removed Dependencies**:
  - `org.springframework.boot:spring-boot-starter-web` (replaced by modular starter `org.springframework.boot:spring-boot-starter-webmvc`).
- **Managed Versions**:
  - All library versions (Spring Boot 4.1.2, Spring Framework 7, Spring Data JPA / Hibernate 7, Jackson 3, Lombok) are managed transitively through `spring-boot-starter-parent` 4.1.2 without manual overrides.

---

## 5. Items in `docs/nightrun/spicerack-spring-left.md`

Contents of `docs/nightrun/spicerack-spring-left.md`:
- **Phase P2 (Boot 4.1.2 runtime parity on Java 17)**:
  - Recorded external gate harness blocker in `/home/ubuntu/apps-gates/runtime.py` line 208 (`SyntaxError: unterminated f-string literal`).
  - Recorded that the issue was resolved by the test harness maintainer and subsequent run of `spring-gate.sh run17` passed cleanly (operator-verified in `PROGRESS.md`).
- **Phase P3 (Java 25 stage C2)**:
  - Status: Completed successfully.
  - Verification: `spring-gate.sh run25` passed cleanly (V, G7, G1, G2, G3, G8, G4).
  - Items Left: None.
- **Phase P4 (Review and fix)**:
  - Status: Completed successfully.
  - Verification: Comprehensive code, configuration, and behavioural audit against `SPEC.md` completed. `spring-gate.sh current` (`check25`) and `spring-gate.sh run25` both pass cleanly.
  - Items Left: None.
- **Overall Items Left Undone**: None.

---

## 6. What the Owner Must Still Do

Per SPEC Section 8 ("Out of scope everywhere: Merging, pushing and deploying belong to the owner"), the owner must perform the following actions:

1. **Push the branch**:
   ```bash
   git push origin chore/stack-spring
   ```

2. **Run the GitHub Actions Native Build**:
   - Go to the repository's **GitHub Actions** tab.
   - Select the **Build and Push** workflow (`.github/workflows/...`).
   - Trigger the workflow on branch `chore/stack-spring` specifying tag `graal`.
   - The workflow compiles `springapp/Dockerfile` with `ghcr.io/graalvm/native-image-community:25`, runs native smoke tests, and publishes `roguekishore/spicerack:graal`.

3. **Flip `mise.toml` to `temurin-25`**:
   - Update `mise.toml` to configure Java 25:
     ```toml
     [tools]
     java = "temurin-25"
     ```

4. **Merge**:
   - Open a pull request for `chore/stack-spring` and merge into the default branch once GitHub Actions status checks pass.

5. **Deploy**:
   - On the target deployment host, execute:
     ```bash
     sudo docker-compose pull spicerack && sudo docker-compose up -d spicerack
     ```
   - Verify deployment status:
     ```bash
     sudo docker inspect -f '{{.RepoDigests}}' roguekishore/spicerack:graal
     docker stats --no-stream
     ```

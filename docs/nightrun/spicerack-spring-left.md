# Spicerack Spring — Remaining Items

## P2: Boot 4.1.2 runtime parity on Java 17

### External Gate Harness Blocker (Resolved)
Execution of `bash ~/apps-gates/spring-gate.sh run17` initially failed due to a Python `SyntaxError` in the gate script `/home/ubuntu/apps-gates/runtime.py` at line 208. The syntax error was resolved by the harness maintainer. Subsequent run of `spring-gate.sh run17` passed cleanly (operator-verified, recorded in `PROGRESS.md`).

## P3: Java 25 (stage C2)

- **Status**: Completed successfully.
- **Verification**: `spring-gate.sh run25` passed cleanly (V, G7, G1, G2, G3, G8, G4).
- **Items Left**: None.

## P4: Review and fix

- **Status**: Completed successfully.
- **Verification**: Comprehensive code, configuration, and behavioural audit against `SPEC.md` completed. `spring-gate.sh current` (`check25`) and `spring-gate.sh run25` both pass cleanly.
- **Items Left**: None.

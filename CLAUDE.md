# SPICERACK

Spring Boot 3.4.3 (per `springapp/pom.xml`) food/menu management service.

## Native image status

DONE. Tag: `roguekishore/spicerack:graal`. `springapp/Dockerfile` IS the native build (GraalVM
`native-image-community:17`, `-Pnative`, debian-slim runtime); there is no separate JVM Dockerfile.
Always verify the live digest:
```bash
sudo docker inspect -f '{{.RepoDigests}}' roguekishore/spicerack:graal
```

Compose settings (live on the box, checked 2026-10-11):
```yaml
command: ["-Xmx96m"]
mem_limit: 224m
memswap_limit: 224m
```
Idle on the box: ~52 MiB (`docker stats`).

Runtime RSS dropped from 110–170 MB (JVM) to ~75 MB anon (native).

## Build and push (GitHub Actions)

Actions -> Build and Push -> Run workflow: pick the branch, type a tag. It builds `springapp/Dockerfile`,
smoke-tests the native binary, and pushes only `roguekishore/spicerack:<tag>`. The box pulls `:graal`, so
to ship: run with tag `graal`, then on the box `sudo docker-compose pull spicerack && sudo docker-compose up -d spicerack`.
No run has happened yet as of 2026-10-11. Details: `../.deployment/ci/RUNBOOK.md`; the box: `../.deployment/CLAUDE.md`.

## Project-specific native gotchas

- Boot 3.5.x → GraalVM 17 is fine.
- All `@ManyToOne`/`@OneToOne` are EAGER.
- mem_limit is 224m not 160m — spicerack's startup allocation (Hibernate metamodel, Tomcat, Hikari) pushes anon toward the heap ceiling transiently. Size off peak, not idle.

## GraalVM shared lessons

@../.claude/graalvm-lessons.md

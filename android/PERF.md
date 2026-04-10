# Performance and ANR checklist

Use this with Android Studio **Profiler** (CPU, Memory, Energy) on a **release** build when possible.

## Startup

- Avoid disk I/O, network, or heavy reflection in `Application.onCreate` except what is required for the first frame.
- Prefer lazy initialization (e.g. feature modules, background `CoroutineScope` with `Dispatchers.Default`).
- For numeric cold/warm start targets, add **Macrobenchmark** (`baseline-prof` / `Baseline Profile`) in a separate `:benchmark` module.

## Main thread

- Network and blocking I/O must use `Dispatchers.IO` (or appropriate workers), never the main thread.
- Do not use `runBlocking` on the main thread.
- Profile with **CPU Profiler** → Record → look for long-running methods on the main thread.

## Compose

- Use **Layout Inspector** and recomposition counts to find unstable parameters.
- Prefer stable types for list items; use `key` in `LazyColumn`/`LazyRow`.

## ANRs

- Monitor **Google Play Console** → Android vitals → ANRs after release.
- Pair with **Firebase Crashlytics** (non-fatal breadcrumbs) for context around slow paths.

## Release vs debug

Always validate **minify + shrinkResources** (R8): proguard consumer rules are in `app/proguard-rules.pro`.

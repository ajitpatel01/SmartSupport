# Retrofit / OkHttp
-keepattributes Signature
-keepattributes Exceptions
-dontwarn okhttp3.**
-dontwarn okio.**
-keep class retrofit2.** { *; }

# Gson (generic type info for API DTOs)
-keepattributes Signature
-keep class com.smartsupport.app.data.remote.dto.** { *; }

# Firebase / Play Services (handled by consumer rules; keep if needed)
-keepattributes *Annotation*

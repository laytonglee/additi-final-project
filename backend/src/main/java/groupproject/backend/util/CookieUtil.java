package groupproject.backend.util;

import jakarta.servlet.http.HttpServletResponse;

public final class CookieUtil {

    private CookieUtil() {}

    // Production version with Secure and SameSite=None for proper cross-origin cookie handling

//    public static void addCookie(HttpServletResponse response,
//                                 String name, String value, long maxAgeMs) {
//        response.addHeader("Set-Cookie",
//                name + "=" + value +
//                        "; HttpOnly; Secure; Path=/; SameSite=None; Max-Age=" +
//                        (maxAgeMs / 1000));
//    }
//
//    public static void clearCookie(HttpServletResponse response, String name) {
//        response.addHeader("Set-Cookie",
//                name + "=; HttpOnly; Secure; Path=/; SameSite=None; Max-Age=0");
//    }

    // Development version without Secure and SameSite=None for easier testing on localhost

    public static void addCookie(HttpServletResponse response,
                                 String name, String value, long maxAgeMs) {
        response.addHeader("Set-Cookie",
                name + "=" + value +
                        "; HttpOnly; Path=/; SameSite=Lax; Max-Age=" +
                        (maxAgeMs / 1000));
    }

    public static void clearCookie(HttpServletResponse response, String name) {
        response.addHeader("Set-Cookie",
                name + "=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0");
    }
}


package groupproject.backend.util;

import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/**
 * Spring-managed cookie helper.
 * Cookie security attributes are driven by environment variables so the same
 * build works in both local development and production:
 *
 *  Development (defaults):  COOKIE_SECURE=false  COOKIE_SAME_SITE=Lax
 *  Production (Render):     COOKIE_SECURE=true   COOKIE_SAME_SITE=None
 *
 * SameSite=None + Secure is required when the frontend (Vercel) and backend
 * (Render) are on different top-level domains.
 */
@Component
public class CookieUtil {

    @Value("${app.cookie.secure:false}")
    private boolean secure;

    @Value("${app.cookie.same-site:Lax}")
    private String sameSite;

    public void addCookie(HttpServletResponse response,
                          String name, String value, long maxAgeMs) {
        StringBuilder sb = new StringBuilder()
                .append(name).append("=").append(value)
                .append("; HttpOnly; Path=/")
                .append("; SameSite=").append(sameSite)
                .append("; Max-Age=").append(maxAgeMs / 1000);
        if (secure) sb.append("; Secure");
        response.addHeader("Set-Cookie", sb.toString());
    }

    public void clearCookie(HttpServletResponse response, String name) {
        StringBuilder sb = new StringBuilder()
                .append(name).append("=")
                .append("; HttpOnly; Path=/")
                .append("; SameSite=").append(sameSite)
                .append("; Max-Age=0");
        if (secure) sb.append("; Secure");
        response.addHeader("Set-Cookie", sb.toString());
    }
}


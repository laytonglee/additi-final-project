package groupproject.backend.util;

/**
 * Simple User-Agent parser to extract device type and browser name.
 */
public class UserAgentParser {

    private UserAgentParser() {}

    public static String getDeviceType(String userAgent) {
        if (userAgent == null) return "UNKNOWN";

        String ua = userAgent.toLowerCase();

        if (ua.contains("tablet") || ua.contains("ipad") || ua.contains("playbook")
                || ua.contains("silk") || (ua.contains("android") && !ua.contains("mobile"))) {
            return "TABLET";
        }

        if (ua.contains("mobile") || ua.contains("iphone") || ua.contains("ipod")
                || ua.contains("android") || ua.contains("blackberry")
                || ua.contains("windows phone") || ua.contains("opera mini")
                || ua.contains("iemobile")) {
            return "MOBILE";
        }

        return "DESKTOP";
    }

    public static String getBrowser(String userAgent) {
        if (userAgent == null) return "Unknown";

        String ua = userAgent.toLowerCase();

        // Order matters: check more specific browsers first
        if (ua.contains("edg/") || ua.contains("edge/")) return "Edge";
        if (ua.contains("opr/") || ua.contains("opera")) return "Opera";
        if (ua.contains("chrome") && !ua.contains("chromium")) return "Chrome";
        if (ua.contains("safari") && !ua.contains("chrome")) return "Safari";
        if (ua.contains("firefox")) return "Firefox";
        if (ua.contains("msie") || ua.contains("trident/")) return "IE";
        if (ua.contains("samsung")) return "Samsung Browser";

        return "Other";
    }
}

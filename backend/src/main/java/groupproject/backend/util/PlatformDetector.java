package groupproject.backend.util;

/**
 * Detects the platform name from a given URL.
 */
public class PlatformDetector {

    private PlatformDetector() {}

    public static String detect(String url) {
        if (url == null) return "website";

        String lower = url.toLowerCase();

        if (lower.contains("facebook.com") || lower.contains("fb.com")) return "facebook";
        if (lower.contains("instagram.com")) return "instagram";
        if (lower.contains("tiktok.com")) return "tiktok";
        if (lower.contains("youtube.com") || lower.contains("youtu.be")) return "youtube";
        if (lower.contains("twitter.com") || lower.contains("x.com")) return "twitter";
        if (lower.contains("shopee")) return "shopee";
        if (lower.contains("lazada")) return "lazada";
        if (lower.contains("linkedin.com")) return "linkedin";
        if (lower.contains("github.com")) return "github";
        if (lower.contains("discord.com") || lower.contains("discord.gg")) return "discord";
        if (lower.contains("twitch.tv")) return "twitch";
        if (lower.contains("pinterest.com")) return "pinterest";
        if (lower.contains("snapchat.com")) return "snapchat";
        if (lower.contains("telegram.me") || lower.contains("t.me")) return "telegram";
        if (lower.contains("whatsapp.com") || lower.contains("wa.me")) return "whatsapp";
        if (lower.contains("spotify.com")) return "spotify";
        if (lower.contains("line.me")) return "line";

        return "website";
    }
}

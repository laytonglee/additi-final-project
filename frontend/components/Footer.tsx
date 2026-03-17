import Link from "next/link";
import Image from "next/image";
import { Facebook, Instagram, Linkedin, Mail } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 ">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-12 ">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="group mb-4 flex items-center gap-3">
              <Image
                src="/khmerlance-logo.png"
                alt="Khmerlance"
                width={180}
                height={52}
                className="w-auto object-contain"
              />
            </Link>

            <p className="max-w-sm text-sm leading-6 text-muted-foreground">
              KhmerLance connects startups, small businesses, and university
              freelancers in Cambodia to create real work opportunities and grow
              together.
            </p>

            <div className="mt-5 flex items-center gap-3">
              <Link
                href="#"
                className="flex size-9 items-center justify-center rounded-xl border bg-background transition-colors hover:bg-muted"
                aria-label="Facebook"
              >
                <Facebook className="size-4" />
              </Link>
              <Link
                href="#"
                className="flex size-9 items-center justify-center rounded-xl border bg-background transition-colors hover:bg-muted"
                aria-label="LinkedIn"
              >
                <Linkedin className="size-4" />
              </Link>
              <Link
                href="#"
                className="flex size-9 items-center justify-center rounded-xl border bg-background transition-colors hover:bg-muted"
                aria-label="Instagram"
              >
                <Instagram className="size-4" />
              </Link>
              <Link
                href="mailto:hello@khmerlance.com"
                className="flex size-9 items-center justify-center rounded-xl border bg-background transition-colors hover:bg-muted"
                aria-label="Email"
              >
                <Mail className="size-4" />
              </Link>
            </div>
          </div>

          {/* Platform */}
          <div>
            <h4 className="mb-4 text-sm font-semibold text-foreground">
              Platform
            </h4>
            <div className="space-y-3 text-sm text-muted-foreground">
              <Link
                href="/projects"
                className="block transition-colors hover:text-foreground"
              >
                Browse Projects
              </Link>
              <Link
                href="/explore"
                className="block transition-colors hover:text-foreground"
              >
                Explore Talent
              </Link>
              <Link
                href="/community"
                className="block transition-colors hover:text-foreground"
              >
                Community
              </Link>
              <Link
                href="/insights"
                className="block transition-colors hover:text-foreground"
              >
                Insights
              </Link>
            </div>
          </div>

          {/* Company */}
          <div>
            <h4 className="mb-4 text-sm font-semibold text-foreground">
              Company
            </h4>
            <div className="space-y-3 text-sm text-muted-foreground">
              <Link
                href="/about"
                className="block transition-colors hover:text-foreground"
              >
                About Us
              </Link>
              <Link
                href="/how-it-works"
                className="block transition-colors hover:text-foreground"
              >
                How It Works
              </Link>
              <Link
                href="/contact"
                className="block transition-colors hover:text-foreground"
              >
                Contact
              </Link>
              <Link
                href="/faq"
                className="block transition-colors hover:text-foreground"
              >
                FAQ
              </Link>
            </div>
          </div>

          {/* Get Started */}
          <div>
            <h4 className="mb-4 text-sm font-semibold text-foreground">
              Get Started
            </h4>
            <div className="space-y-3 text-sm text-muted-foreground">
              <Link
                href="/register"
                className="block transition-colors hover:text-foreground"
              >
                Create Account
              </Link>
              <Link
                href="/login"
                className="block transition-colors hover:text-foreground"
              >
                Sign In
              </Link>
              <Link
                href="/register?role=client"
                className="block transition-colors hover:text-foreground"
              >
                Hire Freelancers
              </Link>
              <Link
                href="/register?role=freelancer"
                className="block transition-colors hover:text-foreground"
              >
                Join as Freelancer
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-10 flex flex-col gap-4 border-t pt-6 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between ">
          <p className="text-center md:text-left">
            © {new Date().getFullYear()} KhmerLance. All rights reserved.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-5 md:justify-end">
            <Link
              href="/privacy"
              className="transition-colors hover:text-foreground"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="transition-colors hover:text-foreground"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

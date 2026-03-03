"use client";

import { useRef, useState } from "react";
import { useAuthStore } from "@/store/auth";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { authApi, uploadApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircle, Loader2, Upload, UserCircle2 } from "lucide-react";
import Image from "next/image";
import { motion } from "framer-motion";
import { PageTransition } from "@/components/PageTransition";
import { AnimatedList, AnimatedItem } from "@/components/AnimatedList";

export default function SettingsPage() {
  const { loading: authLoading } = useRequireAuth();
  const { user, fetchUser } = useAuthStore();
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    name: user?.name ?? "",
    email: user?.email ?? "",
    currentPassword: "",
    newPassword: "",
    bio: user?.bio ?? "",
    skills: user?.skills ?? "",
    avatarUrl: user?.avatarUrl ?? "",
    notifEmail: user?.notifEmail ?? true,
    notifPush: user?.notifPush ?? true,
  });

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const update = (field: string, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Only image files are allowed.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("File size must not exceed 5 MB.");
      return;
    }
    setError("");
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleUploadAvatar = async () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const res = await uploadApi.uploadAvatar(file);
      const url = res.data.data.url;
      update("avatarUrl", url);
      setSuccess("Avatar uploaded! Click Save Changes to confirm.");
    } catch {
      setError("Avatar upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess("");
    setError("");
    try {
      await authApi.updateProfile({
        name: form.name || undefined,
        email: form.email || undefined,
        currentPassword: form.currentPassword || undefined,
        newPassword: form.newPassword || undefined,
        bio: form.bio || undefined,
        skills: form.skills || undefined,
        avatarUrl: form.avatarUrl || undefined,
        notifEmail: form.notifEmail,
        notifPush: form.notifPush,
      });
      await fetchUser();
      setForm((prev) => ({ ...prev, currentPassword: "", newPassword: "" }));
      setSuccess("Profile updated successfully!");
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Failed to save profile. Please try again.";
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || !user) return null;

  const displayAvatar = previewUrl ?? form.avatarUrl ?? null;

  return (
    <PageTransition>
      <div className="max-w-2xl mx-auto px-4 py-8">
        <motion.h1
          className="text-3xl font-bold text-foreground mb-8"
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
        >
          Settings
        </motion.h1>

        {success && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700 mb-6"
          >
            <CheckCircle className="size-4" />
            {success}
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 mb-6"
          >
            {error}
          </motion.div>
        )}

        <AnimatedList className="space-y-6">
          <AnimatedItem>
            <Card>
              <CardHeader>
                <CardTitle>Profile</CardTitle>
                <CardDescription>
                  Update your personal information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Avatar */}
                  <div className="space-y-3">
                    <Label>Profile Picture</Label>
                    <div className="flex items-center gap-4">
                      <motion.div
                        className="relative size-20 rounded-full overflow-hidden border bg-muted flex items-center justify-center shrink-0"
                        whileHover={{ scale: 1.05 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        {displayAvatar ? (
                          <Image
                            src={displayAvatar}
                            alt="Avatar preview"
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        ) : (
                          <UserCircle2 className="size-10 text-muted-foreground" />
                        )}
                      </motion.div>
                      <div className="flex flex-col gap-2">
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleFileChange}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          Choose Image
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          disabled={
                            uploading || !fileInputRef.current?.files?.length
                          }
                          onClick={handleUploadAvatar}
                        >
                          {uploading ? (
                            <>
                              <Loader2 className="mr-2 size-4 animate-spin" />
                              Uploading…
                            </>
                          ) : (
                            <>
                              <Upload className="mr-2 size-4" />
                              Upload
                            </>
                          )}
                        </Button>
                        <p className="text-xs text-muted-foreground">
                          JPG, PNG, GIF, WebP — max 5 MB
                        </p>
                      </div>
                    </div>
                  </div>

                  <Separator className="my-2" />

                  <div className="space-y-2">
                    <Label htmlFor="display-name">Display Name</Label>
                    <Input
                      id="display-name"
                      value={form.name}
                      onChange={(e) => update("name", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      value={form.bio}
                      onChange={(e) => update("bio", e.target.value)}
                      rows={4}
                      placeholder="Tell others about yourself…"
                      className="resize-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="skills">Skills (comma-separated)</Label>
                    <Input
                      id="skills"
                      value={form.skills}
                      onChange={(e) => update("skills", e.target.value)}
                      placeholder="React, Node.js, Figma"
                    />
                  </div>

                  <Separator className="my-2" />

                  <div>
                    <h3 className="font-semibold text-foreground mb-3">
                      Notifications
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Checkbox
                          id="notif-email"
                          checked={form.notifEmail}
                          onCheckedChange={(checked) =>
                            update("notifEmail", !!checked)
                          }
                        />
                        <Label htmlFor="notif-email" className="font-normal">
                          Email notifications
                        </Label>
                      </div>
                      <div className="flex items-center gap-3">
                        <Checkbox
                          id="notif-push"
                          checked={form.notifPush}
                          onCheckedChange={(checked) =>
                            update("notifPush", !!checked)
                          }
                        />
                        <Label htmlFor="notif-push" className="font-normal">
                          Push notifications
                        </Label>
                      </div>
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={saving}>
                    {saving && <Loader2 className="mr-2 size-4 animate-spin" />}
                    {saving ? "Saving…" : "Save Changes"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </AnimatedItem>

          <AnimatedItem>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Account</CardTitle>
                <CardDescription>
                  Update your email address or password
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={(e) => update("email", e.target.value)}
                  />
                </div>

                <Separator className="my-2" />

                <div className="space-y-2">
                  <Label htmlFor="current-password">Current Password</Label>
                  <Input
                    id="current-password"
                    type="password"
                    value={form.currentPassword}
                    onChange={(e) => update("currentPassword", e.target.value)}
                    placeholder="Required to change password"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input
                    id="new-password"
                    type="password"
                    value={form.newPassword}
                    onChange={(e) => update("newPassword", e.target.value)}
                    placeholder="Min 6 characters"
                  />
                </div>

                <Separator className="my-2" />

                <div className="text-sm text-muted-foreground">
                  <p>
                    Roles:{" "}
                    <span className="text-foreground">
                      {user.roles.map((r) => r.replace("ROLE_", "")).join(", ")}
                    </span>
                  </p>
                </div>
              </CardContent>
            </Card>
          </AnimatedItem>
        </AnimatedList>
      </div>
    </PageTransition>
  );
}

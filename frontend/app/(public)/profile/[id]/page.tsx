"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import api, { UserProfileData, ReviewData } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { PageTransition } from "@/components/PageTransition";
import { AnimatedList, AnimatedItem } from "@/components/AnimatedList";

export default function PublicProfilePage() {
  const { id } = useParams();
  const userId = Number(id);
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get(`/api/users/${userId}/profile`);
        setProfile(res.data.data);
      } catch {
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };
    if (userId) fetch();
  }, [userId]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 space-y-4">
        <div className="flex gap-6">
          <Skeleton className="size-20 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-foreground mb-4">
          User Not Found
        </h1>
        <Button variant="link" asChild>
          <Link href="/projects">Browse projects</Link>
        </Button>
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen flex flex-col max-w-3xl mx-auto px-4 py-8 space-y-6">
        {" "}
        {/* Profile header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start gap-6">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
                >
                  <Avatar className="size-20">
                    {profile.avatarUrl && (
                      <AvatarImage src={profile.avatarUrl} alt={profile.name} />
                    )}
                    <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
                      {profile.name?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                </motion.div>
                <motion.div
                  className="flex-1"
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15, duration: 0.35 }}
                >
                  <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-bold text-foreground">
                      {profile.name}
                    </h1>
                    {profile.isOnline && (
                      <span
                        className="size-3 bg-green-500 rounded-full"
                        title="Online"
                      />
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {profile.roles.map((r) => (
                      <Badge key={r} variant="secondary">
                        {r.replace("ROLE_", "")}
                      </Badge>
                    ))}
                  </div>
                  {profile.bio && (
                    <p className="text-muted-foreground mt-3">{profile.bio}</p>
                  )}
                  {profile.skills && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {profile.skills.split(",").map((skill) => (
                        <Badge
                          key={skill.trim()}
                          variant="outline"
                          className="font-normal"
                        >
                          {skill.trim()}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Rating */}
                  {profile.averageRating !== null && (
                    <div className="flex items-center gap-2 mt-4">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <span
                            key={star}
                            className={`text-lg ${
                              star <= Math.round(profile.averageRating!)
                                ? "text-yellow-400"
                                : "text-muted-foreground/30"
                            }`}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {profile.averageRating.toFixed(1)} (
                        {profile.reviewCount} reviews)
                      </span>
                    </div>
                  )}
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        {/* Reviews */}
        {profile.reviews && profile.reviews.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Reviews ({profile.reviewCount})</CardTitle>
              </CardHeader>
              <CardContent>
                <AnimatedList className="space-y-4">
                  {profile.reviews.map((review: ReviewData, i: number) => (
                    <AnimatedItem key={review.id}>
                      <div>
                        {i > 0 && <Separator className="mb-4" />}
                        <div className="flex items-center justify-between mb-1">
                          <Link
                            href={`/profile/${review.reviewerId}`}
                            className="font-medium text-primary hover:underline text-sm"
                          >
                            {review.reviewerName}
                          </Link>
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <span
                                key={star}
                                className={`text-sm ${
                                  star <= review.rating
                                    ? "text-yellow-400"
                                    : "text-muted-foreground/30"
                                }`}
                              >
                                ★
                              </span>
                            ))}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {review.comment}
                        </p>
                        {review.reply && (
                          <div className="mt-2 ml-4 pl-3 border-l-2 border-border">
                            <p className="text-sm text-muted-foreground">
                              <span className="font-medium text-foreground">
                                Reply:
                              </span>{" "}
                              {review.reply}
                            </p>
                          </div>
                        )}
                        <div className="text-xs text-muted-foreground/60 mt-1">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </AnimatedItem>
                  ))}
                </AnimatedList>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </PageTransition>
  );
}

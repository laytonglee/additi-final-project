"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  contractApi,
  messageApi,
  reviewApi,
  ContractData,
  MessageData,
  PageData,
} from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle, Send, Star } from "lucide-react";
import { motion } from "framer-motion";
import { PageTransition } from "@/components/PageTransition";

export default function ContractDetailPage() {
  useRequireAuth();
  const { id } = useParams();
  const contractId = Number(id);
  const { user } = useAuthStore();

  const [contract, setContract] = useState<ContractData | null>(null);
  const [messages, setMessages] = useState<MessageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [msgBody, setMsgBody] = useState("");
  const [sending, setSending] = useState(false);
  const [completingNote, setCompletingNote] = useState("");
  const [showComplete, setShowComplete] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isClient = user && contract && user.id === contract.clientId;
  const isFreelancer = user && contract && user.id === contract.freelancerId;

  useEffect(() => {
    const fetch = async () => {
      try {
        const cRes = await contractApi.getById(contractId);
        setContract(cRes.data.data);
        const mRes = await messageApi.getByContract(contractId, 0, 100);
        const page = mRes.data.data as PageData<MessageData>;
        setMessages(page.content);
        messageApi.markRead(contractId).catch(() => {});
      } catch {
        /* ignore */
      } finally {
        setLoading(false);
      }
    };
    if (contractId) fetch();
  }, [contractId]);

  useEffect(() => {
    if (!contractId) return;
    const interval = setInterval(async () => {
      try {
        const mRes = await messageApi.getByContract(contractId, 0, 100);
        const page = mRes.data.data as PageData<MessageData>;
        setMessages(page.content);
        messageApi.markRead(contractId).catch(() => {});
      } catch {
        /* ignore */
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [contractId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!msgBody.trim()) return;
    setSending(true);
    try {
      await messageApi.send(contractId, { body: msgBody.trim() });
      setMsgBody("");
      const mRes = await messageApi.getByContract(contractId, 0, 100);
      const page = mRes.data.data as PageData<MessageData>;
      setMessages(page.content);
    } catch {
      /* ignore */
    } finally {
      setSending(false);
    }
  };

  const handleComplete = async () => {
    try {
      await contractApi.complete(contractId, completingNote || undefined);
      const cRes = await contractApi.getById(contractId);
      setContract(cRes.data.data);
      setShowComplete(false);
    } catch {
      /* ignore */
    }
  };

  const handleReview = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await reviewApi.create(contractId, {
        rating: reviewRating,
        comment: reviewComment,
      });
      const cRes = await contractApi.getById(contractId);
      setContract(cRes.data.data);
      setShowReview(false);
    } catch {
      /* ignore */
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 space-y-4">
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-foreground">
          Contract Not Found
        </h1>
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Contract Info */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl mb-2">
                    {contract.projectTitle}
                  </CardTitle>
                  <div className="flex gap-4 text-sm text-muted-foreground">
                    <span>
                      Client:{" "}
                      <Link
                        href={`/profile/${contract.clientId}`}
                        className="text-primary hover:underline font-medium"
                      >
                        {contract.clientName}
                      </Link>
                    </span>
                    <span>
                      Freelancer:{" "}
                      <Link
                        href={`/profile/${contract.freelancerId}`}
                        className="text-primary hover:underline font-medium"
                      >
                        {contract.freelancerName}
                      </Link>
                    </span>
                    <span className="font-semibold text-foreground">
                      ${contract.agreedPrice}
                    </span>
                  </div>
                </div>
                <Badge
                  variant={
                    contract.status === "ACTIVE" ? "default" : "secondary"
                  }
                  className={
                    contract.status === "ACTIVE"
                      ? "bg-green-600 hover:bg-green-600"
                      : ""
                  }
                >
                  {contract.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {/* Actions */}
              <div className="flex flex-wrap gap-3">
                {contract.status === "ACTIVE" && isClient && (
                  <>
                    {!showComplete ? (
                      <Button onClick={() => setShowComplete(true)}>
                        <CheckCircle className="mr-2 size-4" />
                        Mark as Completed
                      </Button>
                    ) : (
                      <div className="w-full bg-green-50 dark:bg-green-950/20 rounded-lg p-4 space-y-3">
                        <Textarea
                          value={completingNote}
                          onChange={(e) => setCompletingNote(e.target.value)}
                          rows={2}
                          placeholder="Completion note (optional)"
                          className="resize-none"
                        />
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={handleComplete}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            Confirm Complete
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setShowComplete(false)}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}
                  </>
                )}

                {contract.status === "COMPLETED" &&
                  !contract.hasReview &&
                  (isClient || isFreelancer) && (
                    <Button
                      variant="secondary"
                      onClick={() => setShowReview(true)}
                    >
                      <Star className="mr-2 size-4" />
                      Leave a Review
                    </Button>
                  )}
              </div>

              {/* Review form */}
              {showReview && (
                <form
                  onSubmit={handleReview}
                  className="mt-4 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg p-4 space-y-3"
                >
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      Rating
                    </label>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReviewRating(star)}
                          className={`text-2xl transition-colors ${
                            star <= reviewRating
                              ? "text-yellow-400"
                              : "text-muted-foreground/30"
                          }`}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                  </div>
                  <Textarea
                    required
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    rows={3}
                    placeholder="Share your experience…"
                    className="resize-none"
                  />
                  <div className="flex gap-2">
                    <Button type="submit" size="sm">
                      Submit Review
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => setShowReview(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Chat */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.4 }}
        >
          <Card className="overflow-hidden">
            <CardHeader className="bg-muted/50 py-4">
              <CardTitle className="text-base">Messages</CardTitle>
            </CardHeader>

            {/* Messages list */}
            <div className="h-96 overflow-y-auto p-6 space-y-4">
              {messages.length === 0 ? (
                <div className="text-center text-muted-foreground py-16">
                  No messages yet. Start the conversation!
                </div>
              ) : (
                messages.map((msg) => {
                  const isMine = msg.senderId === user?.id;
                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-2xl px-4 py-2.5 ${
                          isMine
                            ? "bg-primary text-primary-foreground rounded-br-md"
                            : "bg-muted text-foreground rounded-bl-md"
                        }`}
                      >
                        {!isMine && (
                          <div className="text-xs font-medium mb-1 opacity-70">
                            {msg.senderName}
                          </div>
                        )}
                        <p className="text-sm whitespace-pre-wrap">
                          {msg.body}
                        </p>
                        <div
                          className={`text-xs mt-1 ${
                            isMine
                              ? "text-primary-foreground/60"
                              : "text-muted-foreground"
                          }`}
                        >
                          {new Date(msg.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message input */}
            {contract.status === "ACTIVE" && (
              <form
                onSubmit={handleSend}
                className="border-t px-4 py-3 flex gap-3"
              >
                <Input
                  value={msgBody}
                  onChange={(e) => setMsgBody(e.target.value)}
                  placeholder="Type a message…"
                  className="flex-1"
                />
                <Button
                  type="submit"
                  disabled={sending || !msgBody.trim()}
                  size="icon"
                >
                  <Send className="size-4" />
                </Button>
              </form>
            )}
          </Card>
        </motion.div>
      </div>
    </PageTransition>
  );
}

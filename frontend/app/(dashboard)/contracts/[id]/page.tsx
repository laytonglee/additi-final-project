"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  contractApi,
  messageApi,
  uploadApi,
  reviewApi,
  ContractData,
  MessageData,
  PageData,
} from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useTypingIndicator } from "@/hooks/useTypingIndicator";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  CheckCircle,
  Download,
  FileText,
  MessageSquare,
  Paperclip,
  Send,
  Star,
  X,
} from "lucide-react";
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
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const [attachmentUrl, setAttachmentUrl] = useState<string | null>(null);
  const [attachmentContentType, setAttachmentContentType] = useState<
    string | null
  >(null);
  const [uploadingAttachment, setUploadingAttachment] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
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

  // Real-time messages via WebSocket
  const handleWsMessage = useCallback(
    (payload: unknown) => {
      const msg = payload as MessageData;
      setMessages((prev) => {
        // Avoid duplicates (in case the REST response already added it)
        if (prev.some((m) => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
      // Mark as read if the message is from the other party
      if (msg.senderId !== user?.id) {
        messageApi.markRead(contractId).catch(() => {});
      }
    },
    [contractId, user?.id],
  );

  useWebSocket({
    topic: `/topic/contracts/${contractId}/messages`,
    onMessage: handleWsMessage,
    enabled: !!contractId && !loading,
  });

  // Real-time contract status updates (e.g. completion)
  const handleStatusUpdate = useCallback((payload: unknown) => {
    const data = payload as { status: string };
    setContract((prev) => (prev ? { ...prev, status: data.status } : prev));
  }, []);

  useWebSocket({
    topic: `/topic/contracts/${contractId}/status`,
    onMessage: handleStatusUpdate,
    enabled: !!contractId && !loading,
  });

  const { typingUsers, sendTyping } = useTypingIndicator(
    contractId,
    !!contractId && !loading,
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAttachmentFile(file);
    setUploadingAttachment(true);
    try {
      const res = await uploadApi.uploadAttachment(file);
      setAttachmentUrl(res.data.data.url);
      setAttachmentContentType(res.data.data.contentType);
    } catch {
      setAttachmentFile(null);
      setAttachmentUrl(null);
      setAttachmentContentType(null);
    } finally {
      setUploadingAttachment(false);
      // Reset input so the same file can be re-selected
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeAttachment = () => {
    setAttachmentFile(null);
    setAttachmentUrl(null);
    setAttachmentContentType(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleTypingChange = (value: string) => {
    setMsgBody(value);
    if (value.length > 0) {
      sendTyping(true);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => sendTyping(false), 2000);
    } else {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      sendTyping(false);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!msgBody.trim() && !attachmentUrl) return;
    setSending(true);
    // Stop typing indicator immediately
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    sendTyping(false);
    try {
      const res = await messageApi.send(contractId, {
        body: msgBody.trim() || " ",
        attachmentUrl: attachmentUrl ?? undefined,
      });
      setMsgBody("");
      removeAttachment();
      const sent = res.data.data as MessageData;
      setMessages((prev) =>
        prev.some((m) => m.id === sent.id) ? prev : [...prev, sent],
      );
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
      <div>
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!contract) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Contract Not Found
        </h1>
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="overflow-y-hidden">
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
                      <div className="w-full bg-green-50 dark:bg-green-950/20 rounded-lg  space-y-3">
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
          className="mt-4"
        >
          <Card className="overflow-hidden flex flex-col h-[calc(100vh-260px)]">
            {" "}
            <CardHeader className="border-b py-3 px-5">
              <CardTitle className="text-base flex items-center gap-2">
                <MessageSquare className="size-4" />
                Messages
              </CardTitle>
            </CardHeader>
            {/* Messages list */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
              {" "}
              {messages.length === 0 ? (
                <div className="text-center text-muted-foreground py-16">
                  <MessageSquare className="size-8 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">
                    No messages yet. Start the conversation!
                  </p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isMine = msg.senderId === user?.id;
                  const time = new Date(msg.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  });

                  if (isMine) {
                    return (
                      <div
                        key={msg.id}
                        className="flex flex-col items-end gap-1"
                      >
                        <div className="w-fit max-w-[70%] rounded-2xl rounded-br-sm bg-primary text-primary-foreground px-4 py-2.5 space-y-2">
                          {msg.body.trim() && (
                            <p className="text-sm whitespace-pre-wrap">
                              {msg.body}
                            </p>
                          )}
                          {msg.attachmentUrl && (
                            <AttachmentBubble
                              url={msg.attachmentUrl}
                              fileName={
                                msg.attachmentUrl.split("/").pop() ?? "file"
                              }
                              mine
                            />
                          )}
                        </div>
                        <span className="text-[11px] text-muted-foreground mr-1">
                          {time}
                        </span>
                      </div>
                    );
                  }

                  return (
                    <div key={msg.id} className="flex items-start gap-2.5">
                      <Avatar className="size-8 shrink-0 mt-0.5">
                        {msg.senderAvatarUrl && (
                          <AvatarImage src={msg.senderAvatarUrl} />
                        )}
                        <AvatarFallback className="text-[10px] bg-primary/10 text-primary font-semibold">
                          {msg.senderName
                            .split(" ")
                            .map((w: string) => w[0])
                            .join("")
                            .toUpperCase()
                            .slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col gap-1 max-w-[70%]">
                        <span className="text-xs font-medium text-muted-foreground">
                          {msg.senderName}
                        </span>
                        <div className="w-fit rounded-2xl rounded-bl-sm bg-muted px-4 py-2.5 space-y-2">
                          {msg.body.trim() && (
                            <p className="text-sm whitespace-pre-wrap text-foreground">
                              {msg.body}
                            </p>
                          )}
                          {msg.attachmentUrl && (
                            <AttachmentBubble
                              url={msg.attachmentUrl}
                              fileName={
                                msg.attachmentUrl.split("/").pop() ?? "file"
                              }
                            />
                          )}
                        </div>
                        <span className="text-[11px] text-muted-foreground ml-1">
                          {time}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>
            {/* Message input or disabled footer */}
            {contract.status === "ACTIVE" ? (
              <div className="border-t px-4 py-3 space-y-2">
                {/* Attachment preview chip */}
                {attachmentFile && (
                  <div className="flex items-center gap-2 bg-muted/60 rounded-lg px-3 py-1.5 text-sm">
                    {attachmentFile.type.startsWith("image/") ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={URL.createObjectURL(attachmentFile)}
                        alt="preview"
                        className="size-8 rounded object-cover shrink-0"
                      />
                    ) : (
                      <FileText className="size-4 shrink-0 text-muted-foreground" />
                    )}
                    <span className="flex-1 truncate text-foreground/70 text-xs">
                      {attachmentFile.name}
                    </span>
                    {uploadingAttachment ? (
                      <span className="text-xs text-muted-foreground animate-pulse">
                        Uploading…
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={removeAttachment}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <X className="size-3.5" />
                      </button>
                    )}
                  </div>
                )}

                {/* Typing indicator */}
                {typingUsers.length > 0 && (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground px-1">
                    <span className="flex gap-0.5">
                      <span className="w-1.5 h-1.5 bg-muted-foreground/60 rounded-full animate-bounce [animation-delay:0ms]" />
                      <span className="w-1.5 h-1.5 bg-muted-foreground/60 rounded-full animate-bounce [animation-delay:150ms]" />
                      <span className="w-1.5 h-1.5 bg-muted-foreground/60 rounded-full animate-bounce [animation-delay:300ms]" />
                    </span>
                    <span>
                      {typingUsers.map((u) => u.userName).join(", ")}{" "}
                      {typingUsers.length === 1 ? "is" : "are"} typing…
                    </span>
                  </div>
                )}

                {/* Input row */}
                <form onSubmit={handleSend} className="flex gap-2 items-center">
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
                    onChange={handleFileSelect}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
                    title="Attach file"
                  >
                    <Paperclip className="size-4" />
                  </button>
                  <Input
                    value={msgBody}
                    onChange={(e) => handleTypingChange(e.target.value)}
                    onBlur={() => sendTyping(false)}
                    placeholder="Type a message…"
                    className="flex-1"
                  />
                  <Button
                    type="submit"
                    disabled={
                      sending ||
                      (!msgBody.trim() && !attachmentUrl) ||
                      uploadingAttachment
                    }
                    size="icon"
                  >
                    <Send className="size-4" />
                  </Button>
                </form>
              </div>
            ) : (
              <div className="border-t px-4 py-3 text-center">
                <p className="text-sm text-muted-foreground">
                  This contract is{" "}
                  {contract.status.toLowerCase().replace("_", " ")} — messaging
                  is disabled.
                </p>
              </div>
            )}
          </Card>
        </motion.div>
      </div>
    </PageTransition>
  );
}

// ─────────────────────────────────────────────────
// AttachmentBubble — renders a file attachment inline
// ─────────────────────────────────────────────────
function AttachmentBubble({
  url,
  fileName,
  mine = false,
}: {
  url: string;
  fileName: string;
  mine?: boolean;
}) {
  const isImage = /\.(jpe?g|png|gif|webp|svg)$/i.test(url);

  if (isImage) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={url}
        alt={fileName}
        className="max-w-50 rounded-lg object-cover cursor-pointer"
        onClick={() => window.open(url, "_blank")}
      />
    );
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
        mine
          ? "bg-primary-foreground/10 hover:bg-primary-foreground/20 text-primary-foreground"
          : "bg-background hover:bg-muted-foreground/10 text-foreground"
      }`}
    >
      <FileText className="size-4 shrink-0" />
      <span className="max-w-37.5 truncate">{fileName}</span>
      <Download className="size-3.5 shrink-0 opacity-70" />
    </a>
  );
}

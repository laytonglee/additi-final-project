"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { contractApi, ContractData } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  FileText,
  CheckCircle,
  DollarSign,
  Clock,
  ArrowRight,
  Briefcase,
} from "lucide-react";
import { motion } from "framer-motion";
import { PageTransition } from "@/components/PageTransition";
import { AnimatedList, AnimatedItem } from "@/components/AnimatedList";

export default function ContractsPage() {
  useRequireAuth();
  const { user } = useAuthStore();
  const [contracts, setContracts] = useState<ContractData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await contractApi.getMy();
        setContracts(res.data.data);
      } catch {
        /* ignore */
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const active = contracts.filter((c) => c.status === "ACTIVE");
  const completed = contracts.filter((c) => c.status === "COMPLETED");
  const totalValue = contracts.reduce((sum, c) => sum + c.agreedPrice, 0);
  const completedValue = completed.reduce((sum, c) => sum + c.agreedPrice, 0);

  /* ── Stat card ────────────────────────────────── */
  function StatCard({
    title,
    value,
    icon,
  }: {
    title: string;
    value: string | number;
    icon: React.ReactNode;
  }) {
    return (
      <Card className="rounded-2xl">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardDescription>{title}</CardDescription>
          {icon}
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{value}</div>
        </CardContent>
      </Card>
    );
  }

  /* ── Contract row ─────────────────────────────── */
  function ContractCard({ contract }: { contract: ContractData }) {
    const isClient = user?.id === contract.clientId;
    const otherParty = isClient ? contract.freelancerName : contract.clientName;
    const otherPartyId = isClient ? contract.freelancerId : contract.clientId;
    const role = isClient ? "Client" : "Freelancer";

    return (
      <Link href={`/contracts/${contract.id}`}>
        <Card className="hover:shadow-md hover:border-primary/30 transition-all cursor-pointer group">
          <CardContent className="py-5">
            <div className="flex items-center justify-between gap-4">
              {/* Left: info */}
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors truncate text-base">
                  {contract.projectTitle}
                </h3>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground mt-1.5">
                  <span>
                    with{" "}
                    <span className="font-medium text-foreground">
                      {otherParty}
                    </span>
                  </span>
                  <span className="font-semibold text-foreground">
                    ${contract.agreedPrice.toLocaleString()}
                  </span>
                  <span className="hidden sm:inline">
                    Started {new Date(contract.startedAt).toLocaleDateString()}
                  </span>
                  {contract.completedAt && (
                    <span className="hidden sm:inline">
                      Completed{" "}
                      {new Date(contract.completedAt).toLocaleDateString()}
                    </span>
                  )}
                </div>

                {/* Role badge + review status */}
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline" className="text-xs">
                    {role}
                  </Badge>
                  {contract.status === "COMPLETED" && !contract.hasReview && (
                    <Badge
                      variant="secondary"
                      className="text-xs bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                    >
                      Review pending
                    </Badge>
                  )}
                  {contract.hasReview && (
                    <Badge
                      variant="secondary"
                      className="text-xs bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                    >
                      Reviewed
                    </Badge>
                  )}
                </div>
              </div>

              {/* Right: status + arrow */}
              <div className="flex items-center gap-3 shrink-0">
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
                <ArrowRight className="size-4 text-muted-foreground opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    );
  }

  /* ── Empty state ──────────────────────────────── */
  function EmptyState({ message }: { message: string }) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        <Briefcase className="mx-auto size-12 mb-4 opacity-30" />
        <p>{message}</p>
      </div>
    );
  }

  /* ── Loading skeleton ─────────────────────────── */
  if (loading) {
    return (
      <div className="w-full space-y-6">
        <Skeleton className="h-8 w-1/3" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="w-full">
        {/* Header */}
        <motion.div
          className="flex justify-between items-center mb-8"
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="text-3xl font-bold text-foreground">Contracts</h1>
        </motion.div>

        {/* Stats */}
        <AnimatedList className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="Total Contracts"
            value={contracts.length}
            icon={<FileText className="h-5 w-5 text-primary" />}
          />
          <StatCard
            title="Active"
            value={active.length}
            icon={<Clock className="h-5 w-5 text-yellow-600" />}
          />
          <StatCard
            title="Completed"
            value={completed.length}
            icon={<CheckCircle className="h-5 w-5 text-green-600" />}
          />
          <StatCard
            title="Total Value"
            value={`$${totalValue.toLocaleString()}`}
            icon={<DollarSign className="h-5 w-5 text-emerald-600" />}
          />
        </AnimatedList>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          <Tabs defaultValue="all">
            <TabsList>
              <TabsTrigger value="all">All ({contracts.length})</TabsTrigger>
              <TabsTrigger value="active">Active ({active.length})</TabsTrigger>
              <TabsTrigger value="completed">
                Completed ({completed.length})
              </TabsTrigger>
            </TabsList>

            {/* All contracts */}
            <TabsContent value="all" className="mt-4">
              {contracts.length === 0 ? (
                <EmptyState message="No contracts yet. Accept a proposal to get started!" />
              ) : (
                <AnimatedList className="space-y-3">
                  {contracts.map((c) => (
                    <AnimatedItem key={c.id}>
                      <ContractCard contract={c} />
                    </AnimatedItem>
                  ))}
                </AnimatedList>
              )}
            </TabsContent>

            {/* Active contracts */}
            <TabsContent value="active" className="mt-4">
              {active.length === 0 ? (
                <EmptyState message="No active contracts right now." />
              ) : (
                <AnimatedList className="space-y-3">
                  {active.map((c) => (
                    <AnimatedItem key={c.id}>
                      <ContractCard contract={c} />
                    </AnimatedItem>
                  ))}
                </AnimatedList>
              )}
            </TabsContent>

            {/* Completed contracts */}
            <TabsContent value="completed" className="mt-4">
              {completed.length === 0 ? (
                <EmptyState message="No completed contracts yet." />
              ) : (
                <AnimatedList className="space-y-3">
                  {completed.map((c) => (
                    <AnimatedItem key={c.id}>
                      <ContractCard contract={c} />
                    </AnimatedItem>
                  ))}
                </AnimatedList>
              )}
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </PageTransition>
  );
}

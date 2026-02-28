"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  proposalApi,
  contractApi,
  ProposalData,
  ContractData,
} from "@/lib/api";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Clock, CheckCircle, FileText, DollarSign } from "lucide-react";
import { motion } from "framer-motion";
import { PageTransition } from "@/components/PageTransition";
import { AnimatedList, AnimatedItem } from "@/components/AnimatedList";

export default function FreelancerDashboardPage() {
  useRequireAuth("FREELANCER");
  const [proposals, setProposals] = useState<ProposalData[]>([]);
  const [contracts, setContracts] = useState<ContractData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [propRes, contRes] = await Promise.all([
          proposalApi.getMy(),
          contractApi.getMy(),
        ]);
        setProposals(propRes.data.data);
        setContracts(contRes.data.data);
      } catch {
        /* ignore */
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const stats = {
    pending: proposals.filter((p) => p.status === "PENDING").length,
    accepted: proposals.filter((p) => p.status === "ACCEPTED").length,
    activeContracts: contracts.filter((c) => c.status === "ACTIVE").length,
    totalEarnings: contracts
      .filter((c) => c.status === "COMPLETED")
      .reduce((sum, c) => sum + c.agreedPrice, 0),
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        <Skeleton className="h-8 w-1/3" />
        <div className="grid grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="max-w-6xl mx-auto px-4 py-8">
        <motion.div
          className="flex justify-between items-center mb-8"
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="text-3xl font-bold text-foreground">
            Freelancer Dashboard
          </h1>
          <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
            <Button asChild>
              <Link href="/projects">
                <Search className="mr-2 size-4" />
                Browse Projects
              </Link>
            </Button>
          </motion.div>
        </motion.div>

        {/* Stats */}
        <AnimatedList className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            {
              label: "Pending Proposals",
              value: stats.pending,
              icon: Clock,
              color: "text-yellow-600",
            },
            {
              label: "Accepted",
              value: stats.accepted,
              icon: CheckCircle,
              color: "text-green-600",
            },
            {
              label: "Active Contracts",
              value: stats.activeContracts,
              icon: FileText,
              color: "text-primary",
            },
            {
              label: "Total Earnings",
              value: `$${stats.totalEarnings}`,
              icon: DollarSign,
              color: "text-emerald-600",
            },
          ].map((s) => (
            <AnimatedItem key={s.label}>
              <Card className="h-full">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <s.icon className={`size-5 ${s.color}`} />
                    <div>
                      <div className={`text-2xl font-bold ${s.color}`}>
                        {s.value}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {s.label}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </AnimatedItem>
          ))}
        </AnimatedList>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          <Tabs defaultValue="proposals">
            <TabsList>
              <TabsTrigger value="proposals">My Proposals</TabsTrigger>
              <TabsTrigger value="contracts">Contracts</TabsTrigger>
            </TabsList>

            <TabsContent value="proposals" className="mt-4">
              {proposals.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground">
                  <p className="mb-4">No proposals yet.</p>
                  <Button variant="link" asChild>
                    <Link href="/projects">Find projects to bid on →</Link>
                  </Button>
                </div>
              ) : (
                <AnimatedList className="space-y-3">
                  {proposals.map((p) => (
                    <AnimatedItem key={p.id}>
                      <Link href={`/projects/${p.projectId}`}>
                        <Card className="hover:shadow-md transition-shadow cursor-pointer">
                          <CardContent className="py-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <h3 className="font-semibold text-foreground">
                                  {p.projectTitle}
                                </h3>
                                <div className="text-sm text-muted-foreground mt-1">
                                  Offered: ${p.offeredPrice} ·{" "}
                                  {new Date(p.createdAt).toLocaleDateString()}
                                </div>
                              </div>
                              <Badge
                                variant={
                                  p.status === "PENDING"
                                    ? "secondary"
                                    : p.status === "ACCEPTED"
                                      ? "default"
                                      : "destructive"
                                }
                                className={
                                  p.status === "ACCEPTED"
                                    ? "bg-green-600 hover:bg-green-600"
                                    : ""
                                }
                              >
                                {p.status}
                              </Badge>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    </AnimatedItem>
                  ))}
                </AnimatedList>
              )}
            </TabsContent>

            <TabsContent value="contracts" className="mt-4">
              {contracts.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground">
                  No contracts yet. Get your proposals accepted!
                </div>
              ) : (
                <AnimatedList className="space-y-3">
                  {contracts.map((c) => (
                    <AnimatedItem key={c.id}>
                      <Link href={`/contracts/${c.id}`}>
                        <Card className="hover:shadow-md transition-shadow cursor-pointer">
                          <CardContent className="py-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <h3 className="font-semibold text-foreground">
                                  {c.projectTitle}
                                </h3>
                                <div className="text-sm text-muted-foreground mt-1">
                                  with {c.clientName} · ${c.agreedPrice}
                                </div>
                              </div>
                              <Badge
                                variant={
                                  c.status === "ACTIVE"
                                    ? "default"
                                    : "secondary"
                                }
                                className={
                                  c.status === "ACTIVE"
                                    ? "bg-green-600 hover:bg-green-600"
                                    : ""
                                }
                              >
                                {c.status}
                              </Badge>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
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

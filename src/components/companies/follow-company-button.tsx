"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Bell, BellOff } from "lucide-react";
import { toggleFollowCompany, listFollowedCompanies } from "@/lib/api/jobs";
import { Button } from "@/components/ui/button";

export function FollowCompanyButton({ companyId }: { companyId: string }) {
  const qc = useQueryClient();
  const [optimistic, setOptimistic] = useState(false);

  const { data: followed = [] } = useQuery({
    queryKey: ["followed-companies"],
    queryFn: listFollowedCompanies,
  });

  const isFollowing = followed.includes(companyId) || optimistic;

  const toggle = useMutation({
    mutationFn: () => toggleFollowCompany(companyId),
    onMutate: () => {
      setOptimistic((o) => !o);
      toast.success(isFollowing ? "Unfollowed company" : "Following company — you'll get alerts");
    },
    onSuccess: (next) => {
      setOptimistic(false);
      qc.setQueryData(["followed-companies"], next);
      qc.invalidateQueries({ queryKey: ["followed-companies"] });
    },
    onError: () => {
      setOptimistic(false);
      toast.error("Couldn't update follow status");
    },
  });

  return (
    <Button variant={isFollowing ? "secondary" : "outline"} onClick={() => toggle.mutate()}>
      {isFollowing ? <BellOff className="mr-2 size-4" aria-hidden /> : <Bell className="mr-2 size-4" aria-hidden />}
      {isFollowing ? "Following" : "Follow company"}
    </Button>
  );
}

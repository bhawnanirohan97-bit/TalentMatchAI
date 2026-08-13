"use client";

import { useRef, useState } from "react";
import { CheckCircle2, FileText, Loader2, Star, Trash2, UploadCloud } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { deleteResume, listResumes, setPrimaryResume, uploadResume } from "@/lib/api/candidates";
import { useAuth } from "@/lib/auth/session";
import { EmptyState, ErrorState } from "@/components/shared/states";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SkillBadge } from "@/components/shared/badges";
import { formatDateShort, formatBytes } from "@/lib/utils";
import { RESUME_STATUS } from "@/domain/enums";

const STATUS_LABEL: Record<string, string> = {
  [RESUME_STATUS.READY]: "Ready",
  [RESUME_STATUS.PROCESSING]: "Processing",
  [RESUME_STATUS.UPLOADING]: "Uploading",
  [RESUME_STATUS.FAILED]: "Failed",
  [RESUME_STATUS.MALWARE_REJECTED]: "Rejected",
};

export default function ResumesPage() {
  const { user } = useAuth();
  const uid = user?.id ?? "";
  const qc = useQueryClient();
  const fileInput = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["resumes", uid],
    queryFn: () => listResumes(uid),
    enabled: Boolean(uid),
  });

  const upload = useMutation({
    mutationFn: (file: File) => uploadResume(uid, { name: file.name, type: file.type, size: file.size }),
    onSuccess: () => {
      toast.success("Resume uploaded — parsing started");
      qc.invalidateQueries({ queryKey: ["resumes", uid] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Upload failed"),
    onSettled: () => setUploading(false),
  });

  const setPrimary = useMutation({
    mutationFn: (id: string) => setPrimaryResume(id),
    onSuccess: () => {
      toast.success("Primary resume updated");
      qc.invalidateQueries({ queryKey: ["resumes", uid] });
    },
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteResume(id),
    onSuccess: () => {
      toast.success("Resume deleted");
      qc.invalidateQueries({ queryKey: ["resumes", uid] });
    },
  });

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setUploading(true);
      upload.mutate(file);
    }
    e.target.value = "";
  }

  const resumes = data ?? [];

  return (
    <div className="space-y-6">
      <PageHeader title="Resumes" description="Upload a PDF or DOCX. AI parses skills and experience automatically.">
        <input ref={fileInput} type="file" accept=".pdf,.docx" className="hidden" onChange={handleFile} />
        <Button onClick={() => fileInput.current?.click()} disabled={uploading}>
          {uploading ? <Loader2 className="mr-2 size-4 animate-spin" aria-hidden /> : <UploadCloud className="mr-2 size-4" aria-hidden />}
          Upload resume
        </Button>
      </PageHeader>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="size-8 animate-spin rounded-full border-2 border-muted border-t-primary" aria-label="Loading" />
        </div>
      ) : isError ? (
        <ErrorState onRetry={() => refetch()} />
      ) : resumes.length === 0 ? (
        <div className="rounded-lg border bg-card">
          <EmptyState
            icon="inbox"
            title="No resumes yet"
            description="Upload your first resume to start applying."
            action={<Button onClick={() => fileInput.current?.click()}><UploadCloud className="mr-2 size-4" aria-hidden /> Upload resume</Button>}
          />
        </div>
      ) : (
        <div className="divide-y rounded-lg border bg-card">
          {resumes.map((resume) => (
            <div key={resume.id} className="p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="flex size-9 items-center justify-center rounded-md border bg-muted/40">
                    <FileText className="size-4 text-muted-foreground" aria-hidden />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold">{resume.fileName}</p>
                      {resume.isPrimary && <Badge variant="secondary" className="gap-1"><Star className="size-3 fill-primary text-primary" aria-hidden /> Primary</Badge>}
                      <Badge variant="outline">{STATUS_LABEL[resume.status]}</Badge>
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {formatBytes(resume.sizeBytes)} · Uploaded {formatDateShort(resume.uploadedAt)}
                      {resume.processedAt ? ` · Parsed ${formatDateShort(resume.processedAt)}` : ""}
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 gap-2">
                  {resume.status === RESUME_STATUS.READY && (
                    <Button variant="outline" size="sm" onClick={() => setPrimary.mutate(resume.id)} disabled={resume.isPrimary}>
                      Make primary
                    </Button>
                  )}
                  <Button variant="ghost" size="icon" className="size-8" aria-label="Delete resume" onClick={() => remove.mutate(resume.id)}>
                    <Trash2 className="size-4 text-muted-foreground" aria-hidden />
                  </Button>
                </div>
              </div>

              {resume.status === RESUME_STATUS.READY && resume.structured && (resume.structured.skills.length > 0 || resume.structured.education.length > 0) && (
                <div className="mt-4 border-t pt-4">
                  <p className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                    <CheckCircle2 className="size-3.5 text-emerald-500" aria-hidden /> Extracted by AI
                  </p>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {resume.structured.skills.slice(0, 8).map((skill) => <SkillBadge key={skill}>{skill}</SkillBadge>)}
                    {resume.structured.skills.length > 8 && <SkillBadge>+{resume.structured.skills.length - 8}</SkillBadge>}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

-- AlterTable
ALTER TABLE "Prompt" ADD COLUMN "teamId" TEXT;
ALTER TABLE "PromptVersion" ADD COLUMN "teamId" TEXT;
ALTER TABLE "PromptExecution" ADD COLUMN "teamId" TEXT;

-- Backfill teamId from owner and parent prompt
UPDATE "Prompt" p
SET "teamId" = u."teamId"
FROM "User" u
WHERE p."userId" = u."id"
  AND p."teamId" IS NULL;

UPDATE "PromptVersion" pv
SET "teamId" = p."teamId"
FROM "Prompt" p
WHERE pv."promptId" = p."id"
  AND pv."teamId" IS NULL;

UPDATE "PromptExecution" pe
SET "teamId" = p."teamId"
FROM "Prompt" p
WHERE pe."promptId" = p."id"
  AND pe."teamId" IS NULL;

-- CreateIndex
CREATE INDEX "Prompt_teamId_idx" ON "Prompt"("teamId");
CREATE INDEX "PromptVersion_teamId_idx" ON "PromptVersion"("teamId");
CREATE INDEX "PromptExecution_teamId_idx" ON "PromptExecution"("teamId");

-- AddForeignKey
ALTER TABLE "Prompt"
ADD CONSTRAINT "Prompt_teamId_fkey"
FOREIGN KEY ("teamId") REFERENCES "Team"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "PromptVersion"
ADD CONSTRAINT "PromptVersion_teamId_fkey"
FOREIGN KEY ("teamId") REFERENCES "Team"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "PromptExecution"
ADD CONSTRAINT "PromptExecution_teamId_fkey"
FOREIGN KEY ("teamId") REFERENCES "Team"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

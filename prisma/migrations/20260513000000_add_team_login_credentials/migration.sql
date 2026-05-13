ALTER TABLE "Team"
ADD COLUMN "teamLoginId" TEXT,
ADD COLUMN "teamPasswordHash" TEXT;

UPDATE "Team"
SET "teamLoginId" = "id"
WHERE "teamLoginId" IS NULL;

CREATE UNIQUE INDEX "Team_teamLoginId_key" ON "Team"("teamLoginId");

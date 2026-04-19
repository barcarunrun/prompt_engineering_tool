-- CreateTable
CREATE TABLE "TargetTextSet" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "texts" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TargetTextSet_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "TargetTextSet" ADD CONSTRAINT "TargetTextSet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

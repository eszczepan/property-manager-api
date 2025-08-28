-- CreateTable
CREATE TABLE "public"."Property" (
    "id" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "street" TEXT NOT NULL,
    "state" VARCHAR(2) NOT NULL,
    "zipCode" VARCHAR(5) NOT NULL,
    "lat" DOUBLE PRECISION NOT NULL,
    "long" DOUBLE PRECISION NOT NULL,
    "weatherData" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Property_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Property_city_idx" ON "public"."Property"("city");

-- CreateIndex
CREATE INDEX "Property_state_idx" ON "public"."Property"("state");

-- CreateIndex
CREATE INDEX "Property_zipCode_idx" ON "public"."Property"("zipCode");

-- CreateIndex
CREATE INDEX "Property_createdAt_idx" ON "public"."Property"("createdAt");

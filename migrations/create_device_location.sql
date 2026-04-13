CREATE TABLE IF NOT EXISTS "deviceLocation" (
  "id" text PRIMARY KEY NOT NULL,
  "userId" text,
  "deviceId" text NOT NULL,
  "latitude" text NOT NULL,
  "longitude" text NOT NULL,
  "lastSeen" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "deviceLocation_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
);

CREATE INDEX IF NOT EXISTS "deviceLocation_deviceId_idx" ON "deviceLocation" ("deviceId");
CREATE INDEX IF NOT EXISTS "deviceLocation_lastSeen_idx" ON "deviceLocation" ("lastSeen");

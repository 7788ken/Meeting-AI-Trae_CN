-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "recording_quality" TEXT NOT NULL DEFAULT 'medium',
    "transcription_language" TEXT NOT NULL DEFAULT 'zh-CN',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "started_at" TIMESTAMP(3),
    "ended_at" TIMESTAMP(3),
    "duration" INTEGER,
    "speakers_count" INTEGER DEFAULT 0,
    "speeches_count" INTEGER DEFAULT 0,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "speakers" (
    "id" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT '#1890ff',
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "speakers_pkey" PRIMARY KEY ("id")
);

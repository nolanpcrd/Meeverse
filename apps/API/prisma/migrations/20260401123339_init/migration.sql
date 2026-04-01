-- CreateEnum
CREATE TYPE "CommunityRole" AS ENUM ('ADMIN', 'MODERATOR', 'MEMBER');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('YEAH_POST', 'YEAH_COMMENT', 'COMMENT', 'FOLLOW');

-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('PENDING', 'REVIEWED', 'ACTION_TAKEN', 'DISMISSED');

-- CreateEnum
CREATE TYPE "ReportReason" AS ENUM ('SPAM', 'HARASSMENT', 'HATE_SPEECH', 'NSFW', 'VIOLENCE', 'IMPERSONATION', 'MISINFORMATION', 'OTHER');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "bio" TEXT,
    "avatarUrl" TEXT,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Community" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "iconUrl" TEXT,
    "bannerUrl" TEXT,
    "gameTitle" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Community_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommunityMember" (
    "userId" TEXT NOT NULL,
    "communityId" TEXT NOT NULL,
    "role" "CommunityRole" NOT NULL DEFAULT 'MEMBER',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CommunityMember_pkey" PRIMARY KEY ("userId","communityId")
);

-- CreateTable
CREATE TABLE "Post" (
    "id" TEXT NOT NULL,
    "content" TEXT,
    "imageUrl" TEXT,
    "drawingUrl" TEXT,
    "isSpoiler" BOOLEAN NOT NULL DEFAULT false,
    "authorId" TEXT NOT NULL,
    "communityId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Comment" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Yeah" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "postId" TEXT,
    "commentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Yeah_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Follow" (
    "followerId" TEXT NOT NULL,
    "followingId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Follow_pkey" PRIMARY KEY ("followerId","followingId")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "userId" TEXT NOT NULL,
    "fromId" TEXT NOT NULL,
    "postId" TEXT,
    "commentId" TEXT,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Report" (
    "id" TEXT NOT NULL,
    "reporterId" TEXT NOT NULL,
    "targetUserId" TEXT,
    "postId" TEXT,
    "commentId" TEXT,
    "reason" "ReportReason" NOT NULL,
    "details" TEXT,
    "status" "ReportStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Account_userId_idx" ON "Account"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE INDEX "CommunityMember_communityId_idx" ON "CommunityMember"("communityId");

-- CreateIndex
CREATE INDEX "Post_communityId_createdAt_idx" ON "Post"("communityId", "createdAt");

-- CreateIndex
CREATE INDEX "Post_authorId_idx" ON "Post"("authorId");

-- CreateIndex
CREATE INDEX "Comment_postId_createdAt_idx" ON "Comment"("postId", "createdAt");

-- CreateIndex
CREATE INDEX "Comment_authorId_idx" ON "Comment"("authorId");

-- CreateIndex
CREATE INDEX "Yeah_postId_idx" ON "Yeah"("postId");

-- CreateIndex
CREATE INDEX "Yeah_commentId_idx" ON "Yeah"("commentId");

-- CreateIndex
CREATE INDEX "Yeah_userId_createdAt_idx" ON "Yeah"("userId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Yeah_userId_postId_key" ON "Yeah"("userId", "postId");

-- CreateIndex
CREATE UNIQUE INDEX "Yeah_userId_commentId_key" ON "Yeah"("userId", "commentId");

-- CreateIndex
CREATE INDEX "Follow_followingId_idx" ON "Follow"("followingId");

-- CreateIndex
CREATE INDEX "Notification_userId_read_createdAt_idx" ON "Notification"("userId", "read", "createdAt");

-- CreateIndex
CREATE INDEX "Notification_fromId_createdAt_idx" ON "Notification"("fromId", "createdAt");

-- CreateIndex
CREATE INDEX "Report_reporterId_createdAt_idx" ON "Report"("reporterId", "createdAt");

-- CreateIndex
CREATE INDEX "Report_targetUserId_createdAt_idx" ON "Report"("targetUserId", "createdAt");

-- CreateIndex
CREATE INDEX "Report_postId_createdAt_idx" ON "Report"("postId", "createdAt");

-- CreateIndex
CREATE INDEX "Report_commentId_createdAt_idx" ON "Report"("commentId", "createdAt");

-- CreateIndex
CREATE INDEX "Report_status_createdAt_idx" ON "Report"("status", "createdAt");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommunityMember" ADD CONSTRAINT "CommunityMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommunityMember" ADD CONSTRAINT "CommunityMember_communityId_fkey" FOREIGN KEY ("communityId") REFERENCES "Community"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_communityId_fkey" FOREIGN KEY ("communityId") REFERENCES "Community"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Yeah" ADD CONSTRAINT "Yeah_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Yeah" ADD CONSTRAINT "Yeah_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Yeah" ADD CONSTRAINT "Yeah_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "Comment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Follow" ADD CONSTRAINT "Follow_followerId_fkey" FOREIGN KEY ("followerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Follow" ADD CONSTRAINT "Follow_followingId_fkey" FOREIGN KEY ("followingId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_fromId_fkey" FOREIGN KEY ("fromId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "Comment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_targetUserId_fkey" FOREIGN KEY ("targetUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "Comment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Add description and postedBy to GalleryItem
ALTER TABLE "GalleryItem" ADD COLUMN "description" TEXT;
ALTER TABLE "GalleryItem" ADD COLUMN "postedById" TEXT;
ALTER TABLE "GalleryItem" ADD CONSTRAINT "GalleryItem_postedById_fkey" FOREIGN KEY ("postedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

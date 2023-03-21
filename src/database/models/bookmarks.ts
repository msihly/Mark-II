import { model, Schema } from "mongoose";

export interface Bookmark {
  dateCreated: string;
  dateModified: string;
  id: string;
  imageHash: string;
  imagePath: string;
  isArchived: boolean;
  originalTitle: string;
  pageUrl: string;
  rating: number;
  tagIds: string[];
  title: string;
}

const BookmarkSchema = new Schema<Bookmark>({
  dateCreated: String,
  dateModified: String,
  imageHash: String,
  imagePath: String,
  isArchived: Boolean,
  originalTitle: String,
  pageUrl: String,
  rating: Number,
  tagIds: [String],
  title: String,
});

BookmarkSchema.index({ imageHash: 1 });

BookmarkSchema.set("toJSON", {
  transform: (_, ret) => {
    delete ret._id;
    delete ret.__v;
  },
  virtuals: true,
});

export const BookmarkModel = model<Bookmark>("Bookmark", BookmarkSchema);

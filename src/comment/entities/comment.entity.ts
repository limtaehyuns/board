export class Comment {
  id: number;
  postId: number;
  userId: number;

  content: string;
  createdAt: Date;
  parentId?: number;
}

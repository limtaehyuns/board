export class Post {
  id: number;
  userId: number;
  boardId: number;
  isNotice: boolean;

  viewCount: number;

  title: string;
  content: string;
  imageSrc: string | null;
  createdAt: Date;
}

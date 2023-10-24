export class GetPostDto {
  id: number;
  userId: number;
  boardId: number;
  isNotice: boolean;

  viewCount: number;

  title: string;
  content: string;
  imageSrc: string | null;
  createdAt: Date;

  rate: {
    like: number;
    dislike: number;
  };

  author: {
    id: number;
    nickname: string;
  };
}

export interface PostPayload {
  title: string;
}

export interface Post extends PostPayload {
  id: number;
}

export interface CommentPayload {
  postId: number;
  body: string;
}

export interface Comment extends CommentPayload {
  id: number;
}

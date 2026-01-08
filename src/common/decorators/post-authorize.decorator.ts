import { SetMetadata } from '@nestjs/common';

export const POST_AUTHORIZE_KEY = 'post_authorize';

export const PostAuthorize = <T>(
  predicate: (data: T, context: { user: any }) => boolean,
) => SetMetadata(POST_AUTHORIZE_KEY, predicate);

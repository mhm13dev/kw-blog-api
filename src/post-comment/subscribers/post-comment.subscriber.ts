import {
  EntitySubscriberInterface,
  EventSubscriber,
  RemoveEvent,
} from 'typeorm';
import { PostComment } from '../entities';

/**
 * Subscribes to `PostComment` entity events.
 */
@EventSubscriber()
export class PostCommentSubscriber
  implements EntitySubscriberInterface<PostComment>
{
  /**
   * Indicates that this subscriber only listen to `PostComment` events.
   */
  listenTo() {
    return PostComment;
  }

  /**
   * This method is called before the `PostComment` entity is removed.
   *
   * We are using `manager.deleteMany()` method which will delete all `PostComment` nested under the `PostComment being deleted` without triggering the `PostCommentSubscriber` repeatedly.
   *
   * To find the nested comments, we are using a recursive function that finds all the children of the deleting `PostComment` and then deletes them in one DB query.
   */
  async beforeRemove(event: RemoveEvent<PostComment>) {
    if (!event.entity) {
      return;
    }
    const deletingCommentId = event.entity.id;
    const commentIdsToDelete: string[] = [];
    const postCommentRepository = event.manager.getMongoRepository(PostComment);

    // Get all the children of the deleting comment
    async function recurse(commentId: string) {
      const comments: Pick<PostComment, 'id'>[] =
        await postCommentRepository.find({
          where: {
            reply_to_comment_id: commentId,
          },
          select: ['id'],
        });
      if (comments.length === 0) {
        return;
      }
      for (const comment of comments) {
        commentIdsToDelete.push(comment.id);
        await recurse(comment.id);
      }
    }

    await recurse(deletingCommentId);

    // Delete all children comments
    await postCommentRepository.deleteMany({
      id: { $in: commentIdsToDelete },
    });
  }
}

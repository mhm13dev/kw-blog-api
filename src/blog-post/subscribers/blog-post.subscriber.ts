import {
  EntitySubscriberInterface,
  EventSubscriber,
  RemoveEvent,
} from 'typeorm';
import { PostComment } from 'src/post-comment/entities';
import { BlogPost } from '../entities';

/**
 * Subscribes to `BlogPost` entity events.
 */
@EventSubscriber()
export class BlogPostSubscriber implements EntitySubscriberInterface<BlogPost> {
  /**
   * Indicates that this subscriber only listen to `BlogPost` events.
   */
  listenTo() {
    return BlogPost;
  }

  /**
   * This method is called before the `BlogPost` entity is removed.
   *
   * We are using `manager.delete()` method which will delete all `PostComment` associated with the `BlogPost` being deleted without triggering the `PostCommentSubscriber`.
   *
   * We don't load the `PostComment`s into memory before deleting them, like we do for `manager.remove()` method. This is more efficient.
   */
  async beforeRemove(event: RemoveEvent<BlogPost>) {
    await event.manager.delete(PostComment, {
      post_id: event.entity?._id,
    });
  }
}

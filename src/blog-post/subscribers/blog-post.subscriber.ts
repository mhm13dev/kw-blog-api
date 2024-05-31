import {
  EntitySubscriberInterface,
  EventSubscriber,
  RemoveEvent,
} from 'typeorm';
import { PostComment } from 'src/post-comment/entities';
import { BlogPost } from '../entities';

@EventSubscriber()
export class BlogPostSubscriber implements EntitySubscriberInterface<BlogPost> {
  /**
   * Indicates that this subscriber only listen to BlogPost events.
   */
  listenTo() {
    return BlogPost;
  }

  async beforeRemove(event: RemoveEvent<BlogPost>) {
    /*
     * This will delete all comments associated to the post being deleted without triggering the PostCommentSubscriber.
     * Also, we don't need to load the comments into memory before deleting them (like we do for remove() method).
     */
    await event.manager.delete(PostComment, {
      post_id: event.entity._id,
    });
  }
}

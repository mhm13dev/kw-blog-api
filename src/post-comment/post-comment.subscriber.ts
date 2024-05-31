import { ElasticsearchService } from '@nestjs/elasticsearch';
import {
  DataSource,
  EntitySubscriberInterface,
  EventSubscriber,
  RemoveEvent,
} from 'typeorm';
import { ES_POST_COMMENTS_INDEX } from './constants';
import { PostComment } from './entities';

/**
 * Subscribes to `PostComment` entity events.
 */
@EventSubscriber()
export class PostCommentSubscriber
  implements EntitySubscriberInterface<PostComment>
{
  constructor(
    dataSource: DataSource,
    private readonly elasticsearchService: ElasticsearchService,
  ) {
    dataSource.subscribers.push(this);
  }

  listenTo() {
    return PostComment;
  }

  /**
   * This method is called before the `PostComment` entity is removed.
   *
   * It will delete the `PostComment` and all it's children recursively from the Elasticsearch index.
   */
  async afterRemove(event: RemoveEvent<PostComment>) {
    await this.deleteNestedPostComments([event.entityId]);
  }

  /**
   * Delete `PostComment` and all it's children upto N levels
   * @param postCommentIdsToDelete - List of PostComment IDs to delete
   */
  private async deleteNestedPostComments(
    postCommentIdsToDelete: string[],
  ): Promise<void> {
    // Delete the `PostComments` from elasticsearch
    await this.elasticsearchService.deleteByQuery({
      index: [ES_POST_COMMENTS_INDEX],
      body: {
        query: {
          terms: {
            id: postCommentIdsToDelete,
          },
        },
      },
    });

    // Get all the `PostComments` which have the matching parent_comment_id
    const postComments = await this.elasticsearchService.search({
      index: ES_POST_COMMENTS_INDEX,
      body: {
        query: {
          terms: {
            parent_comment_id: postCommentIdsToDelete,
          },
        },
        fields: ['id'],
      },
    });

    // Get the IDs from the search result
    postCommentIdsToDelete = postComments.hits.hits.map(
      (comment) => comment._id,
    );

    // Recursively delete the nested `PostComments`
    if (postCommentIdsToDelete.length > 0) {
      await this.deleteNestedPostComments(postCommentIdsToDelete);
    }
  }
}

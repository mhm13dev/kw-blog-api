import { ElasticsearchService } from '@nestjs/elasticsearch';
import {
  DataSource,
  EntitySubscriberInterface,
  EventSubscriber,
  RemoveEvent,
} from 'typeorm';
import { ES_POST_COMMENTS_INDEX } from './constants';
import { PostComment } from './entities';

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

  async afterRemove(event: RemoveEvent<PostComment>) {
    await this.deleteNestedPostComments([event.entityId]);
  }

  /**
   * Delete all the nested PostComments of the deleted PostComment upto N levels
   * @param postCommentIdsToDelete - List of PostComment IDs to delete
   */
  private async deleteNestedPostComments(
    postCommentIdsToDelete: string[],
  ): Promise<void> {
    // Delete the PostComments from elasticsearch
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

    // Get all the PostComments which have the match the parent comment ID
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

    // Get the comment IDs from the search result
    postCommentIdsToDelete = postComments.hits.hits.map(
      (comment) => comment._id,
    );

    // Recursively delete the nested PostComments
    if (postCommentIdsToDelete.length > 0) {
      await this.deleteNestedPostComments(postCommentIdsToDelete);
    }
  }
}

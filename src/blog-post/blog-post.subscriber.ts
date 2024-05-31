import { ElasticsearchService } from '@nestjs/elasticsearch';
import {
  DataSource,
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
  RemoveEvent,
  UpdateEvent,
} from 'typeorm';
import { ES_POST_COMMENTS_INDEX } from 'src/post-comment/constants';
import { ES_BLOG_POSTS_INDEX } from './constants';
import { BlogPost } from './entities';

/**
 * Subscribes to `BlogPost` entity events.
 */
@EventSubscriber()
export class BlogPostSubscriber implements EntitySubscriberInterface<BlogPost> {
  constructor(
    dataSource: DataSource,
    private readonly elasticsearchService: ElasticsearchService,
  ) {
    dataSource.subscribers.push(this);
  }

  listenTo() {
    return BlogPost;
  }

  /**
   * This method is called after the `BlogPost` entity is inserted.
   *
   * It indexes the `BlogPost` in Elasticsearch.
   */
  afterInsert(event: InsertEvent<BlogPost>) {
    this.indexBlogPost(event.entity);
  }

  /**
   * This method is called after the `BlogPost` entity is updated.
   *
   * It updates the `BlogPost` in Elasticsearch.
   */
  afterUpdate(event: UpdateEvent<BlogPost>) {
    if (event.entity instanceof BlogPost) {
      this.indexBlogPost(event.entity);
    }
  }

  /**
   * This method is called after the `BlogPost` entity is removed.
   *
   * It deletes the `BlogPost` and its related `PostComments` from the Elasticsearch index.
   */
  afterRemove(event: RemoveEvent<BlogPost>) {
    this.elasticsearchService.deleteByQuery({
      index: [ES_BLOG_POSTS_INDEX, ES_POST_COMMENTS_INDEX],
      body: {
        query: {
          dis_max: {
            queries: [
              { term: { id: event.entityId } },
              { term: { post_id: event.entityId } },
            ],
          },
        },
      },
    });
  }

  /**
   * Index `BlogPost` in Elasticsearch
   * @param blogPost - `BlogPost` object with populated `author`
   */
  indexBlogPost(blogPost: BlogPost) {
    this.elasticsearchService.update({
      index: ES_BLOG_POSTS_INDEX,
      id: blogPost.id,
      doc: {
        id: blogPost.id,
        title: blogPost.title,
        content: blogPost.content,
        author: {
          id: blogPost.author.id,
          name: blogPost.author.name,
        },
      },
      doc_as_upsert: true,
    });
  }
}

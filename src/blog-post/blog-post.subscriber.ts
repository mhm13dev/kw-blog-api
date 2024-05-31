import { ElasticsearchService } from '@nestjs/elasticsearch';
import {
  DataSource,
  EntitySubscriberInterface,
  EventSubscriber,
  RemoveEvent,
} from 'typeorm';
import { ES_POST_COMMENTS_INDEX } from 'src/post-comment/constants';
import { ES_BLOG_POSTS_INDEX } from './constants';
import { BlogPost } from './entities';

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

  async afterRemove(event: RemoveEvent<BlogPost>) {
    await this.elasticsearchService.deleteByQuery({
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
}

import { kanbanEmitter } from '~/server/kanbanEvents';
import { createEventStream, sendStream } from 'h3';

export default defineEventHandler((event) => {
  const id = event.context.params!.id as string;
  const stream = createEventStream();

  const handler = (board: any) => {
    if (board.id === id) {
      stream.push(JSON.stringify(board));
    }
  };

  kanbanEmitter.on('update', handler);
  event.node.res.on('close', () => {
    kanbanEmitter.off('update', handler);
    stream.close();
  });

  return sendStream(event, stream); 
});

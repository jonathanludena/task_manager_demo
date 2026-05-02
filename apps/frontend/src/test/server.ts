import { setupServer } from 'msw/node';
import { handlers } from './handlers/taskHandlers';

export const server = setupServer(...handlers);

import { setupWorker } from 'msw/browser';
import { handlers } from '@/test/handlers/taskHandlers';

export const worker = setupWorker(...handlers);

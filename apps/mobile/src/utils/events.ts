// src/utils/events.ts
import mitt from 'mitt';

type Events = {
  logout: void;
};

export const emitter = mitt<Events>();

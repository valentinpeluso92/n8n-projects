import {Client} from '../model/client';

export interface ClientWithId extends Client {
  id: string;
}

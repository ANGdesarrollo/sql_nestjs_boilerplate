import { JwtPayload } from './JwtPayload';

export interface RequestWithUserPayload extends Request {
  user: JwtPayload;
}

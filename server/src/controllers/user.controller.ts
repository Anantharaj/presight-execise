import type { Request, Response } from 'express';
import {
  userFiltersSchema,
  userListQuerySchema,
  type PaginatedResponse,
  type User,
  type UserFacets,
} from '@presight/shared';
import type { UserService } from '../services/user.service';

/** HTTP adapter: validates input, delegates to the service, shapes the response. */
export class UserController {
  constructor(private readonly userService: UserService) {}

  list = (req: Request, res: Response<PaginatedResponse<User>>) => {
    const query = userListQuerySchema.parse(req.query);
    res.json(this.userService.listUsers(query));
  };

  facets = (req: Request, res: Response<UserFacets>) => {
    const filters = userFiltersSchema.parse(req.query);
    res.json(this.userService.getFacets(filters));
  };
}

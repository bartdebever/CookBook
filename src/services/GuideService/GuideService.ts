import { COOKBOOK, GUIDE } from '../../constants/constants';
import { BaseService } from '../BaseService';

export default class GuideService extends BaseService {
  route: any;

  constructor(cookbook) {
    const route = `${COOKBOOK.route}/${cookbook}${GUIDE.route}`;
    super(route);
    this.route = route;
  }
}

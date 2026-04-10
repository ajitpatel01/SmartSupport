import * as billingService from './billing.service.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { asyncWrapper } from '../../utils/asyncWrapper.js';

export const summary = asyncWrapper(async (req, res) => {
  const data = await billingService.getBillingSummary(req.user.orgId);
  ApiResponse.success(res, data);
});

export const checkout = asyncWrapper(async (req, res) => {
  const data = await billingService.createCheckoutPlaceholder();
  ApiResponse.success(res, data);
});

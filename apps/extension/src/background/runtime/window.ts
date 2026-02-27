import { approvalService } from '@unisat/wallet-background';

import { winMgr } from '../webapi';

export function initWindow() {
  winMgr.event.on('windowRemoved', (winId: number) => {
    if (winId === approvalService.approvalWindowId) {
      approvalService.approvalWindowId = 0;
      approvalService.rejectApproval();
    }
  });

  winMgr.event.on('windowFocusChange', (winId: number) => {
    // todo
  });

  approvalService.platformOpenWindow = async (winProps) => {
    if (approvalService.approvalWindowId) {
      winMgr.remove(approvalService.approvalWindowId);
    }
    const winId = await winMgr.openNotification(winProps);
    return winId || 1;
  };

  approvalService.platformCloseWindow = async (winId) => {
    await winMgr.remove(winId);
  };
}

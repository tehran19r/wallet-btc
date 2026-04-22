import { approvalService } from '@unisat/wallet-background';

import { winMgr } from '../webapi';

export function initWindow() {
  winMgr.event.on('windowRemoved', (winId: number) => {
    approvalService.handleWindowRemoved(winId);
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

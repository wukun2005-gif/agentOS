import { SAVED_MINUTES, type WeeklyReport } from '../agents/types'

/**
 * 周报 mock（PRD v1.0 §4.2.7 智能周报生成）
 *
 * 数据聚合口径：邮件往来 / Git 提交 / 任务完成情况 / 会议参与 / 文档编辑
 * 价值量化：原来 1-2 小时 → 5 分钟确认，取中位节省 105 分钟。
 */
export const MOCK_WEEKLY_REPORT: WeeklyReport = {
  id: 'w1',
  range: '9 月 1 日 - 9 月 5 日',
  headline: '本周主线是 Q3 增长复盘与产品评审准备，2 个需求延期待跟进。',
  stats: [
    { label: '完成需求', value: '5', delta: '+2' },
    { label: '修复 Bug', value: '12', delta: '+5' },
    { label: '参与会议', value: '8', delta: '-3' },
    { label: '代码提交', value: '47', delta: '+11' },
  ],
  done: [
    '上线「增长实验台账」自动汇总，替代每周手工整理',
    '完成内容矩阵改版二期的产品评审并锁定方案 A',
    '修复支付回调超时导致的订单状态不同步（P1）',
  ],
  risks: [
    '数据迁移依赖李四的测试资源，9/15 前未确认将影响 10/15 上线',
    'Q3 增长复盘缺少渠道侧的归因数据，需运营补充',
  ],
  nextWeek: [
    '完成 UI 设计稿 v3 评审（张三，9/20 前）',
    '推进数据迁移灰度方案，确认测试资源',
    '输出 10 月增长策略初稿',
  ],
  savedMinutes: SAVED_MINUTES.weeklyReport,
}

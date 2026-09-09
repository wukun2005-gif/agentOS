/**
 * 通用清单产物数据（PRD v1.0 §4 具体子诉求）
 *
 * 由来：同一个意图下面，不同 prompt 文案承诺的是不同的结果。
 * 例如 brief 的「今天有什么必须我拍板的」和「给我一份晨间简报」
 * 都命中 brief，但用户期待的产物完全不同。原 factory 对这些文案
 * 一律返回写死的「通用简报 + 会议纪要」，导致货不对板（用户原话痛点）。
 *
 * 这里用一份通用 ListResult 契约承载所有"具体子诉求"，让每条 prompt
 * 都能产出货真价实的清单，而不是同一个模板。
 *
 * 所有数据均为 mock（PRD §1.4 Non-Goals），但数值口径来自 PRD §2 调研：
 * 邮件 117 封/天、会议 5-8 个/天、55% 会议可用邮件替代、IM 153 条/天。
 */

import type { ListResult } from '../agents/types'

/* ===================== 晨间简报（brief） ===================== */

export const BriefLists = {
  /** 「今天有什么必须我拍板的？」 */
  decisions(): ListResult {
    return {
      id: 'brief-decisions',
      title: '今天需要你拍板的事项',
      subtitle: '3 项 · 各约 5 分钟，别让团队卡住',
      items: [
        {
          id: 'd1',
          icon: 'gavel',
          title: '供应商合同续约',
          detail: '市场部在等盖章，今天 18:00 截止',
          tag: '今天截止',
          tone: 'warn',
        },
        {
          id: 'd2',
          icon: 'groups',
          title: 'Q4 招聘 HC：冻结还是放开',
          detail: 'CEO 周一在群里问过，还未回复',
          tag: 'CEO 在等',
          tone: 'warn',
        },
        {
          id: 'd3',
          icon: 'payments',
          title: '新版定价方案 A / B 二选一',
          detail: '影响本季 GMV 预估，财务等结论',
          tag: '影响营收',
          tone: 'danger',
        },
      ],
      savedMinutes: 25,
    }
  },

  /** 「帮我安排一下今天的日程」 */
  schedule(): ListResult {
    return {
      id: 'brief-schedule',
      title: '今天的日程建议',
      subtitle: '8 个会议 · 已按能量曲线重排',
      items: [
        { id: 's1', icon: 'event', title: '09:30 需求评审', detail: '重要，已保留（需你定 scope）', tag: '保留' },
        { id: 's2', icon: 'event', title: '10:00 产品评审', detail: '会前材料已备好', tag: '保留' },
        { id: 's3', icon: 'event', title: '14:00–16:00 深度工作块', detail: '已保护，请勿排会', tag: '已锁', tone: 'primary' },
        { id: 's4', icon: 'event', title: '17:00 与直属 1:1', detail: '可挪到明天上午', tag: '可挪', tone: 'muted' },
      ],
      savedMinutes: 15,
    }
  },

  /** 「早上好，昨晚有什么紧急的」 */
  overnightUrgent(): ListResult {
    return {
      id: 'brief-overnight',
      title: '隔夜紧急事项',
      subtitle: '昨晚 22:00 后新增 2 项需你知会',
      items: [
        {
          id: 'o1',
          icon: 'error',
          title: '生产环境 P2 告警',
          detail: '已自动恢复，待你确认无需回滚',
          tag: '已恢复',
          tone: 'muted',
        },
        {
          id: 'o2',
          icon: 'description',
          title: '客户 A 合同被退回修改',
          detail: '对方要求今 10:00 前重发',
          tag: '今 10:00',
          tone: 'warn',
        },
        {
          id: 'o3',
          icon: 'trending_down',
          title: '美股盘后大跌 · 竞品财报不及预期',
          detail: '仅供参考，不影响今日排期',
          tag: '参考',
          tone: 'muted',
        },
      ],
      savedMinutes: 10,
    }
  },

  /** 「今天 8 个会，哪些其实可以不去」 — 用户原话痛点 */
  meetingValue(): ListResult {
    return {
      id: 'brief-meetingValue',
      title: '今天 8 个会 · 哪些可以不去',
      subtitle: '按「是否需你决策 / 能否邮件替代」评估（PRD §2.2.4：55% 会议可替代）',
      items: [
        { id: 'm1', icon: 'groups', title: '09:00 部门晨会', detail: '看录播即可，无你的决策点', tag: '可跳过', tone: 'muted' },
        { id: 'm2', icon: 'groups', title: '09:30 需求评审', detail: '需你拍板 scope，不可替代', tag: '必去', tone: 'danger' },
        { id: 'm3', icon: 'groups', title: '10:00 产品评审', detail: '会前材料已备好', tag: '必去' },
        { id: 'm4', icon: 'groups', title: '11:00 站会', detail: '文字同步即可', tag: '可跳过', tone: 'muted' },
        { id: 'm5', icon: 'groups', title: '13:30 跨团队同步', detail: '纪要代读，无需在场', tag: '可委派', tone: 'muted' },
        { id: 'm6', icon: 'groups', title: '14:00 OOM 复盘', detail: '你只需看结论文档', tag: '可跳过', tone: 'muted' },
        { id: 'm7', icon: 'groups', title: '15:00 设计走查', detail: '需你确认视觉方向', tag: '必去' },
        { id: 'm8', icon: 'groups', title: '16:30 周会', detail: '周报代替，无需参加', tag: '可跳过', tone: 'muted' },
      ],
      savedMinutes: 90,
    }
  },
}

/* ===================== 邮件（email） ===================== */

export const EmailLists = {
  /** 「哪些邮件拖了 3 天还没回？」 */
  overdue(): ListResult {
    return {
      id: 'email-overdue',
      title: '超时未回复的邮件',
      subtitle: '拖了 3 天以上 · 5 封，3 封有风险',
      items: [
        { id: 'e1', icon: 'mail', title: '客户 B 报价方案', detail: '已拖 5 天，对方已二次追问', tag: '5 天', tone: 'danger' },
        { id: 'e2', icon: 'mail', title: '法务 NDA 签署', detail: '已拖 4 天，阻塞合作启动', tag: '4 天', tone: 'warn' },
        { id: 'e3', icon: 'mail', title: '候选人面试反馈', detail: '已拖 3 天，影响 offer 进度', tag: '3 天', tone: 'warn' },
      ],
      savedMinutes: 12,
    }
  },

  /** 「收件箱 117 封，按紧急程度排一下」 */
  byUrgency(): ListResult {
    return {
      id: 'email-urgency',
      title: '收件箱按紧急排序',
      subtitle: '117 封 · 顶部 6 封最紧急（其余已智能折叠）',
      items: [
        { id: 'u1', icon: 'priority_high', title: 'CEO：Q4 战略对齐', detail: '今 12:00 前回复', tag: 'VIP', tone: 'danger' },
        { id: 'u2', icon: 'priority_high', title: '客户 A 合同退回', detail: '今 10:00 前重发', tag: '紧急', tone: 'warn' },
        { id: 'u3', icon: 'priority_high', title: '财务：报销被驳回', detail: '需补发票，周五截止', tag: '紧急', tone: 'warn' },
        { id: 'u4', icon: 'mark_email_unread', title: '团队周报 5 封', detail: '已读，无动作', tag: '稍后', tone: 'muted' },
        { id: 'u5', icon: 'mark_email_unread', title: '3 个日历更新', detail: '已接受，无动作', tag: '稍后', tone: 'muted' },
        { id: 'u6', icon: 'forum', title: '2 个群 @ 你', detail: '见沟通摘要', tag: '待回', tone: 'muted' },
      ],
      savedMinutes: 18,
    }
  },

  /** 「把不重要的邮件批量归档」 — external-action 二次确认 */
  archive(): ListResult {
    return {
      id: 'email-archive',
      title: '建议批量归档',
      subtitle: '识别 73 封低价值邮件（推广 / 通知 / 已读）',
      items: [
        { id: 'a1', icon: 'campaign', title: '12 封产品周报', detail: '已全部读毕', tag: '推广', tone: 'muted' },
        { id: 'a2', icon: 'notifications', title: '28 封 Jira 通知', detail: '无指派给你', tag: '通知', tone: 'muted' },
        { id: 'a3', icon: 'event', title: '33 封日历邀请', detail: '已接受，无需留存', tag: '已读', tone: 'muted' },
      ],
      confirmLabel: '确认归档 73 封',
      doneLabel: '已归档 73 封 · 收件箱从 117 降到 44 封',
      savedMinutes: 15,
    }
  },

  /** 「帮我起草一封婉拒的邮件」 */
  declineDraft(): ListResult {
    return {
      id: 'email-decline',
      title: '婉拒邮件草稿',
      subtitle: '基于上下文拟好要点，发送前可改',
      items: [
        { id: 'c1', icon: 'person', title: '致：会议发起人', detail: '本周需求评审已排满，无法新增' },
        { id: 'c2', icon: 'block', title: '原因：当前优先级冲突', detail: 'Q4 战略材料今明两日交付' },
        { id: 'c3', icon: 'alt_route', title: '替代方案：异步文档 + 改期', detail: '可周五 1:1 口述结论' },
      ],
      confirmLabel: '生成完整草稿',
      doneLabel: '草稿已生成，可在邮件卡片编辑后发送',
      savedMinutes: 8,
    }
  },
}

/* ===================== 会议（meeting） ===================== */

export const MeetingLists = {
  /** 「刚才的会议里哪些 action 归我」 */
  myActions(): ListResult {
    return {
      id: 'meeting-myActions',
      title: '本次会议 · 归你的行动项',
      subtitle: '4 项决议中 2 项指派给你',
      items: [
        { id: 'ma1', icon: 'task_alt', title: '周一前发出评审会结论', detail: 'owner：你 · 3 人等待', tag: '周一', tone: 'warn' },
        { id: 'ma2', icon: 'task_alt', title: '更新 PRD 定价章节', detail: 'owner：你 · 本周四前', tag: '本周', tone: 'warn' },
      ],
      savedMinutes: 20,
    }
  },

  /** 「这场会议一封邮件就能说清，帮我推掉」 — external-action 二次确认 */
  declineMeeting(): ListResult {
    return {
      id: 'meeting-decline',
      title: '推掉这场会议',
      subtitle: '议题可邮件替代（PRD §2.2.4：55% 会议可替代）',
      items: [
        { id: 'md1', icon: 'forum', title: '议题：需求澄清', detail: '文字 + 文档链接即可说清' },
        { id: 'md2', icon: 'groups', title: '参会人：3 人', detail: '其中 2 人已同意改异步' },
        { id: 'md3', icon: 'schedule', title: '原定：今天 15:30 / 30 分钟', detail: '腾出后可并入深度工作块', tag: '省 30m', tone: 'primary' },
      ],
      confirmLabel: '发取消邮件给 3 人',
      doneLabel: '取消邮件已发送，会议移出日程',
      savedMinutes: 30,
    }
  },

  /** 「把评审会结论同步给没参会的同学」 — external-action 二次确认 */
  syncMinutes(): ListResult {
    return {
      id: 'meeting-sync',
      title: '同步评审会结论',
      subtitle: '6 人未参会，需知会 3 决策 + 2 行动项',
      items: [
        { id: 'ms1', icon: 'check_circle', title: '决策 ① 定价走方案 B', detail: '已记录，待财务落表' },
        { id: 'ms2', icon: 'check_circle', title: '决策 ② 需求 scope 冻结', detail: '本迭代不再加需求' },
        { id: 'ms3', icon: 'task_alt', title: '行动 ①② 指派给你', detail: '周一发结论 / 周四更 PRD' },
        { id: 'ms4', icon: 'groups', title: '接收人：未参会 6 人', detail: '飞书群 + 邮件', tag: '6 人' },
      ],
      confirmLabel: '发送同步消息',
      doneLabel: '同步消息已发至 6 人',
      savedMinutes: 20,
    }
  },
}

/* ===================== 沟通摘要（message） ===================== */

export const MessageLists = {
  /** 「#project-alpha 提到我什么」 */
  mentions(): ListResult {
    return {
      id: 'message-mentions',
      title: '#project-alpha 提到你的消息',
      subtitle: '今天 3 条 @ 你，2 条待回',
      items: [
        { id: 'mm1', icon: 'alternate_email', title: '张三：接口约定确认下', detail: '卡在他联调，等你定', tag: '@你', tone: 'warn' },
        { id: 'mm2', icon: 'alternate_email', title: '李四：这个 PR 等你 review', detail: '已挂 1 天', tag: '@你', tone: 'warn' },
        { id: 'mm3', icon: 'alternate_email', title: '王五：周报数据用了你的口径', detail: '已采纳，无需动作', tag: '@你', tone: 'muted' },
      ],
      savedMinutes: 8,
    }
  },

  /** 「群里谁还在等我答复？」 */
  awaiting(): ListResult {
    return {
      id: 'message-awaiting',
      title: '在等你就绪的同事',
      subtitle: '3 人卡在你这，最长已 2 天',
      items: [
        { id: 'aw1', icon: 'hourglass_empty', title: '张三 等接口定义', detail: '已拖 2 天，阻塞联调', tag: '2 天', tone: 'danger' },
        { id: 'aw2', icon: 'hourglass_empty', title: '产品 等定价口径', detail: '今天需给，影响文案', tag: '急', tone: 'warn' },
        { id: 'aw3', icon: 'hourglass_empty', title: '设计 等视觉方向', detail: '15:00 走查要用', tag: '今', tone: 'warn' },
      ],
      savedMinutes: 10,
    }
  },

  /** 「把群里今天的结论整理成要点」 */
  takeaways(): ListResult {
    return {
      id: 'message-takeaways',
      title: '群聊结论要点',
      subtitle: '#growth 今天 153 条 → 4 个结论',
      items: [
        { id: 'tk1', icon: 'lightbulb', title: '增长目标上调 15%', detail: 'CEO 已批，下季执行' },
        { id: 'tk2', icon: 'lightbulb', title: '砍掉 2 个低 ROI 渠道', detail: '本月底停投' },
        { id: 'tk3', icon: 'lightbulb', title: '新拉新活动周五上线', detail: '你负责埋点验收' },
        { id: 'tk4', icon: 'lightbulb', title: '周报模板统一', detail: '用新版，旧版废弃' },
      ],
      savedMinutes: 25,
    }
  },

  /** 「飞书里有没有要我跟进的」 */
  followups(): ListResult {
    return {
      id: 'message-followups',
      title: '飞书待跟进',
      subtitle: '跨 4 个群 · 5 项需你推进',
      items: [
        { id: 'fl1', icon: 'task_alt', title: '给候选人发 offer', detail: 'HR 在等，今天', tag: '今天', tone: 'warn' },
        { id: 'fl2', icon: 'task_alt', title: '回复客户验收邮件', detail: '昨天的，未回', tag: '昨天' },
        { id: 'fl3', icon: 'task_alt', title: '更新竞品监控表', detail: '本周，你 owner', tag: '本周' },
        { id: 'fl4', icon: 'task_alt', title: '约设计 1:1', detail: '两周没聊了', tag: '待约', tone: 'muted' },
        { id: 'fl5', icon: 'task_alt', title: '确认服务器续费', detail: '财务已催', tag: '财务', tone: 'muted' },
      ],
      savedMinutes: 15,
    }
  },
}

/* ===================== 文档检索（doc） ===================== */

export const DocLists = {
  /** 「找一下最新版本，别给我旧版」 */
  latestVersion(): ListResult {
    return {
      id: 'doc-latest',
      title: '《产品 PRD》版本',
      subtitle: '共 4 个版本 · 已标最新',
      items: [
        { id: 'lv1', icon: 'description', title: 'v3.2 最新', detail: '今天 11:20 更新 · 你改了定价章节', tag: '最新', tone: 'primary' },
        { id: 'lv2', icon: 'description', title: 'v3.1', detail: '昨天 · 评审前版本', tag: '旧版', tone: 'muted' },
        { id: 'lv3', icon: 'description', title: 'v2.0', detail: '上周 · 大改前', tag: '旧版', tone: 'muted' },
        { id: 'lv4', icon: 'description', title: 'v1.0', detail: '初稿', tag: '初稿', tone: 'muted' },
      ],
      savedMinutes: 6,
    }
  },

  /** 「这份 40 页文档帮我提炼要点」 */
  highlights(): ListResult {
    return {
      id: 'doc-highlights',
      title: '《增长复盘》要点提炼',
      subtitle: '40 页 → 6 个要点',
      items: [
        { id: 'h1', icon: 'trending_up', title: '新用户环比 +22%', detail: '主因渠道 B 放量' },
        { id: 'h2', icon: 'trending_down', title: '次留跌 3pt', detail: '新 onboarding 实验负向' },
        { id: 'h3', icon: 'payments', title: 'ARPU 提升 8%', detail: '会员提价生效' },
        { id: 'h4', icon: 'warning', title: '获客成本超阈值', detail: '渠道 C 需止损' },
        { id: 'h5', icon: 'groups', title: 'Top3 来源占 70%', detail: '集中度风险' },
        { id: 'h6', icon: 'flag', title: '下季重点：留存', detail: '复盘结论一致' },
      ],
      savedMinutes: 16,
    }
  },

  /** 「谁最近改过这份文档？」 */
  changeHistory(): ListResult {
    return {
      id: 'doc-changes',
      title: '《Q3 预算》变更历史',
      subtitle: '近 7 天 4 次改动',
      items: [
        { id: 'ch1', icon: 'edit', title: '你 · 调整市场预算', detail: '今天 09:40', tag: '你' },
        { id: 'ch2', icon: 'edit', title: '财务小李 · 修正公式', detail: '昨天 17:10', tag: '财务' },
        { id: 'ch3', icon: 'edit', title: 'CEO · 批注战略项', detail: '2 天前', tag: 'CEO', tone: 'warn' },
        { id: 'ch4', icon: 'edit', title: '你 · 初建预算', detail: '5 天前', tag: '你' },
      ],
      savedMinutes: 5,
    }
  },
}

/* ===================== 智能周报（report） ===================== */

export const ReportLists = {
  /** 「本周总结里帮我标出卡住的事」 */
  blockers(): ListResult {
    return {
      id: 'report-blockers',
      title: '本周卡住的事',
      subtitle: '3 项阻塞，需上升或协调',
      items: [
        { id: 'b1', icon: 'block', title: '定价方案未定', detail: '卡 PRD 终稿，等 CEO 拍板', tag: '等决策', tone: 'danger' },
        { id: 'b2', icon: 'block', title: '联调环境宕机', detail: '已 2 天，研发阻塞', tag: '2 天', tone: 'warn' },
        { id: 'b3', icon: 'block', title: '设计资源紧缺', detail: '走查排到下周', tag: '资源', tone: 'warn' },
      ],
      savedMinutes: 20,
    }
  },

  /** 「今天做了什么？明天先干什么？」 */
  todayReview(): ListResult {
    return {
      id: 'report-todayReview',
      title: '今日复盘 · 明日计划',
      subtitle: '基于今日活动自动归集',
      items: [
        { id: 'tr1', icon: 'check_circle', title: '今日 · 评审会结论发出', detail: '已同步 6 人', tag: 'done', tone: 'primary' },
        { id: 'tr2', icon: 'check_circle', title: '今日 · 客户 A 合同重发', detail: '今 10:00 前完成', tag: 'done', tone: 'primary' },
        { id: 'tr3', icon: 'check_circle', title: '今日 · 深度工作 120 分钟', detail: 'PRD 定价章节草稿', tag: 'done', tone: 'primary' },
        { id: 'tr4', icon: 'arrow_forward', title: '明日 · 定稿 PRD', detail: '等 CEO 定价决策', tag: '先', tone: 'warn' },
        { id: 'tr5', icon: 'arrow_forward', title: '明日 · 发候选人 offer', detail: 'HR 已催', tag: '先', tone: 'warn' },
        { id: 'tr6', icon: 'arrow_forward', title: '明日 · 联调环境复盘', detail: '推动恢复', tag: '先' },
      ],
      savedMinutes: 15,
    }
  },
}

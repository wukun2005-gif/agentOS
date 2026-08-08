// charts.js — 竞品能力雷达图
(function() {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim() || '#00e5cc';
  var accent2 = style.getPropertyValue('--accent2').trim() || '#7c5cff';
  var accent3 = style.getPropertyValue('--accent3').trim() || '#ffb84d';
  var ink = style.getPropertyValue('--ink').trim() || '#e8edf5';
  var muted = style.getPropertyValue('--muted').trim() || '#8b95a8';
  var rule = style.getPropertyValue('--rule').trim() || '#1e2535';

  var chartDom = document.getElementById('chart-radar');
  if (!chartDom || typeof echarts === 'undefined') return;

  var chart = echarts.init(chartDom);

  var indicators = [
    { name: 'AI 存在感', max: 10 },
    { name: '状态反馈', max: 10 },
    { name: '非列表涌现', max: 10 },
    { name: '空间化布局', max: 10 },
    { name: '克制程度', max: 10 },
    { name: '技术可行性', max: 10 }
  ];

  var series = [
    {
      name: 'Siri (Apple)',
      value: [7, 6, 3, 4, 8, 9],
      itemStyle: { color: accent },
      areaStyle: { opacity: 0.08 },
      lineStyle: { width: 2 }
    },
    {
      name: 'ChatGPT AVM',
      value: [8, 7, 2, 2, 6, 8],
      itemStyle: { color: accent2 },
      areaStyle: { opacity: 0.08 },
      lineStyle: { width: 2 }
    },
    {
      name: 'Rabbit R1',
      value: [6, 5, 3, 2, 5, 6],
      itemStyle: { color: accent3 },
      areaStyle: { opacity: 0.08 },
      lineStyle: { width: 2 }
    },
    {
      name: 'Humane AI Pin',
      value: [7, 5, 3, 3, 6, 4],
      itemStyle: { color: '#ff5c7a' },
      areaStyle: { opacity: 0.06 },
      lineStyle: { width: 2 }
    },
    {
      name: 'visionOS',
      value: [5, 6, 7, 9, 8, 7],
      itemStyle: { color: '#10b981' },
      areaStyle: { opacity: 0.06 },
      lineStyle: { width: 2 }
    },
    {
      name: '本 Demo (Aura OS)',
      value: [9, 9, 8, 9, 9, 8],
      itemStyle: { color: '#ffffff' },
      areaStyle: { opacity: 0.12 },
      lineStyle: { width: 3, type: 'dashed' }
    }
  ];

  var option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(10,14,26,0.95)',
      borderColor: rule,
      borderWidth: 1,
      textStyle: { color: ink, fontSize: 13 }
    },
    legend: {
      bottom: 0,
      textStyle: { color: muted, fontSize: 11 },
      itemWidth: 14,
      itemHeight: 8,
      itemGap: 16
    },
    radar: {
      indicator: indicators,
      center: ['50%', '48%'],
      radius: '62%',
      axisName: {
        color: ink,
        fontSize: 12,
        fontWeight: 600
      },
      splitArea: {
        areaStyle: {
          color: ['rgba(0,229,204,0.02)', 'rgba(0,229,204,0.04)', 'rgba(0,229,204,0.02)', 'rgba(0,229,204,0.06)']
        }
      },
      axisLine: {
        lineStyle: { color: rule }
      },
      splitLine: {
        lineStyle: { color: rule }
      }
    },
    series: [{
      type: 'radar',
      data: series
    }]
  };

  chart.setOption(option);

  // Responsive resize
  window.addEventListener('resize', function() {
    chart.resize();
  });
})();

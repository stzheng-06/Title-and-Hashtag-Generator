import type { HistoryItem } from '@/types'

// 导出为 CSV 格式
export function exportToCSV(history: HistoryItem[], filename: string = 'export.csv'): void {
  const headers = ['日期', '关键词', '标题', '标签', '配置', '模型']

  const rows = history.map(item => [
    item.createdAt,
    `"${item.keywords.join(', ')}"`,
    `"${item.titles.join(', ')}"`,
    `"${item.tags.join(', ')}"`,
    item.configName,
    item.model,
  ])

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n')

  downloadFile(csvContent, filename, 'text/csv;charset=utf-8;')
}

// 导出为 JSON 格式
export function exportToJSON(history: HistoryItem[], filename: string = 'export.json'): void {
  const jsonContent = JSON.stringify(history, null, 2)
  downloadFile(jsonContent, filename, 'application/json')
}

// 导出为 TXT 格式
export function exportToTXT(history: HistoryItem[], filename: string = 'export.txt'): void {
  const content = history.map(item => {
    const titles = item.titles.join('\n  - ')
    const tags = item.tags.join(', ')
    return `日期: ${item.createdAt}
关键词: ${item.keywords.join(', ')}
配置: ${item.configName}
模型: ${item.model}

标题:
  - ${titles}

标签: ${tags}

${'='.repeat(50)}
`
  }).join('\n\n')

  downloadFile(content, filename, 'text/plain;charset=utf-8;')
}

// 通用下载函数
function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

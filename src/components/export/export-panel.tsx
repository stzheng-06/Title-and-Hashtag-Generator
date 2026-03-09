'use client'

import React, { useState } from 'react'
import { Download, FileText, FileJson, File, ChevronDown, ChevronRight } from 'lucide-react'
import { useHistoryStore } from '@/store/history-store'
import { exportToCSV, exportToJSON, exportToTXT } from '@/lib/export-utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Motion } from '@/components/ui/motion'

export function ExportPanel() {
  const { history } = useHistoryStore()
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [selectAll, setSelectAll] = useState(false)
  const [isPreviewExpanded, setIsPreviewExpanded] = useState(false)

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedIds(newSelected)
  }

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(history.map(item => item.id)))
    }
    setSelectAll(!selectAll)
  }

  const getSelectedHistory = () => {
    if (selectedIds.size === 0) {
      return history
    }
    return history.filter(item => selectedIds.has(item.id))
  }

  const handleExportCSV = () => {
    const data = getSelectedHistory()
    if (data.length === 0) return
    const timestamp = new Date().toISOString().slice(0, 10)
    exportToCSV(data, `titles-tags-${timestamp}.csv`)
  }

  const handleExportJSON = () => {
    const data = getSelectedHistory()
    if (data.length === 0) return
    const timestamp = new Date().toISOString().slice(0, 10)
    exportToJSON(data, `titles-tags-${timestamp}.json`)
  }

  const handleExportTXT = () => {
    const data = getSelectedHistory()
    if (data.length === 0) return
    const timestamp = new Date().toISOString().slice(0, 10)
    exportToTXT(data, `titles-tags-${timestamp}.txt`)
  }

  if (history.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center p-8 text-center space-y-4">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
            <Download className="h-8 w-8 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-medium">暂无历史记录</h3>
            <p className="text-muted-foreground max-w-sm">
              暂无数据可导出，请先生成一些内容
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* 标题 */}
      <div className="text-center space-y-2">
        <Motion from={{ opacity: 0, translateY: 10 }} duration={300}>
          <h2 className="text-2xl font-bold">导出管理</h2>
        </Motion>
        <Motion from={{ opacity: 0, translateY: 10 }} duration={300} delay={100}>
          <p className="text-muted-foreground">
            选择历史记录并导出为 CSV、JSON 或 TXT 格式
          </p>
        </Motion>
      </div>

      {/* 选择控制 */}
      <Motion from={{ opacity: 0, translateY: 10 }} duration={300} delay={200}>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectAll}
                    onChange={toggleSelectAll}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">全选 ({history.length} 条)</span>
                </label>
                {selectedIds.size > 0 && (
                  <span className="text-sm text-muted-foreground">
                    已选择 {selectedIds.size} 条
                  </span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </Motion>

      {/* 导出格式 */}
      <Card>
        <CardHeader className="py-3">
          <CardTitle className="text-base">导出格式</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-3 gap-4">
            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={handleExportCSV}>
              <CardContent className="flex flex-col items-center justify-center p-4 space-y-2">
                <FileText className="h-8 w-8 text-green-600" />
                <div className="text-center">
                  <p className="font-medium">CSV</p>
                  <p className="text-xs text-muted-foreground">Excel</p>
                </div>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={handleExportJSON}>
              <CardContent className="flex flex-col items-center justify-center p-4 space-y-2">
                <FileJson className="h-8 w-8 text-orange-600" />
                <div className="text-center">
                  <p className="font-medium">JSON</p>
                  <p className="text-xs text-muted-foreground">数据</p>
                </div>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={handleExportTXT}>
              <CardContent className="flex flex-col items-center justify-center p-4 space-y-2">
                <File className="h-8 w-8 text-blue-600" />
                <div className="text-center">
                  <p className="font-medium">TXT</p>
                  <p className="text-xs text-muted-foreground">文本</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* 预览 - 可折叠 */}
      <Card>
        <CardHeader className="py-3 cursor-pointer" onClick={() => setIsPreviewExpanded(!isPreviewExpanded)}>
          <div className="flex items-center gap-2">
            {isPreviewExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            <CardTitle className="text-base">数据预览 ({getSelectedHistory().length} 条)</CardTitle>
          </div>
        </CardHeader>
        <div
          className={`overflow-hidden transition-all duration-300 ${
            isPreviewExpanded ? 'max-h-[400px] opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <CardContent className="pt-0 pb-4">
            <div className="max-h-64 overflow-y-auto space-y-2">
              {getSelectedHistory().slice(0, 10).map(item => (
                <div key={item.id} className="flex items-center gap-2 text-sm p-2 bg-muted rounded">
                  <input
                    type="checkbox"
                    checked={selectedIds.size === 0 || selectedIds.has(item.id)}
                    onChange={() => toggleSelect(item.id)}
                    className="w-4 h-4"
                  />
                  <span className="truncate flex-1">
                    {item.keywords.join(', ')}
                  </span>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {item.titles.length} 标题 · {item.tags.length} 标签
                  </span>
                </div>
              ))}
              {getSelectedHistory().length > 10 && (
                <p className="text-xs text-muted-foreground text-center">
                  还有 {getSelectedHistory().length - 10} 条数据...
                </p>
              )}
            </div>
          </CardContent>
        </div>
      </Card>
    </div>
  )
}

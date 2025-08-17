'use client'

import React, { useState, type KeyboardEvent } from 'react'
import { X } from 'lucide-react'
import { Badge } from './badge'
import { Input } from './input'
import { cn } from '@/lib/utils'

interface TagInputProps {
  tags: string[]
  onTagsChange: (tags: string[]) => void
  placeholder?: string
  className?: string
  maxTags?: number
}

export function TagInput({ 
  tags, 
  onTagsChange, 
  placeholder = "输入标签后按回车添加", 
  className,
  maxTags = 50
}: TagInputProps) {
  const [inputValue, setInputValue] = useState('')

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addTag()
    } else if (e.key === 'Backspace' && inputValue === '' && tags.length > 0) {
      removeTag(tags.length - 1)
    }
  }

  const addTag = () => {
    const newTag = inputValue.trim().toLowerCase()
    if (newTag && !tags.includes(newTag) && tags.length < maxTags) {
      onTagsChange([...tags, newTag])
      setInputValue('')
    }
  }

  const removeTag = (index: number) => {
    const newTags = tags.filter((_, i) => i !== index)
    onTagsChange(newTags)
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex flex-wrap gap-2 min-h-[2.5rem] p-3 border rounded-md bg-background">
        {tags.map((tag, index) => (
          <Badge key={index} variant="secondary" className="px-2 py-1">
            {tag}
            <button
              type="button"
              onClick={() => removeTag(index)}
              className="ml-1 hover:bg-destructive hover:text-destructive-foreground rounded-full p-0.5"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
        <Input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={addTag}
          placeholder={tags.length === 0 ? placeholder : ''}
          className="border-none shadow-none focus-visible:ring-0 flex-1 min-w-[120px]"
        />
      </div>
      <div className="text-sm text-muted-foreground">
        {tags.length}/{maxTags} 标签 · 按回车或逗号添加标签
      </div>
    </div>
  )
}

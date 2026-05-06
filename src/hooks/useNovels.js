import { useState, useEffect } from 'react'

const GITHUB_API = 'https://api.github.com'
const REPO_OWNER = 'andywhite029'
const REPO_NAME = 'andywhite029.github.io'
const NOVEL_LABEL = 'novel'

export function useNovels() {
  const [novels, setNovels] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchNovels = async () => {
      try {
        const response = await fetch(
          `${GITHUB_API}/repos/${REPO_OWNER}/${REPO_NAME}/issues?labels=${NOVEL_LABEL}&state=open&per_page=100`
        )

        if (!response.ok) {
          throw new Error('获取小说失败')
        }

        const issues = await response.json()

        // 按小说分组
        const novelsMap = {}
        issues.forEach((issue) => {
          // 从标题解析: "小说名 | 第X章 标题" 或 "小说名 - 第X章 标题"
          const parts = issue.title.split(/[|]/)
          if (parts.length < 2) return

          const novelName = parts[0].trim()
          const chapterInfo = parts[1].trim()

          if (!novelsMap[novelName]) {
            // 尝试从 issue body 获取小说信息
            const lines = (issue.body || '').split('\n')
            novelsMap[novelName] = {
              id: novelName,
              name: novelName,
              description: lines.find(l => l.startsWith('简介:'))?.replace('简介:', '').trim() || '',
              author: lines.find(l => l.startsWith('作者:'))?.replace('作者:', '').trim() || 'Andy',
              chapters: [],
            }
          }

          // 解析章节信息
          const chapterMatch = chapterInfo.match(/第([零一二三四五六七八九十百千万0-9]+)章\s*(.*)/)
          if (chapterMatch) {
            novelsMap[novelName].chapters.push({
              id: issue.id,
              number: chapterMatch[1],
              title: chapterMatch[2] || chapterInfo,
              content: issue.body,
              url: issue.html_url,
              createdAt: issue.created_at,
              updatedAt: issue.updated_at,
            })
          }
        })

        // 按创建时间排序章节
        Object.values(novelsMap).forEach((novel) => {
          novel.chapters.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
        })

        setNovels(Object.values(novelsMap))
        setLoading(false)
      } catch (err) {
        setError(err.message)
        setLoading(false)
      }
    }

    fetchNovels()
  }, [])

  return { novels, loading, error }
}

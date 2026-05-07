import { useState, useEffect } from 'react'

// 开发环境使用本地服务器，生产环境使用相对路径
const API_BASE = import.meta.env.DEV
  ? 'http://localhost:3001'
  : '/api'

export function useNovels() {
  const [novels, setNovels] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchNovels = async () => {
      try {
        const response = await fetch(`${API_BASE}/novels`)

        if (!response.ok) {
          throw new Error('获取小说失败')
        }

        const data = await response.json()
        setNovels(data.novels || [])
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

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Clock, Tag } from 'lucide-react'
import PhotoWall from '../components/PhotoWall'
import Footer from '../components/Footer'
import { skills } from '../data/skills'
import { timeline } from '../data/timeline'
import { projects } from '../data/projects'
import { blogPosts } from '../data/blogPosts'

const allTags = ['全部', ...new Set(blogPosts.flatMap((p) => p.tags))]

function GlassCard({ children, className = '' }) {
  return (
    <div
      className={`bg-bg-primary/70 backdrop-blur-md rounded-3xl shadow-lg gradient-border ${className}`}
    >
      {children}
    </div>
  )
}

export default function Home() {
  const [selectedTag, setSelectedTag] = useState('全部')
  const [showAll, setShowAll] = useState(false)
  const [mousePos, setMousePos] = useState({ x: -1000, y: -1000 })

  // 鼠标跟随光晕效果
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY })
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  const filteredPosts =
    selectedTag === '全部'
      ? blogPosts
      : blogPosts.filter((p) => p.tags.includes(selectedTag))

  const displayedPosts = showAll ? filteredPosts : filteredPosts.slice(0, 5)
  const hasMore = filteredPosts.length > 5

  return (
    <div className="min-h-screen">
      {/* 鼠标跟随光晕 */}
      <div
        className="mouse-glow hidden md:block"
        style={{
          left: mousePos.x,
          top: mousePos.y,
        }}
      />

      <section className="min-h-screen flex items-center justify-center relative overflow-hidden">
        <PhotoWall />
        <div className="container mx-auto px-6 md:px-12 lg:px-24 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="w-full sm:w-11/12 md:w-4/5 lg:w-3/4 xl:w-2/3 2xl:w-1/2 mx-auto"
          >
            <GlassCard className="p-8 md:p-12 lg:p-16 relative overflow-hidden">
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-text-secondary font-medium tracking-widest uppercase text-sm mb-6"
              >
                welcome to my world
              </motion.p>

              <motion.h1
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.1 }}
                className="font-serif text-4xl md:text-6xl lg:text-7xl font-bold text-text-primary leading-tight mb-8"
              >
                {['在', '影', '像', '与', '文', '字', '之', '间'].map((char, i) => (
                  <motion.span
                    key={i}
                    initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    transition={{ delay: 0.5 + i * 0.06, duration: 0.5 }}
                    className="inline-block"
                  >
                    {char}
                  </motion.span>
                ))}
                <br />
                <span className="text-accent">
                  {['寻', '找', '意', '义'].map((char, i) => (
                    <motion.span
                      key={i + 8}
                      initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
                      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                      transition={{ delay: 1 + i * 0.08, duration: 0.5 }}
                      className="inline-block"
                    >
                      {char}
                    </motion.span>
                  ))}
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.5 }}
                className="text-lg md:text-xl text-text-secondary max-w-2xl mx-auto leading-relaxed"
              >
                我是Andy，一名热爱技术的创作者。这里记录着我的思考与生活。<br />
                期待与你相遇。
              </motion.p>
            </GlassCard>
          </motion.div>
        </div>
      </section>

      <section id="about" className="py-24">
        <div className="container mx-auto px-6 md:px-12 lg:px-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="w-full sm:w-11/12 md:w-4/5 lg:w-3/4 xl:w-2/3 2xl:w-1/2 mx-auto"
          >
            <GlassCard className="p-8 md:p-12 mb-8">
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-text-primary mb-8">
                关于我
              </h2>
              <div className="text-text-secondary text-base md:text-lg leading-relaxed mb-8 space-y-4 flex flex-col">
                <p>在品牌传播与舆情公关方面有丰富实战经验，有策划与执行线下会展商业活动经历，能够高效协同多方资源推动项目落地。</p>
                <p>擅长摄影摄像，熟悉影视制作流程，有多平台媒体运营、用户增长策略、紧急舆情公关经验。</p>
                <p>熟悉各种 AI 工具，使用 Cursor、Gemini 等工具独立制作网页、安卓 APP（代码见作品集），以及各类图文音频生成式 AI。</p>
              </div>

              <h3 className="font-serif text-xl font-bold text-text-primary mb-6">
                技能特长
              </h3>
              <div className="space-y-4 mb-8">
                {skills.map((skill, index) => (
                  <div key={skill.name}>
                    <div className="flex justify-between mb-2">
                      <span className="text-text-primary font-medium">{skill.name}</span>
                      <span className="text-text-secondary">{skill.level}%</span>
                    </div>
                    <div className="h-2 bg-bg-secondary rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${skill.level}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: index * 0.1 }}
                        className="h-full bg-accent rounded-full"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>

            <GlassCard className="p-8 md:p-12">
              <h3 className="font-serif text-xl font-bold text-text-primary mb-6">
                经历
              </h3>
              <div className="space-y-6">
                {timeline.map((item, index) => (
                  <motion.div
                    key={item.year}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="flex gap-6 border-b border-border/30 last:border-0 pb-6 last:pb-0"
                  >
                    <div className="flex-shrink-0 w-16 text-accent font-mono font-medium">
                      {item.year}
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-text-primary mb-1">
                        {item.company}
                      </h4>
                      <p className="text-text-secondary mb-1">{item.title}</p>
                      <p className="text-sm text-text-secondary">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </GlassCard>
          </motion.div>
        </div>
      </section>

      <section id="portfolio" className="py-24">
        <div className="container mx-auto px-6 md:px-12 lg:px-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="w-full sm:w-11/12 md:w-4/5 lg:w-3/4 xl:w-2/3 2xl:w-1/2 mx-auto"
          >
            <GlassCard className="p-8 md:p-12 mb-8">
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-text-primary mb-4">
                项目实践
              </h2>
              <p className="text-text-secondary text-lg mb-8">
                这里是我近年来的一些项目实践，涵盖从市场公关到软件代码的各类应用。
              </p>
            </GlassCard>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {projects.map((project, index) => (
                <motion.article
                  key={project.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                    <a href={project.link || '#'} target="_blank" rel="noopener noreferrer" className="group">
                    <GlassCard className="overflow-hidden hover:shadow-xl hover:shadow-accent/5 transition-all duration-300 cursor-pointer">
                      <div className="aspect-video bg-gradient-to-br from-border to-bg-secondary flex items-center justify-center overflow-hidden">
                        {project.image ? (
                          <img
                            src={project.image}
                            alt={project.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-4xl font-serif text-text-secondary/30">
                            {project.title.charAt(0)}
                          </span>
                        )}
                      </div>
                      <div className="p-6">
                        <h3 className="text-xl font-semibold text-text-primary group-hover:text-accent transition-colors mb-2">
                          {project.title}
                        </h3>
                        <p className="text-text-secondary text-sm mb-4">{project.desc}</p>
                        <div className="flex flex-wrap gap-2">
                          {project.tags.map((tag) => (
                            <span
                              key={tag}
                              className="px-3 py-1 bg-bg-secondary border border-border/50 rounded-full text-xs text-text-secondary"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </GlassCard>
                  </a>
                </motion.article>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <section id="blog" className="py-24">
        <div className="container mx-auto px-6 md:px-12 lg:px-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="w-full sm:w-11/12 md:w-4/5 lg:w-3/4 xl:w-2/3 2xl:w-1/2 mx-auto"
          >
            <GlassCard className="p-8 md:p-12 mb-8">
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-text-primary mb-4">
                博客
              </h2>
              <p className="text-text-secondary text-lg mb-8">
                关于技术、设计与生活的思考。
              </p>

              <div className="flex flex-wrap gap-3">
                {allTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => { setSelectedTag(tag); setShowAll(false) }}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      selectedTag === tag
                        ? 'bg-accent text-white'
                        : 'bg-bg-secondary text-text-secondary hover:bg-border'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </GlassCard>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {displayedPosts.map((post, index) => (
                <motion.article
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.08 }}
                >
                  {post.link ? (
                    <a href={post.link} target="_blank" rel="noopener noreferrer">
                      <GlassCard className="p-6 hover:shadow-xl transition-shadow cursor-pointer h-full">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-4 text-sm text-text-secondary">
                            <span>{post.date}</span>
                            <span className="flex items-center gap-1">
                              <Clock size={14} />
                              {post.readTime} 分钟
                            </span>
                          </div>
                          <span className="text-xs text-accent">阅读原文 →</span>
                        </div>
                        <h3 className="text-xl md:text-2xl font-semibold text-text-primary mb-3">
                          {post.title}
                        </h3>
                        <p className="text-text-secondary mb-4 line-clamp-3">{post.excerpt}</p>
                        <div className="flex flex-wrap gap-2">
                          {post.tags.map((tag) => (
                            <span
                              key={tag}
                              className="flex items-center gap-1 px-2 py-1 text-xs text-text-secondary"
                            >
                              <Tag size={12} />
                              {tag}
                            </span>
                          ))}
                        </div>
                      </GlassCard>
                    </a>
                  ) : (
                    <GlassCard className="p-6 h-full">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-4 text-sm text-text-secondary">
                          <span>{post.date}</span>
                          <span className="flex items-center gap-1">
                            <Clock size={14} />
                            {post.readTime} 分钟
                          </span>
                        </div>
                      </div>
                      <h3 className="text-xl md:text-2xl font-semibold text-text-primary mb-3">
                        {post.title}
                      </h3>
                      <p className="text-text-secondary mb-4 line-clamp-3">{post.excerpt}</p>
                      <div className="flex flex-wrap gap-2">
                        {post.tags.map((tag) => (
                          <span
                            key={tag}
                            className="flex items-center gap-1 px-2 py-1 text-xs text-text-secondary"
                          >
                            <Tag size={12} />
                            {tag}
                          </span>
                        ))}
                      </div>
                    </GlassCard>
                  )}
                </motion.article>
              ))}

              {hasMore && (
                <div className="col-span-1 md:col-span-2 flex justify-center pt-4">
                  <button
                    onClick={() => setShowAll(!showAll)}
                    className="px-6 py-3 bg-bg-secondary hover:bg-border text-text-primary rounded-full transition-colors"
                  >
                    {showAll ? '收起' : `查看更多 (${filteredPosts.length - 5})`}
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
